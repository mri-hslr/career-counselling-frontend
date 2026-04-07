import { apiClient } from './apiClient';

export const chatApi = {
  /**
   * GET /api/v1/chat/connections
   * Returns list of users this person has an accepted connection with.
   * Each item: { user_id, full_name, role, request_type }
   */
  getConnections: () => apiClient.get('/api/v1/chat/connections'),

  /**
   * GET /api/v1/chat/messages/{otherUserId}
   * Returns last-24h messages between current user and otherUserId.
   * Each item: { id, sender_id, message, sent_at, is_me }
   */
  getMessages: (otherUserId) =>
    apiClient.get(`/api/v1/chat/messages/${otherUserId}`),

  /**
   * DELETE /api/v1/chat/connections/{otherUserId}
   * Severs the connection and wipes all chat history between the pair.
   */
  deleteConnection: (otherUserId) =>
    apiClient.delete(`/api/v1/chat/connections/${otherUserId}`),
};
