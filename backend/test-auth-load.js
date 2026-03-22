// Test loading auth.js with verbose error output
process.on('uncaughtException', function(err) {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', function(reason, promise) {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

try {
    console.log('Loading auth module...');
    const authRoutes = require('./routes/auth.js');
    console.log('Auth loaded successfully!');
    console.log('Type:', typeof authRoutes);
    console.log('Keys:', Object.keys(authRoutes));
    if (authRoutes && authRoutes.stack) {
        console.log('Has stack (router):', true);
    } else {
        console.log('Has stack:', !!authRoutes.stack);
    }
} catch (e) {
    console.error('Error loading auth:', e.message);
    console.error(e.stack);
}