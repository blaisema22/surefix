require('dotenv').config();
const { pool } = require('./config/db');
const { sendSMS } = require('./utils/sms');
const appointmentSMS = require('./services/appointmentSMS.service');

console.log('🧪 Full SMS Test Suite - SureFix');

async function test() {
    try {
        // 1. Test basic sendSMS
        console.log('\n1️⃣ Testing basic sendSMS...');
        await sendSMS('0781234567', '🧪 Test SMS from SureFix - Basic send works!');

        // 2. Test appointment lifecycle (sample data)
        console.log('\n2️⃣ Testing appointment SMS service...');
        const sampleAppt = {
            customer_name: 'Test User',
            centre_name: 'Test Repair Centre',
            booking_reference: 'SFTEST123',
            appointment_date: '2024-04-15',
            appointment_time: '14:00',
            service_name: 'Screen Repair',
            device_brand: 'Samsung',
            device_model: 'Galaxy S21'
        };

        await appointmentSMS.onBooked(sampleAppt, '0781234567', '0789876543');
        await appointmentSMS.onConfirmed(sampleAppt, '0781234567');
        await appointmentSMS.onStarted(sampleAppt, '0781234567');
        await appointmentSMS.onCompleted(sampleAppt, '0781234567');
        await appointmentSMS.onReminder24h(sampleAppt, '0781234567');

        // 3. Verify in DB
        const [msgs] = await pool.query('SELECT COUNT(*) as count FROM sms_simulator WHERE phone_number = ? AND message LIKE ?', ['+250781234567', '%Test%']);
        console.log(`\n✅ DB Check: ${msgs[0].count} SMS logged for test phone`);

        console.log('\n🎉 All tests passed! Check console/DB/inbox at /sms');
        console.log('💡 Login as customer with phone 0781234567 to see messages');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    } finally {
        pool.end();
    }
}

test();