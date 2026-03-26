/**
 * SureFix Appointment SMS Service
 * Central service for dispatching SMS notifications on appointment lifecycle events.
 */
const { sendSMS } = require('../utils/sms');
const { templates } = require('../utils/smsTemplates');

const appointmentSMSService = {

    onBooked: async (appointment, customerPhone, shopPhone) => {
        // Customer confirmation
        if (customerPhone) {
            await sendSMS(customerPhone, templates.bookingConfirmed(appointment));
        }
        // Shop notification
        if (shopPhone) {
            await sendSMS(shopPhone, templates.shopNewBooking(appointment));
        }
    },

    onConfirmed: async (appointment, customerPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.statusConfirmed(appointment));
        }
    },

    onStarted: async (appointment, customerPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.repairStarted(appointment));
        }
    },

    onCompleted: async (appointment, customerPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.repairCompleted(appointment));
        }
    },

    onCancelled: async (appointment, customerPhone, shopPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.appointmentCancelled(appointment));
        }
        if (shopPhone) {
            await sendSMS(shopPhone, templates.shopCancelled(appointment));
        }
    },

    onReminder24h: async (appointment, customerPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.reminder24h(appointment));
        }
    },

    onReminder1h: async (appointment, customerPhone) => {
        if (customerPhone) {
            await sendSMS(customerPhone, templates.reminder1h(appointment));
        }
    },
};

module.exports = appointmentSMSService;
