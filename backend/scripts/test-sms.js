require('dotenv').config();
const { sendSMS } = require('./utils/sms');

console.log('Testing SMS function...');

async function test() {
    // We will attempt to send an SMS to a test number or see what the credentials do.
    await sendSMS('0781234567', 'Test SMS from SureFix Debug Tool');
    console.log('Test function finished executing.');
}

test();
