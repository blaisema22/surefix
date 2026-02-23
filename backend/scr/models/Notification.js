// Notification model - Schema definition
export const notificationSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  userId: 'INT NOT NULL',
  message: 'TEXT',
  isRead: 'BOOLEAN DEFAULT FALSE',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKey: 'FOREIGN KEY (userId) REFERENCES users(id)'
};
