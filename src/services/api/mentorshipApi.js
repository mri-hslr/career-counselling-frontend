import { apiClient } from "./apiClient";

// ── Mentor Profile ──────────────────────────────────────────────────────────

/** GET /api/v1/profiles/mentors/  → array of verified mentor objects */
export const listMentors = () => apiClient.get("/api/v1/profiles/mentors/");

/** POST /api/v1/profiles/mentors/  { expertise }
 *  → { mentor_id, message } */
export const createMentorProfile = (expertise) =>
  apiClient.post("/api/v1/profiles/mentors/", { expertise });

// ── Availability ─────────────────────────────────────────────────────────────

/** POST /api/v1/mentorship/availability/  { day_of_week, start_time, end_time }
 *  day_of_week: 0=Mon … 6=Sun   start_time/end_time: "HH:MM" */
export const setAvailability = ({ day_of_week, start_time, end_time }) =>
  apiClient.post("/api/v1/mentorship/availability/", { day_of_week, start_time, end_time });

/** GET /api/v1/mentorship/availability/{mentor_id}  → array of slot objects */
export const getMentorAvailability = (mentorId) =>
  apiClient.get(`/api/v1/mentorship/availability/${mentorId}`);

// ── Sessions ─────────────────────────────────────────────────────────────────

/** POST /api/v1/mentorship/sessions/
 *  { mentor_id, availability_id, scheduled_at (ISO datetime), duration_minutes? } */
export const bookSession = ({ mentor_id, availability_id, scheduled_at, duration_minutes = 60 }) =>
  apiClient.post("/api/v1/mentorship/sessions/", {
    mentor_id, availability_id, scheduled_at, duration_minutes,
  });

// ── Feedback ─────────────────────────────────────────────────────────────────

/** POST /api/v1/mentorship/feedback/mentor/
 *  { session_id, notes?, action_items? } */
export const submitMentorFeedback = ({ session_id, notes = "", action_items = "" }) =>
  apiClient.post("/api/v1/mentorship/feedback/mentor/", { session_id, notes, action_items });

/** POST /api/v1/mentorship/feedback/parent/
 *  { student_id, study_habits?, behavior_insights? } */
export const submitParentFeedback = ({ student_id, study_habits = "", behavior_insights = "" }) =>
  apiClient.post("/api/v1/mentorship/feedback/parent/", {
    student_id, study_habits, behavior_insights,
  });

// ── Parent / Student Linking ──────────────────────────────────────────────────

/** GET /api/v1/profiles/students/invite-code  → { invite_code } */
export const getStudentInviteCode = () =>
  apiClient.get("/api/v1/profiles/students/invite-code");

/** POST /api/v1/profiles/students/link/  { invite_code }
 *  → { message, student_id } */
export const linkParentToStudent = (invite_code) =>
  apiClient.post("/api/v1/profiles/students/link/", { invite_code });

/** GET /api/v1/roadmaps/{student_id}  → CareerRoadmapResponse */
export const getStudentRoadmap = (student_id) =>
  apiClient.get(`/api/v1/roadmaps/${student_id}`);
