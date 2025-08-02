const http = require('http');

// Test invoice detection directly
async function testInvoiceDetection() {
    console.log('🧪 Testing Invoice Detection...\n');

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
        console.log(`📧 Testing: ${testEmail.name}`);
        console.log(`Subject: ${testEmail.content.subject}`);
        console.log(`From: ${testEmail.content.from}`);
        console.log(`Body: ${testEmail.content.body.substring(0, 100)}...`);
        
        try {
            const result = await analyzeEmail(testEmail.content);
            console.log(`✅ Result: ${result.containsInvoice ? 'INVOICE DETECTED' : 'No invoice'}`);
            if (result.containsInvoice) {
                console.log(`💰 Amount: ${result.invoiceDetails.amount}`);
                console.log(`🏢 Vendor: ${result.invoiceDetails.vendor}`);
                console.log(`🔢 Invoice #: ${result.invoiceDetails.invoiceNumber}`);
            }
            console.log(`📊 Topics: ${result.topics.join(', ')}`);
            console.log(`⚡ Urgency: ${result.urgency}`);
            console.log(`🔧 Method: ${result.analysisMethod}\n`);
        } catch (error) {
            console.error(`❌ Error: ${error.message}\n`);
        }
    }
}

async function analyzeEmail(emailContent) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            emailId: 'test-email',
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

// Run the test
testInvoiceDetection().catch(console.error); 