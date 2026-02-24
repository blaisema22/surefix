// Centre model - Schema definition
export const centreSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  name: 'VARCHAR(255) NOT NULL',
  address: 'VARCHAR(255)',
  city: 'VARCHAR(100)',
  phoneNumber: 'VARCHAR(20)',
  email: 'VARCHAR(255)',
  services: 'TEXT',
  rating: 'DECIMAL(3,2)',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};
