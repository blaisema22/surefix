const fs = require('fs');
const path = require('path');

const authPath = path.join(__dirname, 'routes', 'auth.js');
const stats = fs.statSync(authPath);

console.log('Auth.js file stats:');
console.log('  Size:', stats.size, 'bytes');
console.log('  Created:', stats.birthtime);
console.log('  Modified:', stats.mtime);

if (stats.size > 0) {
    const content = fs.readFileSync(authPath, 'utf8');
    console.log('  First 100 chars:', content.substring(0, 100));
    console.log('  Last 100 chars:', content.substring(content.length - 100));
    console.log('  Total length:', content.length);
} else {
    console.log('  FILE IS EMPTY!');
}