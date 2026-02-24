// Appointment Service
import api from './api';

const appointmentService = {
  getAppointments: async (token) => {
    try {
      const response = await api.getAppointments(token);
      return response;
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      throw error;
    }
  },

  bookAppointment: async (appointmentData, token) => {
    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to book appointment:', error);
      throw error;
    }
  },

  cancelAppointment: async (appointmentId, token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${appointmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      throw error;
    }
  }
};

export default appointmentService;
