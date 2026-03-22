const axios = require('axios');

(async() => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'testuser2026@example.com',
            password: 'Password@123'
        });
        console.log('status', res.status);
        console.log(res.data);
    } catch (error) {
        if (error.response) {
            console.log('status', error.response.status);
            console.log('body', error.response.data);
        } else {
            console.error('error', error.message);
        }
        process.exit(1);
    }
})();