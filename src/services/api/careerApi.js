import { apiClient } from "./apiClient";

/**
 * GET /api/v1/career/roadmap  (requires auth)
 * Resolves career goal in priority order:
 *   1. `career` query param  ← always send this
 *   2. aspiration_data.dream_career from DB
 *   3. Fallback: "Software Engineer"
 *
 * Returns CareerRoadmapResponse:
 *   { career_title, student_level, difficulty_level, total_duration, daily_commitment,
 *     phases[{ phase_number, phase_title, description, importance, duration_weeks,
 *              skills_targeted[], weekly_breakdown[{ week_number, topic, tasks[], resources[] }],
 *              milestone_project, success_criteria }],
 *     mentor_adjustments, parent_adjustments }
 */
export const getCareerRoadmap = (careerTitle, adjustmentNote) => {
  const qs = new URLSearchParams();
  if (careerTitle) qs.set('career', careerTitle);
  if (adjustmentNote) qs.set('notes', adjustmentNote);
  const params = qs.toString() ? `?${qs.toString()}` : '';
  return apiClient.get(`/api/v1/career/roadmap${params}`);
};

/**
 * POST /api/v1/ai/recommend  (requires auth)
 * Returns: { brutal_truth_summary, top_5_careers[{ title, rationale }] }
 */
export const getAIRecommendations = () => apiClient.post("/api/v1/ai/recommend", {});
