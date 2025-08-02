const http = require('http');

// Debug invoice detection with detailed logging
async function debugInvoiceDetection() {
    console.log('🔍 Debugging Invoice Detection...\n');

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
        
        try {
            const result = await analyzeEmail(testEmail.content);
            console.log(`\n✅ Analysis Result:`);
            console.log(`   Contains Invoice: ${result.containsInvoice ? '✅ YES' : '❌ NO'}`);
            console.log(`   Method: ${result.analysisMethod}`);
            
            if (result.containsInvoice) {
                console.log(`   💰 Amount: ${result.invoiceDetails.amount}`);
                console.log(`   🏢 Vendor: ${result.invoiceDetails.vendor}`);
                console.log(`   🔢 Invoice #: ${result.invoiceDetails.invoiceNumber}`);
                console.log(`   📅 Date: ${result.invoiceDetails.date}`);
            }
            
            console.log(`   📊 Topics: ${result.topics.join(', ')}`);
            console.log(`   ⚡ Urgency: ${result.urgency}`);
            console.log(`   📋 Action Items: ${result.actionItems.length > 0 ? result.actionItems.join(', ') : 'None'}`);
            console.log(`   📝 Summary: ${result.summary.substring(0, 100)}...`);
            
            // Test the fallback analysis directly
            console.log(`\n🔍 Testing Fallback Analysis Directly:`);
            const fallbackResult = testFallbackAnalysis(testEmail.content);
            console.log(`   Fallback Contains Invoice: ${fallbackResult.containsInvoice ? '✅ YES' : '❌ NO'}`);
            console.log(`   Fallback Amount: ${fallbackResult.invoiceDetails.amount}`);
            console.log(`   Fallback Vendor: ${fallbackResult.invoiceDetails.vendor}`);
            console.log(`   Fallback Invoice #: ${fallbackResult.invoiceDetails.invoiceNumber}`);
            
        } catch (error) {
            console.error(`❌ Error: ${error.message}`);
        }
    }
}

function testFallbackAnalysis(emailContent) {
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
    let betterInvoiceNumber = 'N/A';
    const invoicePatterns = [
        /(?:invoice|inv)[\s#-]*([a-z0-9-]+)/i,
        /#([a-z0-9-]+)/i,
        /(?:invoice|inv)\s*#?\s*([a-z0-9-]+)/i
    ];
    
    for (const pattern of invoicePatterns) {
        const match = content.match(pattern);
        if (match && match[1] && match[1].length > 2) {
            betterInvoiceNumber = match[1];
            break;
        }
    }

    return {
        containsInvoice,
        invoiceDetails: {
            vendor,
            amount,
            date: new Date().toISOString().split('T')[0],
            invoiceNumber: betterInvoiceNumber
        }
    };
}

async function analyzeEmail(emailContent) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            emailId: 'debug-test-email',
            emailContent: emailContent
        });

        const options = {
            hostname: 'localhost',
            port: 3004,
            path: '/api/analyze',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
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
                    reject(new Error('Failed to parse response'));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Run the debug test
debugInvoiceDetection().catch(console.error); 