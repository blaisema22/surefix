
const http = require('http');

// Test registration
const registerData = JSON.stringify({
  email: 'newtest@test.com',
  password: 'test123456',
  name: 'Test User',
  phone: '+1234567890'
});

const registerOptions = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

const req = http.request(registerOptions, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Register Status:', res.statusCode);
    console.log('Register Response:', body);
    
    // Now try to login
    const loginData = JSON.stringify({
      email: 'newtest@test.com',
      password: 'test123456'
    });

    const loginOptions = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };

    const loginReq = http.request(loginOptions, (loginRes) => {
      let loginBody = '';
      loginRes.on('data', (chunk) => loginBody += chunk);
      loginRes.on('end', () => {
        console.log('Login Status:', loginRes.statusCode);
        console.log('Login Response:', loginBody);
      });
    });

    loginReq.on('error', (e) => console.error('Error:', e.message));
    loginReq.write(loginData);
    loginReq.end();
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(registerData);
req.end();

