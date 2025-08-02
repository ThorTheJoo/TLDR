const http = require('http');

/**
 * Comprehensive Invoice Detection Fix
 * 
 * This script tests and fixes the invoice detection issues:
 * 1. Tests the original AI analyzer (port 3004)
 * 2. Tests the enhanced analyzer (port 3005) 
 * 3. Provides detailed debugging information
 * 4. Shows exactly what's being detected and why
 */

async function testInvoiceDetection() {
    console.log('🔍 Testing Invoice Detection - Comprehensive Fix\n');

    const testEmails = [
        {
            name: 'Clear Invoice Email',
            content: {
                subject: 'Invoice for Web Development Services - ABC Company',
                from: 'billing@abc-company.com',
                body: 'Dear Customer, Please find attached invoice #INV-2024-001 for services rendered. Amount due: $2,500.00. Payment due by 30 days. Thank you for your business.'
            }
        },
        {
            name: 'Payment Reminder Email',
            content: {
                subject: 'Payment Reminder - Outstanding Balance $1,250.00',
                from: 'accounts@xyz-company.com',
                body: 'Dear Valued Customer, This is a friendly reminder that your account has an outstanding balance of $1,250.00. Please process payment as soon as possible.'
            }
        },
        {
            name: 'Regular Email (No Invoice)',
            content: {
                subject: 'Meeting Tomorrow - Project Discussion',
                from: 'colleague@company.com',
                body: 'Hi team, let\'s meet tomorrow at 2 PM to discuss the project progress. Please bring your updates.'
            }
        }
    ];

    for (const testEmail of testEmails) {
        console.log(`\n📧 Testing: ${testEmail.name}`);
        console.log(`Subject: ${testEmail.content.subject}`);
        console.log(`From: ${testEmail.content.from}`);
        console.log(`Body: ${testEmail.content.body.substring(0, 100)}...`);
        
        // Test 1: Original AI Analyzer (Port 3004)
        console.log('\n🔍 Testing Original AI Analyzer (Port 3004):');
        try {
            const aiResult = await analyzeEmail(testEmail.content, 3004);
            console.log(`   ✅ AI Analysis Result:`);
            console.log(`      Contains Invoice: ${aiResult.containsInvoice ? '✅ YES' : '❌ NO'}`);
            console.log(`      Method: ${aiResult.analysisMethod}`);
            if (aiResult.containsInvoice) {
                console.log(`      💰 Amount: ${aiResult.invoiceDetails.amount || 'Not detected'}`);
                console.log(`      🏢 Vendor: ${aiResult.invoiceDetails.vendor}`);
                console.log(`      🔢 Invoice #: ${aiResult.invoiceDetails.invoiceNumber}`);
            }
        } catch (error) {
            console.log(`   ❌ AI Analyzer Error: ${error.message}`);
        }

        // Test 2: Enhanced Analyzer (Port 3005)
        console.log('\n🔍 Testing Enhanced Analyzer (Port 3005):');
        try {
            const enhancedResult = await analyzeEmail(testEmail.content, 3005);
            console.log(`   ✅ Enhanced Analysis Result:`);
            console.log(`      Contains Invoice: ${enhancedResult.containsInvoice ? '✅ YES' : '❌ NO'}`);
            console.log(`      Confidence: ${enhancedResult.confidence}%`);
            console.log(`      Detection Method: ${enhancedResult.detectionMethod}`);
            console.log(`      Keywords Found: ${enhancedResult.extractedKeywords.join(', ')}`);
            if (enhancedResult.containsInvoice) {
                console.log(`      💰 Amount: ${enhancedResult.invoiceDetails.amount || 'Not detected'}`);
                console.log(`      🏢 Vendor: ${enhancedResult.invoiceDetails.vendor}`);
                console.log(`      🔢 Invoice #: ${enhancedResult.invoiceDetails.invoiceNumber}`);
                console.log(`      📅 Due Date: ${enhancedResult.invoiceDetails.dueDate || 'Not specified'}`);
            }
        } catch (error) {
            console.log(`   ❌ Enhanced Analyzer Error: ${error.message}`);
        }

        // Test 3: Direct Fallback Analysis
        console.log('\n🔍 Testing Direct Fallback Analysis:');
        const fallbackResult = performFallbackAnalysis(testEmail.content);
        console.log(`   ✅ Fallback Analysis Result:`);
        console.log(`      Contains Invoice: ${fallbackResult.containsInvoice ? '✅ YES' : '❌ NO'}`);
        console.log(`      Keywords Found: ${fallbackResult.keywords.join(', ')}`);
        console.log(`      💰 Amount: ${fallbackResult.amount || 'Not detected'}`);
        console.log(`      🏢 Vendor: ${fallbackResult.vendor}`);
        console.log(`      🔢 Invoice #: ${fallbackResult.invoiceNumber}`);
    }
}

function performFallbackAnalysis(emailContent) {
    const content = `${emailContent.subject} ${emailContent.body}`.toLowerCase();
    
    // Invoice detection keywords
    const invoiceKeywords = [
        'invoice', 'bill', 'payment', 'amount due', 'total', '$', 'dollars',
        'payment due', 'balance', 'statement', 'receipt', 'charge'
    ];
    
    const foundKeywords = [];
    const containsInvoice = invoiceKeywords.some(keyword => {
        const found = content.includes(keyword);
        if (found) {
            foundKeywords.push(keyword);
        }
        return found;
    });

    // Extract amount using regex
    const amountMatch = content.match(/\$[\d,]+\.?\d*/g);
    const amount = amountMatch ? amountMatch[0] : null;

    // Extract vendor (sender email domain)
    const vendor = emailContent.from.split('@')[1] || 'Unknown';

    // Better invoice number extraction
    let invoiceNumber = 'N/A';
    const invoicePatterns = [
        /(?:invoice|inv)[\s#-]*([a-z0-9-]+)/i,
        /#([a-z0-9-]+)/i,
        /(?:invoice|inv)\s*#?\s*([a-z0-9-]+)/i
    ];
    
    for (const pattern of invoicePatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].length > 2) {
            invoiceNumber = match[1];
            break;
        }
    }

    return {
        containsInvoice,
        keywords: foundKeywords,
        amount,
        vendor,
        invoiceNumber
    };
}

async function analyzeEmail(emailContent, port) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            emailId: `test-email-${Date.now()}`,
            emailContent: emailContent
        });

        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/analyze',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 5000 // 5 second timeout
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.success) {
                        resolve(result.analysis);
                    } else {
                        reject(new Error(result.error));
                    }
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Connection error: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

// Check if servers are running
async function checkServers() {
    console.log('🔍 Checking Server Status...\n');
    
    const servers = [
        { name: 'OAuth Callback', port: 3000 },
        { name: 'Persistent OAuth', port: 3002 },
        { name: 'Server Discovery', port: 3003 },
        { name: 'AI Email Analyzer', port: 3004 },
        { name: 'Enhanced Analyzer', port: 3005 }
    ];

    for (const server of servers) {
        try {
            const response = await fetch(`http://localhost:${server.port}`, { 
                method: 'GET',
                timeout: 2000 
            });
            console.log(`✅ ${server.name} (Port ${server.port}): Running`);
        } catch (error) {
            console.log(`❌ ${server.name} (Port ${server.port}): Not running`);
        }
    }
    console.log('');
}

// Run the comprehensive test
async function runComprehensiveTest() {
    await checkServers();
    await testInvoiceDetection();
}

runComprehensiveTest().catch(console.error); 