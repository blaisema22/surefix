// User model - Schema definition
export const userSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  name: 'VARCHAR(255) NOT NULL',
  email: 'VARCHAR(255) UNIQUE NOT NULL',
  password: 'VARCHAR(255) NOT NULL',
  phone: 'VARCHAR(20)',
  address: 'VARCHAR(255)',
  city: 'VARCHAR(100)',
  postCode: 'VARCHAR(20)',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};
