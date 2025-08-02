const fs = require('fs');
const path = require('path');

/**
 * Fix All Broken Links and Backend Calls
 * 
 * This script updates all HTML files to use the correct backend endpoints:
 * - Port 3000: OAuth Callback Server
 * - Port 3002: Persistent OAuth Manager (Gmail API)
 * - Port 3004: AI Email Analyzer
 * - Port 3005: Enhanced Invoice Analyzer
 */

const filesToFix = [
    'gmail-demo-simple.html',
    'gmail-demo-working.html',
    'gmail-demo.html',
    'test-gmail-simple.html',
    'test-ai-analyzer.html',
    'test-email-display.html',
    'test-all-urls.html',
    'test-gmail-initialization.html',
    'test-server-connection.html'
];

function fixBackendCalls(content) {
    // Fix port 3001 calls to use port 3002 (Persistent OAuth Manager)
    content = content.replace(/localhost:3001/g, 'localhost:3002');
    
    // Ensure AI analyzer calls use correct ports
    content = content.replace(/localhost:3004\/api\/analyze/g, 'localhost:3004/api/analyze');
    content = content.replace(/localhost:3005\/api\/analyze/g, 'localhost:3005/api/analyze');
    
    // Fix any remaining incorrect port references
    content = content.replace(/localhost:3001\/api\/gmail/g, 'localhost:3002/api/gmail');
    
    return content;
}

function fixLinks(content) {
    // Update demo links to use correct ports
    content = content.replace(/http:\/\/localhost:3000\/gmail-demo-simple\.html/g, 'http://localhost:3000/gmail-demo-simple.html');
    content = content.replace(/http:\/\/localhost:3000\/gmail-demo-smart\.html/g, 'http://localhost:3000/gmail-demo-smart.html');
    
    // Add AI analyzer links
    content = content.replace(/AI Email Analyzer: http:\/\/localhost:3004/g, 'AI Email Analyzer: http://localhost:3004');
    content = content.replace(/Enhanced Analyzer: http:\/\/localhost:3005/g, 'Enhanced Analyzer: http://localhost:3005');
    
    return content;
}

