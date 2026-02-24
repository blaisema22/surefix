// Appointment model - Schema definition
export const appointmentSchema = {
  id: 'INT AUTO_INCREMENT PRIMARY KEY',
  userId: 'INT NOT NULL',
  centreId: 'INT NOT NULL',
  deviceId: 'INT NOT NULL',
  serviceId: 'INT NOT NULL',
  Name_user: 'VARCHAR(255)',
  Phone: 'VARCHAR(20)',
  Device: 'VARCHAR(255)',
  Description: 'TEXT',
  Status: 'VARCHAR(50)',
  appointmentDate: 'DATE',
  appointmentTime: 'TIME',
  createdAt: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKeyUser: 'FOREIGN KEY (userId) REFERENCES users(id)',
  foreignKeyCentre: 'FOREIGN KEY (centreId) REFERENCES centres(id)',
  foreignKeyDevice: 'FOREIGN KEY (deviceId) REFERENCES devices(id)',
  foreignKeyService: 'FOREIGN KEY (serviceId) REFERENCES services(id)'
};
