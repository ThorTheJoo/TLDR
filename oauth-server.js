const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

/**
 * Simple OAuth Callback Server for TLDR Gmail Integration
 * 
 * This server handles the OAuth callback from Google and serves the callback page
 * to complete the Gmail integration flow.
 */

const PORT = 3000;
const HOST = 'localhost';

// Read the callback HTML file
let callbackHTML;
try {
    callbackHTML = fs.readFileSync(path.join(__dirname, 'oauth-callback.html'), 'utf8');
} catch (error) {
    console.error('❌ Error reading oauth-callback.html:', error.message);
    process.exit(1);
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    console.log(`📥 ${req.method} ${req.url}`);

    // Handle OAuth callback
    if (pathname === '/oauth/callback') {
        console.log('🔗 OAuth callback received');
        
        // Log the received parameters
        console.log('📋 OAuth Parameters:', {
            code: query.code ? `${query.code.substring(0, 20)}...` : 'missing',
            state: query.state || 'missing',
            scope: query.scope || 'missing',
            error: query.error || 'none'
        });

        // Set headers
        res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Origin': '*'
        });

        // Serve the callback page
        res.end(callbackHTML);
        
        if (query.code) {
            console.log('✅ Authorization code received successfully');
        } else if (query.error) {
            console.log('❌ OAuth error:', query.error);
        }
        
        return;
    }

    // Handle root path - redirect to demo
    if (pathname === '/') {
        res.writeHead(302, {
            'Location': '/demo.html'
        });
        res.end();
        return;
    }

    // Serve static files
    const staticFiles = {
        '/demo.html': 'demo.html',
        '/oauth-callback.html': 'oauth-callback.html'
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
    console.log('🚀 TLDR OAuth Server Started');
    console.log(`📍 Server: http://${HOST}:${PORT}`);
    console.log(`🔗 OAuth Callback: http://${HOST}:${PORT}/oauth/callback`);
    console.log(`🌐 Demo: http://${HOST}:${PORT}/demo.html`);
    console.log('');
    console.log('✅ Ready to handle Gmail OAuth callbacks!');
    console.log('📋 Next steps:');
    console.log('   1. Upload your OAuth JSON file in the demo');
    console.log('   2. Click the generated authorization URL');
    console.log('   3. Google will redirect back to this server');
    console.log('   4. The callback will be processed automatically');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use.`);
        console.log('💡 Try closing other applications using port 3000 or run:');
        console.log('   netstat -ano | findstr :3000');
        console.log('   taskkill /PID <PID> /F');
    } else {
        console.error('❌ Server error:', error.message);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down OAuth server...');
    server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down...');
    server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
    });
}); 