import { apiClient } from './apiClient';

export const reportApi = {
  getMyReport: async () => {
    // IMPORTANT: It just says /me! Do not pass variables here.
    const response = await apiClient.get('/v1/reports/me');
    return response;
  }
};