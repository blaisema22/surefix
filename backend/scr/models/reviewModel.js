// Review model - Schema definition
export const reviewSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  userId: 'INT NOT NULL',
  centreId: 'INT NOT NULL',
  rating: 'INT',
  comment: 'TEXT',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKeyUser: 'FOREIGN KEY (userId) REFERENCES users(id)',
  foreignKeyCentre: 'FOREIGN KEY (centreId) REFERENCES centres(id)'
};
