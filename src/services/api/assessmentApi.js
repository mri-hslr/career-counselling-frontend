import { apiClient } from "./apiClient";

/**
 * GET /api/v1/assessments/questions/{module_name}
 * module_name: e.g. "aptitude", "personality"
 * target_grade: required for aptitude, e.g. "10"
 */
export const getModuleQuestions = (moduleName, targetGrade) => {
  const params = targetGrade ? `?target_grade=${encodeURIComponent(targetGrade)}` : "";
  return apiClient.get(`/api/v1/assessments/questions/${moduleName}${params}`);
};

/**
 * GET /api/v1/assessments/aptitude/generate/assessment-pool
 * target_grade: required, e.g. "10"
 * Returns 45 questions (15 per category × 3 difficulty levels)
 */
export const getAptitudePool = (targetGrade) =>
  apiClient.get(
    `/api/v1/assessments/aptitude/generate/assessment-pool?target_grade=${encodeURIComponent(targetGrade)}`
  );

/**
 * POST /api/v1/assessments/submit-generic
 * body: { user_id, module_key, payload: {} }
 */
export const submitAssessment = ({ userId, moduleKey, payload }) =>
  apiClient.post("/api/v1/assessments/submit-generic", {
    user_id: userId,
    module_key: moduleKey,
    payload,
  });

/**
 * POST /api/v1/profile/build
 * body: { basic_info: { grade, interests[] }, aptitude: { quantitative, logical, verbal }, personality: { dominant_traits[], raw_scores } }
 * Returns: { status, profile_json }
 */
export const buildProfile = (profileData) =>
  apiClient.post("/api/v1/profile/build", profileData);
