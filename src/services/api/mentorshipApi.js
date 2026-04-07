import { apiClient } from "./apiClient";

export const mentorshipApi = {
  // ── MENTOR SEARCH (Student Side) ──────────────────────────────────────────

  /** * GET /api/v1/mentorship/search/
   * Semantic search to find mentors matching a specific career goal.
   */
  getRecommendedMentors: (careerTitle) => {
    const goal = careerTitle || 'technology engineering science business';
    return apiClient.get(`/api/v1/mentorship/search/?career_goal=${encodeURIComponent(goal)}`);
  },

  /** * GET /api/v1/mentorship/search/ (General list)
   */
  listMentors: (careerGoal = 'technology engineering science business') =>
    apiClient.get(`/api/v1/mentorship/search/?career_goal=${encodeURIComponent(careerGoal)}`),

  // ── MENTOR PROFILE (Mentor Side) ──────────────────────────────────────────

  /** GET /api/v1/profiles/mentors/me */
  getMentorProfile: () =>
    apiClient.get("/api/v1/profiles/mentors/me"),

  /** POST /api/v1/profiles/mentors/ */
  upsertMentorProfile: (profileData) =>
    apiClient.post("/api/v1/profiles/mentors/", profileData),

  // ── AVAILABILITY (Both Sides) ─────────────────────────────────────────────

  /** POST /api/v1/availability/ */
  setAvailability: (slots) =>
    apiClient.post("/api/v1/availability/", { slots }),

  /** GET /api/v1/availability/{mentor_id} */
  getMentorAvailability: (mentorId) =>
    apiClient.get(`/api/v1/availability/${mentorId}`),

  // ── SESSIONS & REQUESTS (Handshake) ───────────────────────────────────────

  /** * POST /api/v1/requests/ 
   * Student requests a specific slot from a mentor.
   */
  requestMentorSession: (mentorId, slotId, message = '') => {
    return apiClient.post("/api/v1/requests/", { 
      mentor_id: mentorId, 
      availability_id: slotId, 
      message 
    });
  },

  /** GET /api/v1/sessions/upcoming */
  getUpcomingSessions: () =>
    apiClient.get("/api/v1/sessions/upcoming"),

  /** GET /api/v1/requests/pending/ */
  getPendingRequests: () =>
    apiClient.get("/api/v1/requests/pending/"),

  /** POST /api/v1/requests/{request_id}/approve */
  approveRequest: (requestId) =>
    apiClient.post(`/api/v1/requests/${requestId}/approve`, {}),

  /** POST /api/v1/sessions/{session_id}/end */
  endSession: (sessionId) =>
    apiClient.post(`/api/v1/sessions/${sessionId}/end`, {}),

  // ── FEEDBACK ─────────────────────────────────────────────────────────────

  /** POST /api/v1/mentorship/feedback/mentor/ */
  submitMentorFeedback: ({ session_id, notes = "", action_items = "" }) =>
    apiClient.post("/api/v1/mentorship/feedback/mentor/", { session_id, notes, action_items }),

  /** POST /api/v1/parent/feedback */
  submitParentFeedback: ({ student_id, study_habits = "", behavior_insights = "" }) =>
    apiClient.post("/api/v1/parent/feedback", {
      student_id, study_habits, behavior_insights,
    }),
  
  getMentorDetails: (mentorId) => {
    return apiClient.get(`/api/v1/mentorship/mentors/${mentorId}`);
  },
  createMentorshipRequest: (mentorId, availabilityId, message = "") => {
    return apiClient.post("/api/v1/requests/create", {
      mentor_id: mentorId,
      availability_id: availabilityId,
      message: message
    });
  },

  /** POST /api/v1/sessions/{session_id}/join-video
   * Returns { token, meeting_id } — pass token to VideoCallRoom.
   */
  joinVideo: (sessionId) =>
    apiClient.post(`/api/v1/sessions/${sessionId}/join-video`, {}),

  // ── CONNECTION REQUESTS (no slot needed) ─────────────────────────────────

  /** POST /api/v1/connections/request — student sends generic connect request */
  sendConnectionRequest: (mentorId, message = "") =>
    apiClient.post("/api/v1/connections/request", { mentor_id: mentorId, message }),

  /** GET /api/v1/mentors/requests/pending — mentor views incoming connection requests */
  getPendingConnectionRequests: () =>
    apiClient.get("/api/v1/mentors/requests/pending"),

  /** GET /api/v1/mentors/students/:id/profile — mentor views student snapshot */
  getStudentProfile: (studentId) =>
    apiClient.get(`/api/v1/mentors/students/${studentId}/profile`),

  /** PATCH /api/v1/connections/:id/accept */
  acceptConnectionRequest: (requestId) =>
    apiClient.patch(`/api/v1/connections/${requestId}/accept`, {}),

  /** PATCH /api/v1/connections/:id/reject */
  rejectConnectionRequest: (requestId) =>
    apiClient.patch(`/api/v1/connections/${requestId}/reject`, {}),
};