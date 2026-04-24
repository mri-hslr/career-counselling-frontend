import React, { useState, useEffect, useCallback } from 'react';
import { toISTTime, toISTDate } from '../utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, Video, Settings, LogOut,
  Bell, User, Brain, Zap, Sparkles, ChevronRight, CheckCircle2,
  Lock, ArrowRight, Users, Loader2, TrendingUp,
  CalendarClock, X, Radio, MessageSquare, PhoneCall, Trash2,
  Heart, Target, Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { getUserDisplayName, clearUserSession } from '../utils/jwt';
import { getSelectedCareer } from '../services/api/careerApi';
import { roadmapApi } from '../services/api/roadmapApi';
import { parentStudentApi } from '../services/api/parentStudentApi';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { chatApi } from '../services/api/chatApi';
import { apiClient } from '../services/api/apiClient';
import VideoCallRoom from '../components/VideoCallRoom';
import LanguageSelector from '../components/LanguageSelector';

import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';
import { ShinyOverlay } from '../components/ui/Animations';
import SessionChat from '../components/SessionChat';
import PsychometricTestModal from './PsychometricTestModal';

// ============================================================================
// HELPER HOOKS & COMPONENTS
// ============================================================================

function useUserProgress() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/v1/auth/users/me');
      setUserData(response);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const progress = {
    profileDone: userData?.progress?.profile_done ?? false,
    personalityDone: userData?.progress?.personality_done ?? false,
    aptitudeDone: userData?.progress?.aptitude_done ?? false,
    eqDone: !!userData?.eq_data,
    orientationDone: !!userData?.orientation_data,
    interestDone: !!userData?.career_interest_data,
    
    personalityData: userData?.personality_data ?? null,
    aptiData: userData?.apti_data ?? null,
  };

  // Phase 3 unlocks only when ALL 5 tests are done
  progress.assessmentsDone = 
    progress.personalityDone && 
    progress.aptitudeDone && 
    progress.eqDone && 
    progress.orientationDone && 
    progress.interestDone;

  return { progress, loading, refetch: fetchUserData, userId: userData?.id };
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 font-semibold text-left ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-slate-500 hover:bg-blue-50/50 hover:text-blue-600 hover:translate-x-1'
      }`}
    >
      <Icon size={20} className={`mr-3 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} />
      {label}
    </button>
  );
}

function PhaseStep({ number, label, status, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 hover:scale-105 transition-transform duration-300 cursor-default">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all duration-300 ${
        status === 'done'   ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' :
        status === 'active' ? `${color} border-transparent text-white shadow-lg scale-110` :
        'bg-slate-100 border-slate-200 text-slate-400'
      }`}>
        {status === 'done' ? <CheckCircle2 size={18} /> : status === 'locked' ? <Lock size={14} /> : number}
      </div>
      <span className={`text-xs font-bold text-center leading-tight w-16 transition-colors duration-300 ${
        status === 'done' ? 'text-emerald-600' : status === 'active' ? 'text-slate-900' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );
}

function ScoreBar({ label, value, max = 100, color = 'bg-blue-500' }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs font-semibold mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-800">{value}/{max}</span>
      </div>
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
}

