import { apiClient } from './apiClient';

export const roadmapApi = {
  // 1. Generate the roadmap
  generateRoadmap: async (careerTitle) => {
    return apiClient.get(`/api/v1/roadmaps/generate?career=${encodeURIComponent(careerTitle)}`);
  },

  // 2. Save the generated roadmap to the database
  saveRoadmap: async (roadmapData) => {
    return apiClient.post("/api/v1/roadmaps/save", roadmapData);
  },

  // 3. Fetch the active/current roadmap
  getActiveRoadmap: async () => {
    return apiClient.get("/api/v1/roadmaps/current");
  },

  // 4. Start the journey
  startRoadmap: async () => {
    return apiClient.post("/api/v1/roadmaps/start", {});
  },

  // 5. Toggle a task
  toggleTaskComplete: async (taskId) => {
    return apiClient.patch(`/api/v1/roadmaps/tasks/${taskId}/complete`, {});
  },

  // 6. Fetch another student's roadmap (for mentors/parents)
  getStudentRoadmap: async (studentId) => {
    return apiClient.get(`/api/v1/roadmaps/student/${studentId}`);
  },
};