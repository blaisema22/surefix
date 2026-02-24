// Centre Service
import api from './api';

const centreService = {
  getAllCentres: async () => {
    try {
      const response = await api.getCentres();
      return response;
    } catch (error) {
      console.error('Failed to fetch centres:', error);
      throw error;
    }
  },

  getCentre: async (id) => {
    try {
      const response = await api.getCentre(id);
      return response;
    } catch (error) {
      console.error('Failed to fetch centre:', error);
      throw error;
    }
  },

  searchCentres: async (query) => {
    try {
      const response = await api.getCentres();
      return response.filter(centre =>
        centre.name.toLowerCase().includes(query.toLowerCase()) ||
        centre.city.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search centres:', error);
      throw error;
    }
  }
};

export default centreService;
