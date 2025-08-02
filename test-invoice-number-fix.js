const http = require('http');

// Test and fix invoice number extraction
async function testInvoiceNumberExtraction() {
    console.log('🔍 Testing Invoice Number Extraction Fix\n');

    const testContent = 'Dear Customer, Please find attached invoice #INV-2024-001 for services rendered. Amount due: $2,500.00. Payment due by 30 days.';
    
    console.log('📧 Test Content:', testContent);
    console.log('\n🔍 Testing Different Patterns:');
    
    // Pattern 1: INV-YYYY-NNN format
    const invPattern = testContent.match(/inv-[\d-]+/i);
    console.log(`Pattern 1 (INV-YYYY-NNN): ${invPattern ? invPattern[0] : 'Not found'}`);
    
    // Pattern 2: invoice #INV-2024-001
    const pattern2 = testContent.match(/invoice\s*#?\s*([a-z0-9-]+)/i);
    console.log(`Pattern 2 (invoice #XXX): ${pattern2 ? pattern2[1] : 'Not found'}`);
    
    // Pattern 3: #INV-2024-001
    const pattern3 = testContent.match(/#([a-z0-9-]+)/i);
    console.log(`Pattern 3 (#XXX): ${pattern3 ? pattern3[1] : 'Not found'}`);
    
    // Pattern 4: invoice # INV-2024-001
    const pattern4 = testContent.match(/invoice\s*#\s*([a-z0-9-]+)/i);
    console.log(`Pattern 4 (invoice # XXX): ${pattern4 ? pattern4[1] : 'Not found'}`);
    
    // Pattern 5: invoice #INV-2024-001
    const pattern5 = testContent.match(/invoice\s*#([a-z0-9-]+)/i);
    console.log(`Pattern 5 (invoice #XXX): ${pattern5 ? pattern5[1] : 'Not found'}`);
    
    // Test the actual content from the email
    console.log('\n🔍 Testing with Actual Email Content:');
    const emailContent = {
        subject: 'Invoice for Web Development Services - ABC Company',
        from: 'billing@abc-company.com',
        body: 'Dear Customer, Please find attached invoice #INV-2024-001 for services rendered. Amount due: $2,500.00. Payment due by 30 days. Thank you for your business.'
    };
    
    const content = `${emailContent.subject} ${emailContent.body}`.toLowerCase();
    console.log('Content to analyze:', content);
    
    // Test all patterns on the actual content
    console.log('\n🔍 Testing Patterns on Actual Content:');
    
    const patterns = [
        { name: 'INV-YYYY-NNN', pattern: /inv-[\d-]+/i },
        { name: 'invoice #XXX', pattern: /invoice\s*#?\s*([a-z0-9-]+)/i },
        { name: '#XXX', pattern: /#([a-z0-9-]+)/i },
        { name: 'invoice # XXX', pattern: /invoice\s*#\s*([a-z0-9-]+)/i },
        { name: 'invoice #XXX', pattern: /invoice\s*#([a-z0-9-]+)/i }
    ];
    
    for (const { name, pattern } of patterns) {
        const match = content.match(pattern);
        console.log(`${name}: ${match ? (match[1] || match[0]) : 'Not found'}`);
    }
    
    // Test the current extraction logic
    console.log('\n🔍 Testing Current Extraction Logic:');
    let betterInvoiceNumber = 'N/A';
    
    // First try to find INV-YYYY-NNN format
    const invPattern2 = content.match(/inv-[\d-]+/i);
    if (invPattern2) {
        betterInvoiceNumber = invPattern2[0];
        console.log(`Found INV pattern: ${betterInvoiceNumber}`);
    } else {
        // Try other patterns
        const invoicePatterns = [
            /invoice\s*#?\s*([a-z0-9-]+)/i,
            /(?:invoice|inv)[\s#-]*([a-z0-9-]+)/i,
            /#([a-z0-9-]+)/i,
            /invoice\s+number[:\s]*([a-z0-9-]+)/i
        ];
        
        for (const pattern of invoicePatterns) {
            const match = content.match(pattern);
            if (match && match[1] && match[1].length > 2) {
                betterInvoiceNumber = match[1];
                console.log(`Found pattern match: ${betterInvoiceNumber}`);
                break;
            }
        }
    }
    
    console.log(`Final result: ${betterInvoiceNumber}`);
}

// Test the enhanced analyzer
async function testEnhancedAnalyzer() {
    console.log('\n🔍 Testing Enhanced Analyzer:');
    
    const emailContent = {
        subject: 'Invoice for Web Development Services - ABC Company',
        from: 'billing@abc-company.com',
        body: 'Dear Customer, Please find attached invoice #INV-2024-001 for services rendered. Amount due: $2,500.00. Payment due by 30 days. Thank you for your business.'
    };
    
    try {
        const result = await analyzeEmail(emailContent, 3005);
        console.log('Enhanced Analyzer Result:');
        console.log(`  Contains Invoice: ${result.containsInvoice}`);
        console.log(`  Invoice Number: ${result.invoiceDetails.invoiceNumber}`);
        console.log(`  Amount: ${result.invoiceDetails.amount}`);
        console.log(`  Vendor: ${result.invoiceDetails.vendor}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
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
            timeout: 5000
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

// Run the tests
async function runTests() {
    await testInvoiceNumberExtraction();
    await testEnhancedAnalyzer();
}

runTests().catch(console.error); 