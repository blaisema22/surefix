// Device model - Schema definition
export const deviceSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  userId: 'INT NOT NULL',
  name: 'VARCHAR(255)',
  brand: 'VARCHAR(100)',
  model: 'VARCHAR(100)',
  serialNumber: 'VARCHAR(255)',
  purchaseDate: 'DATE',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKey: 'FOREIGN KEY (userId) REFERENCES users(id)'
};