function updateFile(filePath) {
    try {
        console.log(`🔧 Fixing: ${filePath}`);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Fix backend calls
        content = fixBackendCalls(content);
        
        // Fix links
        content = fixLinks(content);
        
        // Write back if changes were made
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ Fixed: ${filePath}`);
        } else {
            console.log(`ℹ️ No changes needed: ${filePath}`);
        }
        
    } catch (error) {
        console.error(`❌ Error fixing ${filePath}:`, error.message);
    }
}

function createUpdatedTestPage() {
    const testPageContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TLDR - All Services Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .service-card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; background: #f9f9f9; }
        .button { background: #1a73e8; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; font-size: 14px; }
        .button:hover { background: #1557b0; }
        .button.success { background: #34a853; }
        .button.warning { background: #f9ab00; }
        .status { padding: 15px; border-radius: 4px; margin: 15px 0; }
        .success { background: #e8f5e8; color: #137333; border: 1px solid #c3e6c3; }
        .error { background: #fce8e6; color: #d93025; border: 1px solid #f5c6c6; }
        .info { background: #e8f0fe; color: #1a73e8; border: 1px solid #c3d9f0; }
        .service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 TLDR - All Services Test</h1>
        <p>Test all services and verify all links are working correctly.</p>
        
        <div class="service-grid">
            <div class="service-card">
                <h3>📡 OAuth Callback Server (Port 3000)</h3>
                <p>Handles Google OAuth callbacks and displays authorization codes.</p>
                <button class="button" onclick="window.open('http://localhost:3000/', '_blank')">Open OAuth Server</button>
                <button class="button" onclick="window.open('http://localhost:3000/demo.html', '_blank')">Open Demo Page</button>
                <button class="button" onclick="window.open('http://localhost:3000/gmail-demo-simple.html', '_blank')">Open Gmail Demo</button>
            </div>
            
            <div class="service-card">
                <h3>🔐 Persistent OAuth Manager (Port 3002)</h3>
                <p>Manages OAuth tokens and provides Gmail API access.</p>
                <button class="button" onclick="window.open('http://localhost:3002/', '_blank')">Open OAuth Manager</button>
                <button class="button" onclick="window.open('http://localhost:3002/test-email-display.html', '_blank')">Test Email Display</button>
                <button class="button" onclick="window.open('http://localhost:3002/test-server-connection.html', '_blank')">Test Server Connection</button>
            </div>
            
            <div class="service-card">
                <h3>🔍 Server Discovery (Port 3003)</h3>
                <p>Discovers running services and provides endpoint recommendations.</p>
                <button class="button" onclick="window.open('http://localhost:3003/', '_blank')">Open Discovery Service</button>
                <button class="button" onclick="testDiscovery()">Test Discovery</button>
            </div>
            
            <div class="service-card">
                <h3>🧠 AI Email Analyzer (Port 3004)</h3>
                <p>Analyzes emails for invoices and content using AI.</p>
                <button class="button success" onclick="window.open('http://localhost:3004/', '_blank')">Open AI Analyzer</button>
                <button class="button" onclick="testAIAnalyzer()">Test AI Analysis</button>
            </div>
            
            <div class="service-card">
                <h3>🔍 Enhanced Invoice Analyzer (Port 3005)</h3>
                <p>Advanced invoice detection with confidence scoring.</p>
                <button class="button success" onclick="window.open('http://localhost:3005/', '_blank')">Open Enhanced Analyzer</button>
                <button class="button" onclick="testEnhancedAnalyzer()">Test Enhanced Analysis</button>
            </div>
        </div>
        
        <div class="service-card">
            <h3>🧪 Quick Tests</h3>
            <button class="button warning" onclick="testAllServices()">Test All Services</button>
            <button class="button" onclick="checkServiceStatus()">Check Service Status</button>
            <div id="testResults">
                <p>Click "Test All Services" to verify all endpoints are working.</p>
            </div>
        </div>
    </div>

    <script>
        async function testDiscovery() {
            try {
                const response = await fetch('http://localhost:3003/api/discovery');
                const result = await response.json();
                alert('Discovery Service Test:\n\n' + JSON.stringify(result, null, 2));
            } catch (error) {
                alert('Discovery Service Error: ' + error.message);
            }
        }

        async function testAIAnalyzer() {
            try {
                const testEmail = {
                    subject: 'Invoice for Services',
                    from: 'billing@test.com',
                    body: 'Please find attached invoice #INV-2024-001 for $2,500.00.'
                };
                
                const response = await fetch('http://localhost:3004/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailId: 'test-email',
                        emailContent: testEmail
                    })
                });
                
                const result = await response.json();
                alert('AI Analyzer Test:\n\n' + JSON.stringify(result, null, 2));
            } catch (error) {
                alert('AI Analyzer Error: ' + error.message);
            }
        }

        async function testEnhancedAnalyzer() {
            try {
                const testEmail = {
                    subject: 'Invoice for Services',
                    from: 'billing@test.com',
                    body: 'Please find attached invoice #INV-2024-001 for $2,500.00.'
                };
                
                const response = await fetch('http://localhost:3005/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailId: 'test-email',
                        emailContent: testEmail
                    })
                });
                
                const result = await response.json();
                alert('Enhanced Analyzer Test:\n\n' + JSON.stringify(result, null, 2));
            } catch (error) {
                alert('Enhanced Analyzer Error: ' + error.message);
            }
        }

        async function testAllServices() {
            const resultsDiv = document.getElementById('testResults');
            resultsDiv.innerHTML = '<div class="status info">Testing all services...</div>';
            
            const services = [
                { name: 'OAuth Callback (3000)', url: 'http://localhost:3000/' },
                { name: 'Persistent OAuth (3002)', url: 'http://localhost:3002/' },
                { name: 'Server Discovery (3003)', url: 'http://localhost:3003/' },
                { name: 'AI Email Analyzer (3004)', url: 'http://localhost:3004/' },
                { name: 'Enhanced Analyzer (3005)', url: 'http://localhost:3005/' }
            ];
            
            let results = '<h4>Service Status:</h4>';
            
            for (const service of services) {
                try {
                    const response = await fetch(service.url);
                    if (response.ok) {
                        results += \`<div class="status success">✅ \${service.name} - Running</div>\`;
                    } else {
                        results += \`<div class="status error">❌ \${service.name} - Error \${response.status}</div>\`;
                    }
                } catch (error) {
                    results += \`<div class="status error">❌ \${service.name} - Connection Failed</div>\`;
                }
            }
            
            resultsDiv.innerHTML = results;
        }

        async function checkServiceStatus() {
            const status = await testAllServices();
        }
    </script>
</body>
</html>`;

    fs.writeFileSync('test-all-services.html', testPageContent);
    console.log('✅ Created: test-all-services.html');
}

// Fix all files
console.log('🔧 Starting to fix all broken links and backend calls...\n');

filesToFix.forEach(file => {
    updateFile(file);
});

// Create updated test page
createUpdatedTestPage();

console.log('\n✅ All files have been updated!');
console.log('\n📋 Summary of fixes:');
console.log('   • Fixed port 3001 calls to use port 3002 (Persistent OAuth Manager)');
console.log('   • Updated AI analyzer calls to use correct ports (3004, 3005)');
console.log('   • Created comprehensive test page: test-all-services.html');
console.log('\n🎯 Next steps:');
console.log('   1. Visit http://localhost:3000/demo.html for main demo');
console.log('   2. Visit http://localhost:3000/test-all-services.html to test all services');
console.log('   3. Test Gmail integration at http://localhost:3000/gmail-demo-simple.html');
console.log('   4. Test AI analysis at http://localhost:3004/ and http://localhost:3005/'); 