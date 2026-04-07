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

/**
 * PATCH /api/v1/assessments/save-progress
 * Saves mid-test state so the student can resume later.
 */
export const saveTestProgress = ({ userId, testKey, sessionQuestions, answers, currentIndex }) =>
  apiClient.patch("/api/v1/assessments/save-progress", {
    user_id: userId,
    test_key: testKey,
    session_questions: sessionQuestions,
    answers,
    current_index: currentIndex,
  });

/**
 * GET /api/v1/assessments/progress/{testKey}/{userId}
 * Returns { in_progress, session_questions, answers, current_index } or { in_progress: false }
 */
export const getTestProgress = (testKey, userId) =>
  apiClient.get(`/api/v1/assessments/progress/${testKey}/${userId}`);
