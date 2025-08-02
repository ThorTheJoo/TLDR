/**
 * Gmail Service for TLDR App
 * Handles reading, writing, and managing emails using Google Gmail API
 */

const { google } = require('googleapis');

class GmailService {
    constructor() {
        this.gmail = null;
        this.isAuthenticated = false;
    }

    /**
     * Initialize Gmail API with OAuth credentials
     */
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

            console.log('✅ Gmail API initialized successfully');
            return { success: true, tokens };
        } catch (error) {
            console.error('❌ Gmail API initialization failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user's email address
     */
    async getUserEmail() {
        try {
            const response = await this.gmail.users.getProfile({
                userId: 'me'
            });
            return response.data.emailAddress;
        } catch (error) {
            console.error('❌ Failed to get user email:', error.message);
            throw error;
        }
    }

    /**
     * List emails with filtering options
     */
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

    /**
     * Get detailed information about a specific email
     */
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

    /**
     * Send an email
     */
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

    /**
     * Reply to an email
     */
    async replyToEmail(messageId, replyText) {
        try {
            // Get original email details
            const originalEmail = await this.getEmailDetails(messageId);
            
            // Create reply message
            const replyData = {
                to: originalEmail.from,
                subject: originalEmail.subject.startsWith('Re:') ? 
                    originalEmail.subject : `Re: ${originalEmail.subject}`,
                body: replyText,
                inReplyTo: messageId
            };

            return await this.sendEmail(replyData);
        } catch (error) {
            console.error('❌ Failed to reply to email:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark email as read/unread
     */
    async markEmailAsRead(messageId, isRead = true) {
        try {
            const response = await this.gmail.users.messages.modify({
                userId: 'me',
                id: messageId,
                requestBody: {
                    removeLabelIds: isRead ? ['UNREAD'] : [],
                    addLabelIds: isRead ? [] : ['UNREAD']
                }
            });

            console.log(`✅ Email marked as ${isRead ? 'read' : 'unread'}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to mark email:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Delete an email
     */
    async deleteEmail(messageId) {
        try {
            await this.gmail.users.messages.delete({
                userId: 'me',
                id: messageId
            });

            console.log('✅ Email deleted successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to delete email:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Search emails
     */
    async searchEmails(query) {
        try {
            const response = await this.gmail.users.messages.list({
                userId: 'me',
                q: query,
                maxResults: 50
            });

            const messages = response.data.messages || [];
            const emails = [];

            for (const message of messages) {
                const emailDetails = await this.getEmailDetails(message.id);
                emails.push(emailDetails);
            }

            return { emails, total: emails.length };
        } catch (error) {
            console.error('❌ Failed to search emails:', error.message);
            throw error;
        }
    }

    /**
     * Get email labels
     */
    async getLabels() {
        try {
            const response = await this.gmail.users.labels.list({
                userId: 'me'
            });

            return response.data.labels || [];
        } catch (error) {
            console.error('❌ Failed to get labels:', error.message);
            throw error;
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

    /**
     * Check if service is authenticated
     */
    isReady() {
        return this.isAuthenticated && this.gmail !== null;
    }
}

module.exports = GmailService; 