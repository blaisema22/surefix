// Debug script to check all routes
const routes = ['auth', 'devices', 'centres', 'appointments', 'services'];

routes.forEach(name => {
    try {
        const route = require(`./routes/${name}`);
        console.log(`${name}:`, typeof route, Array.isArray(route) ? 'array' : '', route && route.stack ? 'has stack (router)' : '');
    } catch (err) {
        console.log(`${name}: ERROR -`, err.message);
    }
});