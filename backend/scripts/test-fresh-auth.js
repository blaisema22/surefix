// Force fresh require
const path = require('path');

// Clear all require cache
Object.keys(require.cache).forEach(function(key) {
    delete require.cache[key];
});

// Now test loading auth
const authModule = require('./routes/auth.js');
console.log('Auth module type:', typeof authModule);
console.log('Has stack property:', authModule.stack ? 'yes' : 'no');
console.log('Keys:', Object.keys(authModule));