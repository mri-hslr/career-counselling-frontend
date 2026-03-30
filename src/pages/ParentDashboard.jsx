import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Settings, LogOut, Bell,
  ShieldCheck, ArrowUpRight, Sparkles, ChevronRight, Target,
  Link2, CheckCircle2, Loader2, AlertCircle, Map, Clock,
  User, MessageSquare, RefreshCw, Zap, Flag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';
import {
  linkParentToStudent,
  getStudentRoadmap, submitParentFeedback,
} from '../services/api/mentorshipApi';

const IMPORTANCE_META = {
  CRITICAL:       { label: 'Critical',        bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    gradient: 'from-rose-500 to-pink-400' },
  STRATEGIC:      { label: 'Strategic',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   gradient: 'from-amber-500 to-orange-400' },
  SPECIALIZATION: { label: 'Specialization',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  gradient: 'from-violet-500 to-purple-400' },
};

const TABS = [
  { id: 'overview',   label: 'Overview',        icon: LineChart },
  { id: 'link',       label: 'Link My Child',   icon: Link2 },
  { id: 'roadmap',    label: "Child's Roadmap", icon: Map },
  { id: 'feedback',   label: 'Submit Feedback', icon: MessageSquare },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon size={20} className="mr-3 shrink-0" /> {label}
    </button>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl font-semibold text-sm ${
        type === 'success' ? 'bg-purple-600 text-white' : 'bg-red-500 text-white'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      {message}
    </motion.div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────
function OverviewTab({ linkedStudentId, navigate }) {
  const isLinked = !!linkedStudentId;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-purple-500/20"
        >
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-5 inline-block border border-white/30">
              {isLinked ? '✅ Child Account Linked' : '🔗 Link Your Child\'s Account'}
            </span>
            <h2 className="text-2xl font-extrabold mb-2">
              {isLinked ? 'Track your child\'s AI career journey' : 'Connect to your child\'s account'}
            </h2>
            <p className="text-purple-100 font-medium max-w-lg mb-6">
              {isLinked
                ? 'You have full visibility into your child\'s career roadmap, assessments, and AI recommendations. Provide feedback to personalise their journey further.'
                : 'Link to your child\'s Harmony account using their unique invite code. Once linked, you\'ll see their complete career path and can provide feedback.'}
            </p>
            <div className="flex gap-3 flex-wrap">
              {isLinked ? (
                <>
                  <button onClick={() => navigate('/roadmap')} className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 font-extrabold rounded-xl shadow-sm hover:scale-105 transition-all text-sm">
                    <Map size={16} /> View Full Roadmap
                  </button>
                  <button onClick={() => navigate('/career-recommendations')} className="flex items-center gap-2 px-5 py-3 bg-purple-500/50 text-white font-extrabold rounded-xl border border-purple-400 hover:bg-purple-500/70 transition-all text-sm">
                    <Sparkles size={16} /> Career Matches
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate && window.dispatchEvent(new CustomEvent('switchTab', { detail: 'link' }))}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 font-extrabold rounded-xl shadow-sm hover:scale-105 transition-all text-sm"
                >
                  <Link2 size={16} /> Link Now
                </button>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
        >
          <div className={`flex items-center gap-4 p-4 rounded-2xl border ${isLinked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-11 h-11 text-white rounded-full flex items-center justify-center shadow-md ${isLinked ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isLinked ? 'text-emerald-600' : 'text-slate-400'}`}>Link Status</p>
              <p className="text-xl font-extrabold text-slate-800">{isLinked ? 'Linked' : 'Not linked'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-2xl border border-purple-100">
            <div className="w-11 h-11 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-md shadow-purple-500/20">
              <ArrowUpRight size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Platform</p>
              <p className="text-xl font-extrabold text-slate-800">Active</p>
            </div>
          </div>
        </motion.div>
      </div>

      {isLinked && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { icon: Map, label: "Child's Roadmap",    desc: 'View personalised career phases', color: 'from-blue-500 to-sky-400',   path: null, tab: 'roadmap' },
            { icon: MessageSquare, label: 'Submit Feedback',   desc: 'Share study habits & observations', color: 'from-purple-500 to-fuchsia-400', path: null, tab: 'feedback' },
            { icon: Sparkles, label: 'Career Matches', desc: 'See AI recommended career paths', color: 'from-amber-500 to-orange-400', path: '/career-recommendations', tab: null },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => item.path ? navigate(item.path) : window.dispatchEvent(new CustomEvent('switchTab', { detail: item.tab }))}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-left hover:border-purple-200 hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-sm`}>
                  <Icon size={22} className="text-white" />
                </div>
                <p className="font-extrabold text-slate-800 mb-1">{item.label}</p>
                <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold text-purple-600">
                  Open <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── LINK TAB ──────────────────────────────────────────────────────────────────
function LinkTab({ linkedStudentId, onLinked, toast }) {
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleLink(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await linkParentToStudent(inviteCode.trim().toUpperCase());
      localStorage.setItem('harmony_linked_student_id', res.student_id);
      onLinked(res.student_id);
      toast('Successfully linked to your child\'s account!', 'success');
    } catch (err) {
      toast(err.message || 'Invalid invite code. Ask your child to share their code.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (linkedStudentId) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-8 max-w-lg"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Account Linked!</h3>
            <p className="text-sm text-slate-500 font-medium">You are connected to your child's Harmony account.</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student ID</p>
          <p className="text-sm font-mono text-slate-700 break-all">{linkedStudentId}</p>
        </div>
        <p className="text-sm text-slate-500 font-medium mt-4">
          You can now view your child's career roadmap and submit observations to help personalise their AI journey.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Instructions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-7 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <h3 className="text-xl font-extrabold mb-3">How to link your child's account</h3>
          <div className="space-y-3">
            {[
              { n: '1', t: 'Your child logs in to Harmony on their device' },
              { n: '2', t: 'They go to Dashboard → Profile → "Share Invite Code"' },
              { n: '3', t: 'They share the 6-character code with you' },
              { n: '4', t: 'Enter it below — you\'re instantly linked!' },
            ].map(s => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 border border-white/30">{s.n}</div>
                <p className="text-purple-100 font-medium text-sm">{s.t}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Link Form */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8"
      >
        <form onSubmit={handleLink} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Child's Invite Code</label>
            <input
              type="text"
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="e.g. 3RUA8U"
              maxLength={10}
              required
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono text-2xl tracking-widest text-center text-slate-900 uppercase shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || inviteCode.length < 4}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Linking...</> : <><Link2 size={20} /> Link Account</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── ROADMAP TAB ───────────────────────────────────────────────────────────────
function RoadmapTab({ linkedStudentId }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPhase, setExpandedPhase] = useState(0);

  useEffect(() => {
    if (linkedStudentId) fetchRoadmap();
  }, [linkedStudentId]);

  async function fetchRoadmap() {
    setLoading(true);
    setError('');
    try {
      const data = await getStudentRoadmap(linkedStudentId);
      setRoadmap(data);
    } catch (e) {
      setError(e.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }

  if (!linkedStudentId) {
    return (
      <div className="text-center py-16 text-slate-400 max-w-md mx-auto">
        <Link2 size={48} className="mx-auto mb-4 opacity-30" />
        <p className="font-extrabold text-slate-600 text-lg mb-2">No child account linked</p>
        <p className="font-medium text-sm">Link your child's account first to view their career roadmap.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
        <Loader2 size={24} className="animate-spin text-purple-500" />
        <span className="font-semibold text-lg">Generating child's roadmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
          <p className="font-extrabold text-slate-800 mb-2">Roadmap unavailable</p>
          <p className="text-sm text-slate-500 font-medium mb-5">{error}</p>
          <button onClick={fetchRoadmap} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all mx-auto">
            <RefreshCw size={16} /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) return null;

  const PHASE_GRADIENTS = ['from-blue-600 to-sky-400','from-violet-600 to-purple-400','from-emerald-600 to-teal-400','from-amber-600 to-orange-400','from-rose-600 to-pink-400'];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
            Your Child's Career Path
          </span>
          <h2 className="text-3xl font-extrabold mb-3">{roadmap.career_title}</h2>
          <div className="flex flex-wrap gap-3">
            {[
              [Clock, roadmap.total_duration],
              [Zap, roadmap.daily_commitment],
              [Target, roadmap.difficulty_level],
              [User, roadmap.student_level],
            ].map(([Icon, val], i) => val ? (
              <div key={i} className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30 text-sm font-bold">
                <Icon size={14} /> {val}
              </div>
            ) : null)}
          </div>
        </div>
      </motion.div>

      {/* Adjustments */}
      {roadmap.parent_adjustments && (
        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 flex items-start gap-3">
          <MessageSquare size={18} className="text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Your Feedback is Active</p>
            <p className="text-sm font-semibold text-purple-800">{roadmap.parent_adjustments}</p>
          </div>
        </div>
      )}

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.phases?.map((phase, i) => {
          const meta = IMPORTANCE_META[phase.importance] || IMPORTANCE_META.STRATEGIC;
          const gradient = PHASE_GRADIENTS[i % PHASE_GRADIENTS.length];
          const isOpen = expandedPhase === i;
          return (
            <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpandedPhase(isOpen ? -1 : i)} className="w-full text-left">
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-sm border border-white/30">{i + 1}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{meta.label}</span>
                          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{phase.duration_weeks}w</span>
                        </div>
                        <h4 className="font-extrabold text-base">{phase.phase_title}</h4>
                      </div>
                    </div>
                    {isOpen ? <ChevronRight size={20} className="rotate-90 text-white/80" /> : <ChevronRight size={20} className="text-white/80" />}
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="p-5 space-y-4">
                      <p className="text-slate-600 font-medium text-sm">{phase.description}</p>
                      {phase.skills_targeted?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {phase.skills_targeted.map(s => (
                            <span key={s} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                      {phase.success_criteria && (
                        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                          <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-emerald-700"><span className="font-extrabold">Ready when:</span> {phase.success_criteria}</p>
                        </div>
                      )}
                      {phase.milestone_project && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                          <Flag size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-xs font-semibold text-amber-700"><span className="font-extrabold">Project:</span> {phase.milestone_project}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── FEEDBACK TAB ──────────────────────────────────────────────────────────────
function FeedbackTab({ linkedStudentId, toast }) {
  const [form, setForm] = useState({ study_habits: '', behavior_insights: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!linkedStudentId) { toast('Link your child\'s account first', 'error'); return; }
    setSubmitting(true);
    try {
      await submitParentFeedback({ student_id: linkedStudentId, ...form });
      setForm({ study_habits: '', behavior_insights: '' });
      toast('Feedback submitted! It will shape your child\'s roadmap.', 'success');
    } catch (err) {
      toast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm resize-none";

  return (
    <div className="max-w-xl space-y-6">
      {!linkedStudentId && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Link your child's account first before submitting feedback.</p>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-3xl p-6"
      >
        <div className="flex items-start gap-3 mb-0">
          <Sparkles size={20} className="text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Your feedback personalises the AI roadmap</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">The AI uses your observations to adjust your child's learning pace, focus areas, and recommendations.</p>
          </div>
        </div>
      </motion.div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Study Habits Observation</label>
            <textarea
              value={form.study_habits}
              onChange={e => setForm(f => ({ ...f, study_habits: e.target.value }))}
              placeholder="How many hours does your child study daily? Are they consistent? Do they take breaks? Use any study aids?"
              rows={4}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Behavioural Insights</label>
            <textarea
              value={form.behavior_insights}
              onChange={e => setForm(f => ({ ...f, behavior_insights: e.target.value }))}
              placeholder="How is their motivation? Do they get stressed easily? Are they showing interest in their chosen career? Any concerns?"
              rows={4}
              required
              className={inputCls}
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !linkedStudentId}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? <><Loader2 size={20} className="animate-spin" /> Submitting...</> : <><MessageSquare size={20} /> Submit Feedback</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ParentDashboard() {
  const navigate = useNavigate();
  const name = getUserDisplayName();
  const [activeTab, setActiveTab] = useState('overview');
  const [linkedStudentId, setLinkedStudentId] = useState(
    () => localStorage.getItem('harmony_linked_student_id') || ''
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener('switchTab', handler);
    return () => window.removeEventListener('switchTab', handler);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  }

  function handleLinked(studentId) {
    setLinkedStudentId(studentId);
    setActiveTab('roadmap');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-400 rounded-lg flex items-center justify-center shadow-md mr-3">
              <span className="text-white text-sm">👨‍👩‍👧</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony</span>
          </div>
          <nav className="px-4 space-y-1">
            {TABS.map(tab => (
              <NavItem key={tab.id} icon={tab.icon} label={tab.label} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
            <NavItem icon={Settings} label="Settings" onClick={() => {}} />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-slate-700 truncate">{getCurrentUser()?.email || 'Parent'}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold">
            <LogOut size={20} className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hello, {name}! 👋</h1>
            <p className="text-slate-500 font-medium mt-1">{TABS.find(t => t.id === activeTab)?.label}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-fuchsia-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'overview'  && <OverviewTab linkedStudentId={linkedStudentId} navigate={navigate} />}
            {activeTab === 'link'      && <LinkTab linkedStudentId={linkedStudentId} onLinked={handleLinked} toast={(m, t) => setToast({ message: m, type: t })} />}
            {activeTab === 'roadmap'   && <RoadmapTab linkedStudentId={linkedStudentId} />}
            {activeTab === 'feedback'  && <FeedbackTab linkedStudentId={linkedStudentId} toast={(m, t) => setToast({ message: m, type: t })} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
