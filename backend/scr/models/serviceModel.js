// Service model - Schema definition
export const serviceSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  name: 'VARCHAR(255)',
  description: 'TEXT',
  price: 'DECIMAL(10,2)',
  duration: 'INT',
  centreId: 'INT',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKey: 'FOREIGN KEY (centreId) REFERENCES centres(id)'
};
