import { apiClient } from "./apiClient";

/**
 * GET /api/v1/career/roadmap
 * Returns: { career_title, difficulty_level, total_duration, phases[] }
 */
export const getCareerRoadmap = () => apiClient.get("/api/v1/career/roadmap");

/**
 * POST /api/v1/ai/recommend  (requires auth token)
 * Returns: { brutal_truth_summary, top_5_careers[] }
 */
export const getAIRecommendations = () => apiClient.post("/api/v1/ai/recommend", {});
