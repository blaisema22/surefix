const axios = require('axios');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function testCentresAPI() {
    console.log(`Testing API at: ${API_URL}`);

    try {
        // Test health endpoint first
        console.log('\n1. Testing health endpoint...');
        const healthRes = await axios.get(`${API_URL}/health`);
        console.log('✅ Health check:', healthRes.data);

        // Test centres endpoint
        console.log('\n2. Testing centres endpoint...');
        const centresRes = await axios.get(`${API_URL}/centres`);
        console.log('✅ Centres response:', JSON.stringify(centresRes.data, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('\n❌ API Error:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', err.response.data);
        } else if (err.request) {
            console.error('No response received - backend may not be running');
            console.error('Error:', err.message);
        } else {
            console.error('Error:', err.message);
        }
        process.exit(1);
    }
}

testCentresAPI();