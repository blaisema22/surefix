/**
 * Live SMS test — tests both Messaging Service SIDs to find the working one.
 * Run: node test-sms-live.js
 */
require('dotenv').config();
const twilio = require('twilio');

const ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;

// Test both service SIDs
const SERVICE_SIDS = [
    { label: 'Current (.env)',  sid: process.env.TWILIO_MESSAGING_SERVICE_SID },
    { label: 'New (from curl)', sid: 'MGb4f9c094e8f7ee45895db5e84279240a'   },
];

const TEST_PHONE = '+250785470311'; // Customer's number

async function test() {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    for (const svc of SERVICE_SIDS) {
        if (!svc.sid) { console.log(`⚠️  Skipping ${svc.label}: no SID`); continue; }
        try {
            console.log(`\n🔵 Testing [${svc.label}] → SID: ${svc.sid}`);
            const msg = await client.messages.create({
                messagingServiceSid: svc.sid,
                to: TEST_PHONE,
                body: `SureFix Test ✅ [${svc.label}] — If you receive this, SMS is working!`,
            });
            console.log(`✅ SUCCESS! Message SID: ${msg.sid} | Status: ${msg.status}`);
        } catch (err) {
            console.error(`❌ FAILED [${svc.label}]: ${err.message} (code: ${err.code})`);
        }
    }

    console.log('\n--- Done. Check +250785470311 for messages ---');
}

test();
