import React, { useState, useEffect } from 'react';
import { ClipboardList, User, Star, Send, Loader2, CheckCircle2, Calendar, ChevronRight } from 'lucide-react';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { toISTDate, toISTTime } from '../utils/time'; 

export default function FeedbackTab({ toast }) {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch completed sessions on mount
  useEffect(() => {
    mentorshipApi.getCompletedSessions()
      .then(data => setSessions(data || []))
      .catch(err => {
        console.error("Failed to load sessions:", err);
        // Fallback mock data for UI testing
        // setSessions([
        //   { session_id: '1', topic: 'React System Design', scheduled_at: new Date().toISOString() },
        //   { session_id: '2', topic: 'Career Roadmap Q&A', scheduled_at: new Date(Date.now() - 86400000).toISOString() }
        // ]);
      })
      .finally(() => setLoadingSessions(false));
  }, []);

  // 2. Fetch students when a session is selected
  useEffect(() => {
    if (!selectedSession) return;
    
    setLoadingStudents(true);
    setSelectedStudent(null);
    setRating(0);
    setFeedbackText('');

    mentorshipApi.getSessionStudents(selectedSession.session_id)
      .then(data => setStudents(data || []))
      .catch(err => {
        console.error("Failed to load students:", err);
        // Fallback mock data for UI testing
        setStudents([
          { id: '101', name: 'Aarav Sharma', status: 'pending' },
          { id: '102', name: 'Priya Patel', status: 'completed' }
        ]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedSession]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || rating === 0 || !feedbackText.trim()) return;

    setSubmitting(true);
    try {
      await mentorshipApi.submitFeedback(selectedSession.session_id, selectedStudent.id, { rating, feedback: feedbackText });
      
      // Simulate network request
      await new Promise(r => setTimeout(r, 800));
      
      // Mark student as completed locally
      setStudents(prev => prev.map(s => 
        s.id === selectedStudent.id ? { ...s, status: 'completed' } : s
      ));
      
      toast('Feedback submitted successfully.', 'success');
      setRating(0);
      setFeedbackText('');
      setSelectedStudent(null);
    } catch (err) {
      toast(err.message || 'Failed to submit feedback.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl h-[650px] flex flex-col">
      <div className="mb-6 shrink-0">
        <h3 className="text-2xl font-black text-slate-800">Session Feedback</h3>
        <p className="text-slate-500 font-bold">Evaluate student performance from recent broadcasts.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left Pane: Selection */}
        <div className="w-80 shrink-0 flex flex-col gap-4">
          
          {/* Session Selection */}
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 flex flex-col min-h-[200px]">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Completed Sessions</h4>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loadingSessions ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-500" /></div>
              ) : sessions.length === 0 ? (
                <p className="text-xs font-bold text-slate-400 text-center py-8">No completed sessions.</p>
              ) : (
                sessions.map(session => (
                  <button
                    key={session.session_id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      selectedSession?.session_id === session.session_id 
                        ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10' 
                        : 'bg-slate-50 border-transparent hover:border-slate-200'
                    }`}
                  >
                    <p className="font-bold text-slate-800 text-sm truncate">{session.topic || 'Mentorship Session'}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar size={10} /> {toISTDate(session.scheduled_at)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Student Selection (Only visible if session selected) */}
          {selectedSession && (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 flex-1 flex flex-col min-h-0">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Session Roster</h4>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {loadingStudents ? (
                  <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-500" /></div>
                ) : students.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-8">No students found.</p>
                ) : (
                  students.map(student => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all border ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                          student.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {student.status === 'completed' ? <CheckCircle2 size={12} /> : <User size={12} />}
                        </div>
                        <span className="text-sm font-bold truncate">{student.name}</span>
                      </div>
                      <ChevronRight size={14} className="opacity-40 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Form */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col overflow-y-auto">
          {!selectedSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <ClipboardList size={48} className="opacity-20 mb-4" />
              <h4 className="text-xl font-black text-slate-800 mb-2">Select a Session</h4>
              <p className="text-sm font-medium">Choose a completed session from the list to begin evaluations.</p>
            </div>
          ) : !selectedStudent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <User size={48} className="opacity-20 mb-4" />
              <h4 className="text-xl font-black text-slate-800 mb-2">Select a Student</h4>
              <p className="text-sm font-medium">Choose a student from the roster to provide feedback.</p>
            </div>
          ) : selectedStudent.status === 'completed' ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50 rounded-3xl border border-emerald-100">
              <CheckCircle2 size={48} className="text-emerald-500 mb-4" />
              <h4 className="text-xl font-black text-emerald-800 mb-2">Evaluation Complete</h4>
              <p className="text-sm font-medium text-emerald-600">You have already submitted feedback for {selectedStudent.name}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full">
              <div className="mb-8 border-b border-slate-100 pb-4 shrink-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Evaluating</p>
                <h3 className="text-2xl font-black text-slate-800">{selectedStudent.name}</h3>
              </div>

              <div className="mb-8 shrink-0">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                  Performance Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-3 rounded-2xl transition-colors ${
                        rating >= star ? 'text-amber-500 bg-amber-50 shadow-inner' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-50 border border-slate-100'
                      }`}
                    >
                      <Star size={32} fill={rating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8 flex-1 flex flex-col min-h-[150px]">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 shrink-0">
                  Detailed Insights
                </label>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Detail the student's progress, strengths, and areas for improvement..."
                  className="flex-1 w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-emerald-500 focus:bg-white outline-none resize-none font-medium text-slate-700 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting || rating === 0 || !feedbackText.trim()}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shrink-0"
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                SUBMIT EVALUATION
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}