// Completed test card for personality
function PersonalityCompletedCard({ personalityData }) {
  const dominantTraits = personalityData?.dominant_traits ?? [];
  return (
    <div className="flex-1 bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
          <Brain size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-sm text-slate-800">Personality Test</p>
          <p className="text-xs text-emerald-600 font-bold"> Completed</p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      {dominantTraits.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {dominantTraits.slice(0, 3).map((trait, i) => (
            <span key={i} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-full border border-violet-200">
              {trait}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Completed test card for aptitude
function normalizeAptiData(data) {
  if (!data) return null;
  if (data.scores) {
    const s = data.scores;
    const max = s.max_score ?? 5;
    const norm = (n) => ((n ?? 0) > max ? Math.round(((n ?? 0) / 100) * max) : (n ?? 0));
    return { q: norm(s.quantitative), l: norm(s.logical), v: norm(s.verbal), max };
  }
  if (data.quantitative_aptitude || data.logical_reasoning || data.verbal_ability) {
    const max = Math.max(
      data.quantitative_aptitude?.total ?? 15,
      data.logical_reasoning?.total ?? 15,
      data.verbal_ability?.total ?? 15
    );
    return {
      q: data.quantitative_aptitude?.score ?? 0,
      l: data.logical_reasoning?.score ?? 0,
      v: data.verbal_ability?.score ?? 0,
      max,
    };
  }
  // Fallback for when raw UUIDs are saved without scores yet
  return null; 
}

function AptitudeCompletedCard({ aptiData }) {
  const scores = normalizeAptiData(aptiData);
  return (
    <div className="flex-1 bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-100">
          <Zap size={20} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-sm text-slate-800">Aptitude Test</p>
          <p className="text-xs text-emerald-600 font-bold"> Completed</p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
      {scores && (
        <div className="mt-4">
          <ScoreBar label="Quantitative" value={scores.q} max={scores.max} color="bg-blue-400" />
          <ScoreBar label="Logical" value={scores.l} max={scores.max} color="bg-violet-400" />
          <ScoreBar label="Verbal" value={scores.v} max={scores.max} color="bg-emerald-400" />
        </div>
      )}
    </div>
  );
}

// Generic Completed Card for EQ, Orientation, and Interest
function GenericCompletedCard({ title, icon: Icon, bgClass, textClass }) {
  return (
    <div className="flex-1 bg-white rounded-3xl border border-emerald-200 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bgClass}`}>
          <Icon size={20} className={textClass} />
        </div>
        <div className="flex-1">
          <p className="font-extrabold text-sm text-slate-800">{title}</p>
          <p className="text-xs text-emerald-600 font-bold"> Completed</p>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
    </div>
  );
}

// ============================================================================
// SESSIONS & CHAT PANELS
// ============================================================================

function formatCountdown(secs) {
  if (secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

function SessionBadge({ session, onJoinVideo, joiningVideoId }) {
  const [secondsLeft, setSecondsLeft] = useState(
    Math.max(0, session.seconds_until_start ?? 0)
  );
  const isLive = session.is_live || secondsLeft <= 0;
  const isJoining = joiningVideoId === session.session_id;

  useEffect(() => {
    if (isLive || !session.seconds_until_start) return;
    const id = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isLive, session.seconds_until_start]);

  const scheduledTime = toISTTime(session.scheduled_at);
  const scheduledDate = toISTDate(session.scheduled_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex flex-col gap-3 px-4 py-3.5 rounded-2xl border transition-all ${
        isLive ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'
      }`}
    >
      {isLive && (
        <span className="absolute top-2.5 right-3 flex items-center gap-1">
          <Radio size={10} className="text-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
        </span>
      )}

      {/* Top row: avatar + info */}
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 ${
          isLive ? 'bg-emerald-500' : 'bg-slate-700'
        }`}>
          {session.other_party_name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm truncate leading-tight">{session.other_party_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{scheduledDate} · {scheduledTime}</p>
          {!isLive && secondsLeft > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-xs font-bold text-amber-600">Starts in <span className="notranslate">{formatCountdown(secondsLeft)}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex gap-2">
        <motion.button
          whileTap={{ scale: 0.93 }}
          onClick={() => onJoinVideo(session)}
          disabled={isJoining}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isJoining
            ? <><Loader2 size={13} className="animate-spin" /> Joining...</>
            : <><PhoneCall size={13} /> Join Video</>
          }
        </motion.button>
      </div>
    </motion.div>
  );
}

function SessionsPanel({ onClose, onJoinVideo, joiningVideoId }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/api/v1/sessions/upcoming')
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load sessions.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-slate-50 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <CalendarClock size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-sm">Upcoming Sessions</h2>
              <p className="text-xs text-slate-400">Join your scheduled video calls</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <span className="text-sm text-slate-400">Loading sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <CalendarClock size={32} className="text-slate-300" />
              <p className="text-sm text-slate-400 font-medium">No upcoming sessions scheduled.</p>
            </div>
          ) : (
            sessions.map(session => (
              <SessionBadge
                key={session.session_id}
                session={session}
                onJoinVideo={onJoinVideo}
                joiningVideoId={joiningVideoId}
              />
            ))
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 bg-white shrink-0">
          <p className="text-[10px] text-slate-400 text-center font-medium">
            Video calls open a live Dyte session with your mentor
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DirectChatPanel({ onClose, onOpenChat }) {
  const [connections, setConnections]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [confirmDelete, setConfirmDelete]     = useState(null); 
  const [deleting, setDeleting]               = useState(false);

  useEffect(() => {
    chatApi.getConnections()
      .then(data => setConnections(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load connections.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteConnection = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await chatApi.deleteConnection(confirmDelete.user_id);
      setConnections(prev => prev.filter(c => c.user_id !== confirmDelete.user_id));
      toast.success(`Disconnected from ${confirmDelete.full_name}.`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete connection.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        className="absolute right-0 top-0 h-full w-full max-w-sm bg-slate-50 shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <MessageSquare size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-sm">Direct Messages</h2>
              <p className="text-xs text-slate-400">Messages vanish after 24 hours</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-400" />
              <span className="text-sm text-slate-400">Loading connections...</span>
            </div>
          ) : connections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
              <Users size={32} className="text-slate-300" />
              <p className="text-sm text-slate-400 font-medium">
                No accepted connections yet. Connect with a mentor first.
              </p>
            </div>
          ) : (
            connections.map(contact => (
              <div
                key={contact.user_id}
                className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    onOpenChat({ other_user_id: contact.user_id, other_party_name: contact.full_name });
                    onClose();
                  }}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                    {contact.full_name?.[0]?.toUpperCase() || 'M'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{contact.full_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 capitalize">{contact.role}</p>
                  </div>
                  <MessageSquare size={16} className="text-blue-400 shrink-0" />
                </motion.button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(contact); }}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  title="Remove connection"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={22} className="text-red-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-center text-base mb-1">Remove Connection?</h3>
              <p className="text-xs text-slate-500 text-center mb-5">
                This will permanently sever your connection with <span className="font-bold text-slate-700">{confirmDelete.full_name}</span>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConnection}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Removing...' : 'Remove'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

export default function Dashboard() {
  const navigate = useNavigate();
  const name = getUserDisplayName();

  const { progress, loading, refetch, userId } = useUserProgress();

  const [inviteCode, setInviteCode] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [loadingMentors, setLoadingMentors] = useState(false);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showDirectChat, setShowDirectChat] = useState(false);
  const [activeChat, setActiveChat] = useState(null); 
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [activeVideoCall, setActiveVideoCall] = useState(null); 
  const [joiningVideoId, setJoiningVideoId] = useState(null);
  
  const [activeTest, setActiveTest] = useState(null); 

  useEffect(() => {
  roadmapApi.getActiveRoadmap()
    .then(data => setActiveRoadmap(data))
    .catch(err => console.log("No active roadmap found yet."));
}, []);
  useEffect(() => {
    async function fetchSavedCareer() {
      try {
        const response = await getSelectedCareer();
        if (response?.career_title) {
          setSelectedCareer({ title: response.career_title });
        }
      } catch (err) {
        console.error('Dashboard: Failed to fetch saved career', err);
      }
    }
    fetchSavedCareer();
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'student') return;
    const getInviteCode = async () => {
      try {
        const response = await parentStudentApi.getStudentInviteCode();
        setInviteCode(response.invite_code);
      } catch (error) {
        console.error('Error fetching invite code:', error);
      }
    };
    getInviteCode();
  }, []);

  useEffect(() => {
    if (selectedCareer) {
      const fetchMentors = async () => {
        setLoadingMentors(true);
        try {
          const mentors = await mentorshipApi.getRecommendedMentors(selectedCareer.title);
          setRecommendedMentors(mentors);
        } catch (error) {
          console.error('Mentor fetch failed', error);
        } finally {
          setLoadingMentors(false);
        }
      };
      fetchMentors();
    }
  }, [selectedCareer]);

  const handleLogout = () => {
    clearUserSession();
    navigate('/');
  };

  const startJourney = async () => {
    try {
      await roadmapApi.startRoadmap();
      toast.success('Your career journey has started!');
    } catch (error) {
      console.error('Error starting roadmap:', error);
      toast.error('Failed to start roadmap.');
    }
  };

  const handleJoinVideo = async (session) => {
    setJoiningVideoId(session.session_id);
    try {
      const data = await mentorshipApi.joinVideo(session.session_id);
      setShowSessionsPanel(false);
      setActiveVideoCall({ token: data.token, meeting_id: data.meeting_id });
    } catch (err) {
      console.error('Failed to join video call:', err);
      toast.error('Could not join video call. Please try again.');
    } finally {
      setJoiningVideoId(null);
    }
  };

  const currentPhase = !progress.profileDone ? 1
    : !progress.assessmentsDone ? 2
    : !selectedCareer ? 3
    : 4;

  // 👉 FIXED: Math bug that caused the banner to disappear
  const isJourneyComplete = progress.profileDone && progress.assessmentsDone && !!selectedCareer;
  const overallPct = isJourneyComplete ? 100 : [progress.profileDone, progress.assessmentsDone, !!selectedCareer].filter(Boolean).length * 33.33;

  const springTransition = { type: 'spring', stiffness: 400, damping: 25 };

  const fireConfetti = () => {
    confetti({ particleCount: 75, angle: 60, spread: 70, origin: { x: 0, y: 0.8 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff'] });
    confetti({ particleCount: 75, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors: ['#3b82f6', '#10b981', '#f59e0b', '#ffffff'] });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-500" />
          <p className="text-slate-500 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 overflow-x-hidden">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6 cursor-pointer group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center shadow-md mr-3 group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all">
              <TrendingUp className="text-white w-4 h-4" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony</span>
          </div>
          <nav className="px-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={User} label="My Profile" onClick={() => navigate('/profile-creation')} />
            <NavItem icon={Brain} label="Personality" onClick={() => navigate('/personality-test')} />
            <NavItem icon={Zap} label="Aptitude Test" onClick={() => navigate('/aptitude-test')} />
            <NavItem icon={Sparkles} label="My Discovery Report" onClick={() => navigate('/discovery-report')} />
            <NavItem icon={Map} label="My Roadmap" onClick={() => navigate('/roadmap')} />
            <NavItem icon={Video} label="Mentorship" onClick={() => navigate('/mentorship')} />
            <NavItem icon={MessageSquare} label="Messages" onClick={() => setShowDirectChat(true)} />
            <NavItem icon={CalendarClock} label="Sessions" onClick={() => setShowSessionsPanel(true)} />
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-3 mb-2 group cursor-pointer">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover:text-blue-500 transition-colors">Journey Progress</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${overallPct}%` }} className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1"><span className="notranslate">{Math.round(overallPct)}</span>% complete</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 hover:translate-x-1 rounded-xl transition-all duration-300 font-semibold group"
          >
            <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">

        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex flex-wrap gap-2">
              Welcome back, <span className="notranslate text-blue-600">{name}</span>!
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-slate-500 font-medium mt-1">
              {currentPhase === 1 && "Let's start by building your profile — it only takes 5 minutes."}
              {currentPhase === 2 && "Your profile is set. Time to complete your assessments."}
              {currentPhase === 3 && "Assessments done! Let's discover your perfect career matches."}
              {currentPhase === 4 && "Your roadmap is ready. Start your journey today!"}
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="shadow-sm rounded-full bg-white">
              <LanguageSelector />
            </div>
            {/* Mobile logout button */}
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm"
            >
              <LogOut size={16} /> Out
            </button>
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:scale-105 shadow-sm">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm notranslate">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Journey Progress Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-800">Your AI Career Journey</h2>
            <span className="text-sm font-bold text-blue-600">{Math.round(overallPct)}% complete</span>
          </div>
          <div className="flex items-center">
            <PhaseStep number="1" label="Build Profile" status={progress.profileDone ? 'done' : currentPhase === 1 ? 'active' : 'locked'} color="bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.profileDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="2" label="Assessments" status={progress.assessmentsDone ? 'done' : currentPhase === 2 ? 'active' : 'locked'} color="bg-gradient-to-r from-violet-500 to-purple-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.assessmentsDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="3" label="Career Path" status={selectedCareer ? 'done' : currentPhase === 3 ? 'active' : 'locked'} color="bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${selectedCareer ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="4" label="My Roadmap" status={currentPhase === 4 ? 'active' : currentPhase > 4 ? 'done' : 'locked'} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </motion.div>
        
        {/* 👉 FIXED LAYOUT: Grid wrapped into two specific columns so they don't stretch each other */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ─── LEFT COLUMN (Takes up 2/3 width on Desktop) ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Phase 1 Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }} transition={springTransition}
              className={`group rounded-3xl p-8 relative overflow-hidden ${progress.profileDone ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-blue-600 to-sky-400'} text-white shadow-lg`}
            >
              <ShinyOverlay />
              <div className="relative z-10 flex flex-col justify-between">
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                    {progress.profileDone ? ' Phase 1 — Complete' : '📋 Phase 1 — Build Your Profile'}
                  </span>
                  <h2 className="text-2xl font-extrabold mb-2">{progress.profileDone ? 'Profile Complete' : 'Start by building your profile'}</h2>
                  <p className="text-white/80 font-medium max-w-md">{progress.profileDone ? 'Your background and interests have been captured.' : 'Answer questions about your background and aspirations. Takes ~5 minutes.'}</p>
                </div>
                {!progress.profileDone && (
                  <button onClick={() => navigate('/profile-creation')} className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-white text-blue-600 font-extrabold rounded-2xl shadow-sm w-fit">
                    Build My Profile <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </motion.div>

            {/* Career Matches / Discovery Report Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -4 }} transition={springTransition}
              className={`group rounded-3xl p-8 relative overflow-hidden shadow-sm cursor-pointer ${
                selectedCareer
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white'
                  : progress.assessmentsDone
                  ? 'bg-gradient-to-br from-amber-500 to-orange-400 text-white'
                  : 'bg-white border border-slate-100 text-slate-900'
              }`}
              onClick={() => progress.assessmentsDone && navigate('/discovery-report')}
            >
              {progress.assessmentsDone && <ShinyOverlay />}
              <div className="relative z-10">
                <span className="px-3 py-1 bg-slate-900/10 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-slate-900/10">
                  {selectedCareer ? ' Career Selected' : '✨ Phase 3'}
                </span>
                <h3 className="text-2xl font-extrabold mb-2">
                  {selectedCareer ? selectedCareer.title : 'My Discovery Report'}
                </h3>
                <p className="text-sm mb-6 opacity-80">
                  {selectedCareer ? 'Your chosen path is active.' : progress.assessmentsDone ? 'Your 30-page AI career analysis is ready.' : 'Complete all 5 assessments to unlock.'}
                </p>
                {!selectedCareer && progress.assessmentsDone && (
                  <button className="px-6 py-3.5 bg-white text-amber-600 font-extrabold rounded-2xl shadow-sm">
                    View Full Report
                  </button>
                )}
              </div>
            </motion.div>

            {/* Roadmap Card */}
            {/* Roadmap Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, y: -4 }} transition={springTransition}
            className={`group rounded-3xl p-8 relative overflow-hidden ${selectedCareer ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl' : 'bg-white border border-slate-100'}`}
          >
            {selectedCareer && <ShinyOverlay />}
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/10">
                  {activeRoadmap ? ` ACTIVE: PHASE ${activeRoadmap.phase_number}` : '🗺️ MY ROADMAP'}
                </span>
                <h3 className="text-2xl font-extrabold mb-2">Your Career Roadmap</h3>
                
                {activeRoadmap ? (
                   <p className="text-slate-400 mb-6 font-medium">
                     You are currently executing Phase {activeRoadmap.phase_number} of your journey. Keep up the momentum!
                   </p>
                ) : selectedCareer ? (
                  <p className="text-slate-400 mb-6">Your 6-month phase roadmap is ready. Start your journey today!</p>
                ) : (
                  <p className="text-slate-500">Select a career to generate your first 6-month roadmap.</p>
                )}
              </div>

              {selectedCareer && (
                <button 
                  onClick={() => activeRoadmap ? navigate('/roadmap') : startJourney()} 
                  className="flex items-center gap-2 px-6 py-3.5 bg-white text-slate-900 font-extrabold rounded-2xl w-fit hover:scale-105 transition-transform"
                >
                  {activeRoadmap ? "Continue My Journey" : "Start Phase 1"} <ArrowRight size={20} />
                </button>
              )}
            </div>
          </motion.div>

          </div>

          {/* ─── RIGHT COLUMN (Takes up 1/3 width on Desktop) ─── */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* 5D Assessment Cards Stack */}
            <div className="space-y-4 flex flex-col bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="mb-2">
                <h3 className="font-extrabold text-slate-800 text-lg mb-1">5D Psychometric Tests</h3>
                <p className="text-xs text-slate-500 mb-2">Complete all 5 to unlock your report.</p>
              </div>

              {/* 1. Personality */}
              {progress.personalityDone ? <PersonalityCompletedCard personalityData={progress.personalityData} /> : 
                <div onClick={() => progress.profileDone && navigate('/personality-test')} className={`flex-1 bg-slate-50 rounded-[1.5rem] border p-4 transition-all group ${progress.profileDone ? 'hover:border-violet-300 hover:bg-white cursor-pointer' : 'opacity-60 cursor-not-allowed'} border-slate-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100"><Brain size={18} className="text-violet-600" /></div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-800">Personality Test</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              }

              {/* 2. Aptitude */}
              {progress.aptitudeDone ? <AptitudeCompletedCard aptiData={progress.aptiData} /> : 
                <div onClick={() => progress.profileDone && navigate('/aptitude-test')} className={`flex-1 bg-slate-50 rounded-[1.5rem] border p-4 transition-all group ${progress.profileDone ? 'hover:border-blue-300 hover:bg-white cursor-pointer' : 'opacity-60 cursor-not-allowed'} border-slate-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100"><Zap size={18} className="text-blue-600" /></div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-800">Aptitude Test</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              }

              {/* 3. Emotional Quotient */}
              {progress.eqDone ? <GenericCompletedCard title="Emotional Quotient" icon={Heart} bgClass="bg-rose-100" textClass="text-rose-600" /> : 
                <div onClick={() => progress.profileDone && setActiveTest('eq')} className={`flex-1 bg-slate-50 rounded-[1.5rem] border p-4 transition-all group ${progress.profileDone ? 'hover:border-rose-300 hover:bg-white cursor-pointer' : 'opacity-60 cursor-not-allowed'} border-slate-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-100"><Heart size={18} className="text-rose-600" /></div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-800">Emotional Quotient</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              }

              {/* 4. Orientation Style */}
              {progress.orientationDone ? <GenericCompletedCard title="Orientation Style" icon={Target} bgClass="bg-indigo-100" textClass="text-indigo-600" /> : 
                <div onClick={() => progress.profileDone && setActiveTest('orientation')} className={`flex-1 bg-slate-50 rounded-[1.5rem] border p-4 transition-all group ${progress.profileDone ? 'hover:border-indigo-300 hover:bg-white cursor-pointer' : 'opacity-60 cursor-not-allowed'} border-slate-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-100"><Target size={18} className="text-indigo-600" /></div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-800">Orientation Style</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              }

              {/* 5. Career Interests */}
              {progress.interestDone ? <GenericCompletedCard title="Career Interests" icon={Briefcase} bgClass="bg-amber-100" textClass="text-amber-600" /> : 
                <div onClick={() => progress.profileDone && setActiveTest('interest')} className={`flex-1 bg-slate-50 rounded-[1.5rem] border p-4 transition-all group ${progress.profileDone ? 'hover:border-amber-300 hover:bg-white cursor-pointer' : 'opacity-60 cursor-not-allowed'} border-slate-100`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-100"><Briefcase size={18} className="text-amber-600" /></div>
                    <div className="flex-1">
                      <p className="font-extrabold text-sm text-slate-800">Career Interests</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </div>
                </div>
              }
            </div>

            {/* Parent Invite */}
            <div className="rounded-3xl p-6 bg-white border border-slate-100 shadow-sm">
              <h3 className="font-extrabold text-slate-800 mb-4">Share with Parents</h3>
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border">
               <p className="font-bold text-slate-800 tracking-widest notranslate">{inviteCode || 'Loading...'}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(inviteCode); toast.success('Copied!'); }}
                  className="text-blue-500 font-bold text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Mentor Section */}
        {selectedCareer && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mt-6">
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 mb-6">
              <Users className="text-blue-500" size={24} /> Recommended Mentors
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loadingMentors ? (
                <Loader2 className="animate-spin" />
              ) : (
                recommendedMentors.map(mentor => (
                  <div key={mentor.id} className="bg-slate-50 p-5 rounded-2xl border hover:border-blue-200 transition-all">
                    <h4 className="font-bold">{mentor.full_name}</h4>
                    <p className="text-xs text-blue-500 font-bold">{mentor.expertise}</p>
                    <button
                      onClick={() => navigate(`/mentorship/${mentor.id}`)}
                      className="mt-4 w-full py-2 bg-white rounded-xl text-sm font-bold border hover:bg-blue-50"
                    >
                      View Profile
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 👉 FIXED: Global Journey Completion Banner */}
        {isJourneyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            onMouseEnter={fireConfetti}
            className="mt-8 bg-gradient-to-r from-blue-600 to-sky-400 rounded-3xl p-8 text-white text-center shadow-lg cursor-pointer"
          >
            <h2 className="text-2xl font-extrabold mb-2">You've completed the full journey!</h2>
            <p className="text-blue-100 font-medium">Your roadmap is live. Make your dream a reality.</p>
          </motion.div>
        )}
      </main>

      {/* Sessions Drawer */}
      <AnimatePresence>
        {showSessionsPanel && (
          <SessionsPanel
            onClose={() => setShowSessionsPanel(false)}
            onJoinVideo={handleJoinVideo}
            joiningVideoId={joiningVideoId}
          />
        )}
      </AnimatePresence>

      {/* Direct Messages (24h ephemeral) Drawer */}
      <AnimatePresence>
        {showDirectChat && (
          <DirectChatPanel
            onClose={() => setShowDirectChat(false)}
            onOpenChat={(contact) => setActiveChat(contact)}
          />
        )}
      </AnimatePresence>

      {/* Anytime Chat Modal */}
      <AnimatePresence>
        {activeChat && (
          <SessionChat
            otherUserId={activeChat.other_user_id}
            otherPartyName={activeChat.other_party_name}
            onClose={() => setActiveChat(null)}
          />
        )}
      </AnimatePresence>

      {/* Dyte Video Call Modal */}
      <AnimatePresence>
        {activeVideoCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-white">
                <PhoneCall size={16} className="text-blue-400" />
                <span className="font-bold text-sm">Video Call</span>
                {activeVideoCall.meeting_id && (
                  <span className="text-xs text-slate-400 ml-2">ID: {activeVideoCall.meeting_id}</span>
                )}
              </div>
              <button
                onClick={() => setActiveVideoCall(null)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors"
              >
                <X size={14} /> End Call
              </button>
            </div>
            <div className="flex-1">
              <VideoCallRoom authToken={activeVideoCall.token} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Psychometric Test Modal Renderer */}
      <AnimatePresence>
        {activeTest && (
          <PsychometricTestModal
            moduleName={activeTest}
            moduleTitle={
              activeTest === 'eq' ? 'Emotional Quotient' : 
              activeTest === 'orientation' ? 'Orientation Style' : 'Career Interests'
            }
            isAlreadyCompleted={
              activeTest === 'eq' ? progress.eqDone :
              activeTest === 'orientation' ? progress.orientationDone : progress.interestDone
            }
            userId={userId}
            onClose={() => setActiveTest(null)}
            onComplete={() => {
              setActiveTest(null);
              refetch(); // Automatically refreshes the dashboard to show the completed checkmark!
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}