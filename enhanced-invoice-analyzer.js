const http = require('http');
const fs = require('fs');

/**
 * Enhanced Invoice Analyzer
 * 
 * This service provides advanced invoice detection with:
 * - Multiple detection methods
 * - Enhanced pattern matching
 * - Confidence scoring
 * - Detailed extraction
 */

class EnhancedInvoiceAnalyzer {
    constructor() {
        this.port = 3005;
        this.analyzedEmails = new Map();
    }

    // Enhanced invoice detection with confidence scoring
    analyzeInvoice(emailContent) {
        console.log('🔍 Enhanced Invoice Analysis Starting...');
        
        const content = `${emailContent.subject} ${emailContent.body}`.toLowerCase();
        const analysis = {
            containsInvoice: false,
            confidence: 0,
            detectionMethod: 'none',
            invoiceDetails: {
                vendor: 'Unknown',
                amount: null,
                date: new Date().toISOString().split('T')[0],
                invoiceNumber: 'N/A',
                dueDate: null,
                currency: 'USD'
            },
            extractedKeywords: [],
            patterns: []
        };

        // Method 1: Strong Invoice Keywords
        const strongKeywords = ['invoice', 'bill', 'payment due', 'amount due'];
        const strongMatches = strongKeywords.filter(keyword => content.includes(keyword));
        if (strongMatches.length > 0) {
            analysis.containsInvoice = true;
            analysis.confidence += 40;
            analysis.detectionMethod = 'strong_keywords';
            analysis.extractedKeywords.push(...strongMatches);
            console.log(`✅ Strong keywords found: ${strongMatches.join(', ')}`);
        }

        // Method 2: Amount Detection
        const amountPatterns = [
            /\$[\d,]+\.?\d*/g,  // $1,250.00
            /[\d,]+\.?\d*\s*dollars?/gi,  // 1250.00 dollars
            /[\d,]+\.?\d*\s*usd/gi,  // 1250.00 USD
            /amount[:\s]*\$?[\d,]+\.?\d*/gi  // amount: $1250.00
        ];

        for (const pattern of amountPatterns) {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                analysis.invoiceDetails.amount = matches[0];
                analysis.confidence += 30;
                analysis.patterns.push(`amount_pattern: ${matches[0]}`);
                console.log(`💰 Amount detected: ${matches[0]}`);
                break;
            }
        }

        // Method 3: Invoice Number Detection
        // First try to find INV-YYYY-NNN format
        const invPattern = content.match(/inv-[\d-]+/i);
        if (invPattern) {
            analysis.invoiceDetails.invoiceNumber = invPattern[0];
            analysis.confidence += 20;
            analysis.patterns.push(`invoice_number: ${invPattern[0]}`);
            console.log(`🔢 Invoice number detected: ${invPattern[0]}`);
        } else {
            // Try other patterns
            const invoiceNumberPatterns = [
                /invoice\s*#?\s*([a-z0-9-]+)/i,
                /(?:invoice|inv)[\s#-]*([a-z0-9-]+)/i,
                /#([a-z0-9-]+)/i,
                /invoice\s*number[:\s]*([a-z0-9-]+)/i
            ];

            for (const pattern of invoiceNumberPatterns) {
                const match = content.match(pattern);
                if (match && match[1] && match[1].length > 2) {
                    analysis.invoiceDetails.invoiceNumber = match[1];
                    analysis.confidence += 20;
                    analysis.patterns.push(`invoice_number: ${match[1]}`);
                    console.log(`🔢 Invoice number detected: ${match[1]}`);
                    break;
                }
            }
        }

        // Method 4: Vendor Detection
        const vendor = emailContent.from.split('@')[1] || 'Unknown';
        analysis.invoiceDetails.vendor = vendor;
        if (vendor !== 'Unknown') {
            analysis.confidence += 10;
            console.log(`🏢 Vendor detected: ${vendor}`);
        }

        // Method 5: Due Date Detection
        const dueDatePatterns = [
            /due\s*date[:\s]*([a-z0-9\s,]+)/i,
            /payment\s*due[:\s]*([a-z0-9\s,]+)/i,
            /due\s*by[:\s]*([a-z0-9\s,]+)/i
        ];

        for (const pattern of dueDatePatterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                analysis.invoiceDetails.dueDate = match[1].trim();
                analysis.confidence += 15;
                analysis.patterns.push(`due_date: ${match[1].trim()}`);
                console.log(`📅 Due date detected: ${match[1].trim()}`);
                break;
            }
        }

