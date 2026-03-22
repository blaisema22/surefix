require('dotenv').config({ path: __dirname + '/.env' });
const axios = require('axios');

const PORT = process.env.PORT || 5000;
const API_URL = `http://localhost:${PORT}/api`;

// Use a known demo user from schema.sql
const TEST_USER = {
    email: 'alice@example.com',
    password: 'Password@123', // Default password for all demo accounts
};

const newDeviceData = {
    brand: 'TestBrand',
    model: 'TestModel X',
    device_type: 'smartphone',
    issue_description: 'Test issue: screen is cracked.',
};

const updatedDeviceData = {
    brand: 'TestBrandUpdated',
    model: 'TestModel X Plus',
    device_type: 'smartphone', // This field is required for validation but was missing.
    issue_description: 'Updated issue: screen and battery need replacement.',
};

/**
 * Logs in a test user and returns the auth token.
 * @returns {Promise<string>} The JWT auth token.
 */
async function loginAndGetToken() {
    console.log(`1. Logging in as ${TEST_USER.email}...`);
    try {
        const response = await axios.post(`${API_URL}/auth/login`, TEST_USER);
        if (!response.data.token) {
            throw new Error('Login failed, no token received.');
        }
        console.log('   ✅ Login successful.');
        return response.data.token;
    } catch (error) {
        console.error('   ❌ Login failed:', error.response?.data?.message || error.message);
        process.exit(1);
    }
}

/**
 * Main test runner function
 */
async function runDeviceTests() {
    const token = await loginAndGetToken();

    // Create an Axios instance with the auth token for all subsequent requests
    const api = axios.create({
        baseURL: API_URL,
        headers: { 'Authorization': `Bearer ${token}` }
    });

    let newDeviceId;

    try {
        // --- 2. Test POST /api/devices (Create) ---
        console.log('\n2. Testing POST /api/devices (Create)...');
        const createResponse = await api.post('/devices', { ...newDeviceData, purchase_year: 2023 });
        newDeviceId = createResponse.data.device.device_id;
        if (createResponse.status !== 201 || !newDeviceId) {
            throw new Error('Device creation did not return status 201 or a device ID.');
        }
        console.log(`   ✅ Device created successfully with ID: ${newDeviceId}`);

        // --- 3. Test GET /api/devices (Read All) ---
        console.log('\n3. Testing GET /api/devices (Read All)...');
        const getResponse = await api.get('/devices');
        const foundDevice = getResponse.data.devices.find(d => d.device_id === newDeviceId);
        if (getResponse.status !== 200 || !foundDevice) {
            throw new Error('Could not find the newly created device in the list.');
        }
        console.log('   ✅ Fetched all devices and found the new device.');

        // --- 4. Test PUT /api/devices/:id (Update) ---
        console.log(`\n4. Testing PUT /api/devices/${newDeviceId} (Update)...`);
        const updateResponse = await api.put(`/devices/${newDeviceId}`, updatedDeviceData);
        if (updateResponse.status !== 200) {
            throw new Error('Device update did not return status 200.');
        }
        // Verify the update
        const verifyResponse = await api.get('/devices');
        const updatedDevice = verifyResponse.data.devices.find(d => d.device_id === newDeviceId);
        if (updatedDevice.brand !== 'TestBrandUpdated') {
            throw new Error('Device brand was not updated correctly.');
        }
        console.log('   ✅ Device updated successfully.');

    } catch (error) {
        console.error('   ❌ A test failed:', error.response?.data?.message || error.message);

    } finally {
        // --- 5. Test DELETE /api/devices/:id (Cleanup) ---
        if (newDeviceId) {
            try {
                console.log(`\n5. Testing DELETE /api/devices/${newDeviceId} (Cleanup)...`);
                const deleteResponse = await api.delete(`/devices/${newDeviceId}`);
                if (deleteResponse.status !== 200) {
                    throw new Error('Device deletion did not return status 200.');
                }
                console.log('   ✅ Device deleted successfully.');
            } catch (error) {
                console.error('   ❌ Cleanup failed:', error.response?.data?.message || error.message);
            }
        }
    }
    console.log('\n✨ All device endpoint tests completed.');
}

runDeviceTests();