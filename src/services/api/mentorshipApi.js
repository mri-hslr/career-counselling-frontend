import { apiClient } from "./apiClient";

export const mentorshipApi = {
  // ── MENTOR SEARCH (Student Side) ──────────────────────────────────────────
  getRecommendedMentors: (careerTitle) => {
    const goal = careerTitle || 'technology engineering science business';
    return apiClient.get(`/api/v1/mentorship/search/?career_goal=${encodeURIComponent(goal)}`);
  },
  listMentors: (careerGoal = 'technology engineering science business') =>
    apiClient.get(`/api/v1/mentorship/search/?career_goal=${encodeURIComponent(careerGoal)}`),
  getMentorDetails: (mentorId) =>
    apiClient.get(`/api/v1/mentorship/mentors/${mentorId}`),

  // ── MENTOR PROFILE (Mentor Side) ──────────────────────────────────────────
  getMentorProfile: () => apiClient.get("/api/v1/profiles/mentors/me"),
  upsertMentorProfile: (profileData) => apiClient.post("/api/v1/profiles/mentors/", profileData),

  // ── SESSIONS & BROADCASTING (The New Architecture) ────────────────────────
  /** POST /api/v1/sessions/broadcast — Mentor goes live */
  broadcastSession: (delayMinutes = 0, topic = "Open Mentorship Session") =>
    apiClient.post("/api/v1/sessions/broadcast", { delay_minutes: delayMinutes, topic }),

  /** GET /api/v1/sessions/upcoming — Feed of live/upcoming broadcasts */
  getUpcomingSessions: () => apiClient.get("/api/v1/sessions/upcoming"),

  /** POST /api/v1/sessions/{session_id}/join-video */
  joinVideo: (sessionId) => apiClient.post(`/api/v1/sessions/${sessionId}/join-video`, {}),

  /** POST /api/v1/sessions/{session_id}/end */
  endSession: (sessionId) => apiClient.post(`/api/v1/sessions/${sessionId}/end`, {}),

  // ── CONNECTION REQUESTS (Audience Building) ───────────────────────────────
  sendConnectionRequest: (mentorId, message = "") =>
    apiClient.post("/api/v1/connections/request", { mentor_id: mentorId, message }),
  getPendingConnectionRequests: () => apiClient.get("/api/v1/mentors/requests/pending"),
  getStudentProfile: (studentId) => apiClient.get(`/api/v1/mentors/students/${studentId}/profile`),
  acceptConnectionRequest: (requestId) => apiClient.patch(`/api/v1/connections/${requestId}/accept`, {}),
  rejectConnectionRequest: (requestId) => apiClient.patch(`/api/v1/connections/${requestId}/reject`, {}),

  // ── FEEDBACK ─────────────────────────────────────────────────────────────
  submitMentorFeedback: ({ session_id, notes = "", action_items = "" }) =>
    apiClient.post("/api/v1/mentorship/feedback/mentor/", { session_id, notes, action_items }),
  submitParentFeedback: ({ student_id, study_habits = "", behavior_insights = "" }) =>
    apiClient.post("/api/v1/parent/feedback", { student_id, study_habits, behavior_insights }),

  // ── SESSION STUDENT EVALUATIONS (New Additions) ────────────────────
  getCompletedSessions: () => 
    apiClient.get("/api/v1/sessions/completed"),
  getSessionStudents: (sessionId) => 
    apiClient.get(`/api/v1/sessions/${sessionId}/students`),
  submitFeedback: (sessionId, studentId, {rating, feedback}) =>
    apiClient.post(`api/v1/sessions/${sessionId}/students/${studentId}/feedback`, {
      rating,
      feedback
    })
};