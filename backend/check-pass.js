const bcrypt = require('bcryptjs');
const hash = '$2a$12$rdu6namMM3NbVfUKKz5vtOZfZyDL8AjmZS4TFq0ctmNh2tfThSBYe';
console.log('Match Password@123:', bcrypt.compareSync('Password@123', hash));
console.log('Match password:', bcrypt.compareSync('password', hash));
