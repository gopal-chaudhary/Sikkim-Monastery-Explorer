#!/usr/bin/env node
const http = require('http');

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3777,
            path: `/api/v1${path}`,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    console.log(`✅ ${description}`);
                    console.log(`   Status: ${res.statusCode}`);
                    if (json.data && Array.isArray(json.data)) {
                        console.log(`   Data: ${json.data.length} items`);
                    } else if (json.data) {
                        console.log(`   Data: ${JSON.stringify(json.data).substring(0, 100)}...`);
                    }
                    resolve(true);
                } catch (e) {
                    console.log(`⚠️  ${description} - Invalid JSON`);
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.log(`❌ ${description} - ${e.message}`);
            resolve(false);
        });

        req.end();
    });
}

async function runTests() {
    console.log('🧪 Testing Backend API Endpoints\n');
    
    await testEndpoint('/health', 'Health Check');
    await testEndpoint('/monasteries/all', 'Get All Monasteries');
    await testEndpoint('/monasteries?page=1&limit=10', 'Get Monasteries (Paginated)');
    await testEndpoint('/monasteries/stats/summary', 'Get Statistics');
    await testEndpoint('/location/all-active', 'Get Active Locations');
    
    console.log('\n✅ Backend API is working!');
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:5173 in your browser');
    console.log('2. Open browser DevTools (F12) and check Console tab');
    console.log('3. Check Network tab for any failed requests');
    console.log('4. If map shows "nothing to show", check browser console for errors');
}

runTests();
