const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { google } = require('googleapis');

/**
 * Gmail API Server for TLDR App
 * Handles OAuth token exchange and real Gmail API calls
 */

const PORT = 3001;
const HOST = 'localhost';

// Store active Gmail service instances
const gmailServices = new Map();

class GmailService {
    constructor() {
        this.gmail = null;
        this.isAuthenticated = false;
        this.userEmail = null;
    }

    async initialize(credentials, authCode) {
        try {
            // Create OAuth2 client
            const oauth2Client = new google.auth.OAuth2(
                credentials.client_id,
                credentials.client_secret,
                credentials.redirect_uris[0]
            );

            // Exchange authorization code for tokens
            const { tokens } = await oauth2Client.getToken(authCode);
            oauth2Client.setCredentials(tokens);

            // Create Gmail API instance
            this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
            this.isAuthenticated = true;

            // Get user email
            const profile = await this.gmail.users.getProfile({ userId: 'me' });
            this.userEmail = profile.data.emailAddress;

            console.log('✅ Gmail API initialized successfully for:', this.userEmail);
            return { success: true, tokens, userEmail: this.userEmail };
        } catch (error) {
            console.error('❌ Gmail API initialization failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    async listEmails(options = {}) {
        try {
            const {
                maxResults = 20,
                query = '',
                labelIds = ['INBOX'],
                pageToken = null
            } = options;

            const response = await this.gmail.users.messages.list({
                userId: 'me',
                maxResults,
                q: query,
                labelIds,
                pageToken
            });

            const messages = response.data.messages || [];
            const emails = [];

            // Get full details for each email
            for (const message of messages) {
                const emailDetails = await this.getEmailDetails(message.id);
                emails.push(emailDetails);
            }

            return {
                emails,
                nextPageToken: response.data.nextPageToken,
                resultSizeEstimate: response.data.resultSizeEstimate
            };
        } catch (error) {
            console.error('❌ Failed to list emails:', error.message);
            throw error;
        }
    }

    async getEmailDetails(messageId) {
        try {
            const response = await this.gmail.users.messages.get({
                userId: 'me',
                id: messageId,
                format: 'full'
            });

            const message = response.data;
            const headers = message.payload.headers;
            
            return {
                id: message.id,
                threadId: message.threadId,
                snippet: message.snippet,
                subject: this.getHeaderValue(headers, 'Subject'),
                from: this.getHeaderValue(headers, 'From'),
                to: this.getHeaderValue(headers, 'To'),
                date: this.getHeaderValue(headers, 'Date'),
                labels: message.labelIds,
                isRead: !message.labelIds.includes('UNREAD'),
                hasAttachments: this.hasAttachments(message.payload),
                body: this.extractEmailBody(message.payload)
            };
        } catch (error) {
            console.error('❌ Failed to get email details:', error.message);
            throw error;
        }
    }

    async sendEmail(emailData) {
        try {
            const { to, subject, body, cc = '', bcc = '' } = emailData;
            
            // Create email message
            const message = this.createEmailMessage({
                to,
                subject,
                body,
                cc,
                bcc
            });

            // Encode message
            const encodedMessage = Buffer.from(message).toString('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=+$/, '');

            const response = await this.gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: encodedMessage
                }
            });

            console.log('✅ Email sent successfully:', response.data.id);
            return { success: true, messageId: response.data.id };
        } catch (error) {
            console.error('❌ Failed to send email:', error.message);
            return { success: false, error: error.message };
        }
    }

    // Helper methods
    getHeaderValue(headers, name) {
        const header = headers.find(h => h.name === name);
        return header ? header.value : '';
    }

    hasAttachments(payload) {
        if (payload.parts) {
            return payload.parts.some(part => part.filename && part.filename.length > 0);
        }
        return payload.filename && payload.filename.length > 0;
    }

    extractEmailBody(payload) {
        if (payload.parts) {
            // Find text/plain or text/html part
            const textPart = payload.parts.find(part => 
                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
            );
            if (textPart && textPart.body && textPart.body.data) {
                return Buffer.from(textPart.body.data, 'base64').toString();
            }
        } else if (payload.body && payload.body.data) {
            return Buffer.from(payload.body.data, 'base64').toString();
        }
        return '';
    }

    createEmailMessage({ to, subject, body, cc, bcc }) {
        const lines = [
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/plain; charset=utf-8`,
            `MIME-Version: 1.0`,
            ''
        ];

        if (cc) lines.splice(2, 0, `Cc: ${cc}`);
        if (bcc) lines.splice(2, 0, `Bcc: ${bcc}`);

        lines.push(body);
        return lines.join('\r\n');
    }

    isReady() {
        return this.isAuthenticated && this.gmail !== null;
    }
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`📥 ${req.method} ${req.url}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle Gmail API endpoints
    if (pathname === '/api/gmail/initialize' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { credentials, authCode } = JSON.parse(body);
                
                const gmailService = new GmailService();
                const result = await gmailService.initialize(credentials, authCode);
                
                if (result.success) {
                    // Store service instance
                    const serviceId = Date.now().toString();
                    gmailServices.set(serviceId, gmailService);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        serviceId,
                        userEmail: result.userEmail
                    }));
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: result.error }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/gmail/list' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { serviceId, options } = JSON.parse(body);
                const gmailService = gmailServices.get(serviceId);
                
                if (!gmailService || !gmailService.isReady()) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Gmail service not initialized' }));
                    return;
                }

                const emails = await gmailService.listEmails(options);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, emails }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/gmail/send' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const { serviceId, emailData } = JSON.parse(body);
                const gmailService = gmailServices.get(serviceId);
                
                if (!gmailService || !gmailService.isReady()) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Gmail service not initialized' }));
                    return;
                }

                const result = await gmailService.sendEmail(emailData);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    // Serve static files
    const staticFiles = {
        '/gmail-demo-working.html': 'gmail-demo-working.html'
    };

    if (staticFiles[pathname]) {
        try {
            const filePath = path.join(__dirname, staticFiles[pathname]);
            const content = fs.readFileSync(filePath, 'utf8');
            
            res.writeHead(200, {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache'
            });
            res.end(content);
            return;
        } catch (error) {
            console.error(`❌ Error serving ${pathname}:`, error.message);
        }
    }

    // 404 for everything else
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 - Not Found');
});

// Start server
server.listen(PORT, HOST, () => {
    console.log('🚀 TLDR Gmail API Server Started');
    console.log(`📍 Server: http://${HOST}:${PORT}`);
    console.log(`📧 Gmail Demo: http://${HOST}:${PORT}/gmail-demo-working.html`);
    console.log('');
    console.log('✅ REAL Gmail API Integration:');
    console.log('   • OAuth token exchange');
    console.log('   • Real Gmail API calls');
    console.log('   • Read and send emails');
    console.log('   • Professional interface');
    console.log('');
    console.log('🎯 Usage:');
    console.log('   1. Complete OAuth flow');
    console.log('   2. Initialize Gmail API');
    console.log('   3. Read and send real emails');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.log('💡 The Gmail API server is already running!');
    } else {
        console.error('❌ Server error:', error.message);
    }
});

console.log('🔄 Gmail API server will run continuously...'); 