        // Method 6: Weak Keywords (lower confidence)
        const weakKeywords = ['payment', 'balance', 'statement', 'receipt', 'charge', 'total'];
        const weakMatches = weakKeywords.filter(keyword => content.includes(keyword));
        if (weakMatches.length > 0 && !analysis.containsInvoice) {
            analysis.containsInvoice = true;
            analysis.confidence += 20;
            analysis.detectionMethod = 'weak_keywords';
            analysis.extractedKeywords.push(...weakMatches);
            console.log(`⚠️ Weak keywords found: ${weakMatches.join(', ')}`);
        }

        // Final confidence adjustment
        if (analysis.containsInvoice && analysis.confidence < 30) {
            analysis.confidence = 30; // Minimum confidence for detected invoices
        }

        console.log(`📊 Analysis Summary:`);
        console.log(`   Contains Invoice: ${analysis.containsInvoice ? '✅ YES' : '❌ NO'}`);
        console.log(`   Confidence: ${analysis.confidence}%`);
        console.log(`   Method: ${analysis.detectionMethod}`);
        console.log(`   Keywords: ${analysis.extractedKeywords.join(', ')}`);
        console.log(`   Patterns: ${analysis.patterns.join(', ')}`);

        return {
            ...analysis,
            topics: this.extractTopics(content),
            urgency: this.determineUrgency(content),
            actionItems: this.extractActionItems(content),
            summary: this.generateSummary(emailContent),
            analysisMethod: 'enhanced'
        };
    }

    extractTopics(content) {
        const topics = [];
        const topicKeywords = {
            'invoice': ['invoice', 'bill', 'payment'],
            'meeting': ['meeting', 'call', 'appointment'],
            'project': ['project', 'task', 'deadline'],
            'support': ['help', 'support', 'issue', 'problem'],
            'update': ['update', 'status', 'progress']
        };

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => content.includes(keyword))) {
                topics.push(topic);
            }
        });

        return topics.length > 0 ? topics : ['general'];
    }

    determineUrgency(content) {
        const urgentKeywords = ['urgent', 'asap', 'immediate', 'critical', 'emergency'];
        const mediumKeywords = ['soon', 'quickly', 'prompt'];
        
        if (urgentKeywords.some(keyword => content.includes(keyword))) {
            return 'High';
        } else if (mediumKeywords.some(keyword => content.includes(keyword))) {
            return 'Medium';
        }
        return 'Low';
    }

    extractActionItems(content) {
        const actionKeywords = [
            'please', 'need', 'required', 'must', 'should', 'action',
            'respond', 'reply', 'confirm', 'approve', 'review'
        ];
        
        const sentences = content.split(/[.!?]+/);
        const actionItems = sentences.filter(sentence => 
            actionKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
        );

        return actionItems.slice(0, 3);
    }

    generateSummary(emailContent) {
        const subject = emailContent.subject || 'No subject';
        const from = emailContent.from || 'Unknown sender';
        const bodyPreview = (emailContent.body || '').substring(0, 100);
        
        return `Email from ${from} regarding "${subject}". ${bodyPreview}...`;
    }

    createServer() {
        const server = http.createServer(async (req, res) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const url = new URL(req.url, `http://localhost:${this.port}`);
            const pathname = url.pathname;

            if (pathname === '/api/analyze' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    try {
                        const { emailId, emailContent } = JSON.parse(body);
                        
                        console.log(`🔍 Enhanced analysis for email: ${emailId}`);
                        
                        // Clear cache for test emails
                        if (emailId.includes('test-') || emailId.includes('debug-')) {
                            this.analyzedEmails.delete(emailId);
                            console.log(`🧹 Cleared cache for test email: ${emailId}`);
                        }
                        
                        // Check if already analyzed
                        if (this.analyzedEmails.has(emailId)) {
                            const cached = this.analyzedEmails.get(emailId);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                success: true,
                                analysis: cached,
                                cached: true
                            }));
                            return;
                        }

                        // Perform enhanced analysis
                        const analysis = this.analyzeInvoice(emailContent);
                        
                        // Cache the result
                        this.analyzedEmails.set(emailId, analysis);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            analysis,
                            cached: false
                        }));
                        
                        console.log(`✅ Enhanced analysis completed for email: ${emailId}`);
                    } catch (error) {
                        console.error('❌ Analysis error:', error.message);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: error.message
                        }));
                    }
                });
                return;
            }

            // Serve enhanced analyzer dashboard
            if (pathname === '/') {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Invoice Analyzer</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .button { background: #1a73e8; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin: 5px; }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .success { background: #e8f5e8; color: #137333; }
        .error { background: #fce8e6; color: #d93025; }
        .info { background: #e8f0fe; color: #1a73e8; }
        .invoice { background: #fff3cd; color: #856404; }
        .confidence { font-weight: bold; }
        .high { color: #137333; }
        .medium { color: #f29900; }
        .low { color: #d93025; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Enhanced Invoice Analyzer</h1>
        <p>Advanced invoice detection with confidence scoring and detailed analysis.</p>
        
        <div class="card">
            <h2>🧪 Test Analysis</h2>
            <button class="button" onclick="testEnhancedAnalysis()">Test Enhanced Analysis</button>
            <div id="status">
                <p>Click the button to test enhanced invoice detection...</p>
            </div>
        </div>

        <div class="card">
            <h2>📊 Analysis Results</h2>
            <div id="results">
                <p>Analysis results will appear here...</p>
            </div>
        </div>
    </div>

    <script>
        async function testEnhancedAnalysis() {
            const statusDiv = document.getElementById('status');
            const resultsDiv = document.getElementById('results');
            
            statusDiv.innerHTML = '<div class="status info">Testing enhanced analysis...</div>';
            
            const testEmail = {
                subject: 'Invoice for Web Development Services - ABC Company',
                from: 'billing@abc-company.com',
                body: 'Dear Customer, Please find attached invoice #INV-2024-001 for services rendered. Amount due: $2,500.00. Payment due by 30 days. Thank you for your business.'
            };
            
            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        emailId: 'enhanced-test-email',
                        emailContent: testEmail
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    const analysis = result.analysis;
                    const confidenceClass = analysis.confidence >= 70 ? 'high' : 
                                         analysis.confidence >= 40 ? 'medium' : 'low';
                    
                    statusDiv.innerHTML = '<div class="status success">✅ Enhanced analysis completed!</div>';
                    
                    resultsDiv.innerHTML = \`
                        <h3>📧 Enhanced Analysis Results</h3>
                        <div class="card">
                            <p><strong>Contains Invoice:</strong> \${analysis.containsInvoice ? '✅ YES' : '❌ NO'}</p>
                            <p><strong>Confidence:</strong> <span class="confidence \${confidenceClass}">\${analysis.confidence}%</span></p>
                            <p><strong>Detection Method:</strong> \${analysis.detectionMethod}</p>
                            <p><strong>Keywords Found:</strong> \${analysis.extractedKeywords.join(', ')}</p>
                            <p><strong>Patterns Detected:</strong> \${analysis.patterns.join(', ')}</p>
                        </div>
                        
                        <h3>💰 Invoice Details</h3>
                        <div class="card">
                            <p><strong>Vendor:</strong> \${analysis.invoiceDetails.vendor}</p>
                            <p><strong>Amount:</strong> \${analysis.invoiceDetails.amount || 'Not detected'}</p>
                            <p><strong>Invoice #:</strong> \${analysis.invoiceDetails.invoiceNumber}</p>
                            <p><strong>Due Date:</strong> \${analysis.invoiceDetails.dueDate || 'Not specified'}</p>
                            <p><strong>Currency:</strong> \${analysis.invoiceDetails.currency}</p>
                        </div>
                        
                        <h3>📊 Additional Analysis</h3>
                        <div class="card">
                            <p><strong>Topics:</strong> \${analysis.topics.join(', ')}</p>
                            <p><strong>Urgency:</strong> \${analysis.urgency}</p>
                            <p><strong>Action Items:</strong> \${analysis.actionItems.join(', ') || 'None'}</p>
                            <p><strong>Summary:</strong> \${analysis.summary}</p>
                        </div>
                    \`;
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                statusDiv.innerHTML = \`
                    <div class="status error">
                        ❌ Enhanced analysis failed: \${error.message}
                    </div>
                \`;
                resultsDiv.innerHTML = \`<p>Error: \${error.message}</p>\`;
            }
        }
    </script>
</body>
</html>
                `);
                return;
            }

            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        });

        server.listen(this.port, () => {
            console.log('🔍 Enhanced Invoice Analyzer Started');
            console.log('📍 Server: http://localhost:' + this.port);
            console.log('✅ Features:');
            console.log('   • Multiple detection methods');
            console.log('   • Confidence scoring');
            console.log('   • Enhanced pattern matching');
            console.log('   • Detailed extraction');
            console.log('🎯 Usage:');
            console.log('   1. Visit http://localhost:' + this.port);
            console.log('   2. Test enhanced analysis');
            console.log('   3. View confidence scores');
            console.log('   4. Check detection methods');
        });

        return server;
    }
}

// Start the enhanced analyzer service
const analyzer = new EnhancedInvoiceAnalyzer();
analyzer.createServer(); 