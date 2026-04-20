import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Settings, LogOut, Bell,
  ShieldCheck, ArrowUpRight, Sparkles, ChevronRight, Target,
  Link2, CheckCircle2, Loader2, AlertCircle, Map, Clock,
  User, MessageSquare, RefreshCw, Zap, Flag,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserDisplayName, clearUserSession } from '../utils/jwt';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { parentStudentApi } from '../services/api/parentStudentApi';
import { roadmapApi } from '../services/api/roadmapApi';
// 👉 Premium animations imported correctly
import { SplitText, BlurText, ShinyOverlay } from "../components/ui/Animations";
import LanguageSelector from '../components/LanguageSelector';


const TABS = [
  { id: 'overview',   label: 'Overview',        icon: LineChart },
  { id: 'link',       label: 'Link My Child',   icon: Link2 },
  { id: 'roadmap',    label: "Child's Roadmap", icon: Map },
  { id: 'feedback',   label: 'Submit Feedback', icon: MessageSquare },
];

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`group flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:translate-x-1 duration-300'}`}>
      <Icon size={20} className={`mr-3 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} /> {label}
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
function OverviewTab({ linkedStudent, navigate }) {
  const isLinked = !!linkedStudent;
  const springTransition = { type: "spring", stiffness: 400, damping: 30 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Main Purple Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01, y: -4 }}
          transition={springTransition}
          className="group md:col-span-2 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
        >
          <ShinyOverlay />
          <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-5 inline-block border border-white/30">
              {isLinked ? '✅ Child Account Linked' : '🔗 Link Your Child\'s Account'}
            </span>
            
            <BlurText 
              text={isLinked ? 'Track your child\'s AI career journey' : 'Connect to your child\'s account'} 
              className="text-2xl font-extrabold mb-2 block" 
            />
            <BlurText 
              text={isLinked 
                ? 'You have full visibility into your child\'s career roadmap, assessments, and AI recommendations. Provide feedback to personalise their journey further.' 
                : 'Link to your child\'s Harmony account using their unique invite code. Once linked, you\'ll see their complete career path and can provide feedback.'} 
              delay={0.2} 
              className="text-purple-100 font-medium max-w-lg mb-6 block" 
            />

            <div className="flex gap-3 flex-wrap">
              {isLinked ? (
                <>
                  <button onClick={() => navigate && window.dispatchEvent(new CustomEvent('switchTab', { detail: 'roadmap' }))} className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 font-extrabold rounded-xl shadow-sm hover:scale-105 transition-all text-sm">
                    <Map size={16} /> View Full Roadmap
                  </button>
                  {/* Removed the direct link to career matches for parents as they should view the roadmap instead */}
                  <button onClick={() => navigate && window.dispatchEvent(new CustomEvent('switchTab', { detail: 'feedback' }))} className="flex items-center gap-2 px-5 py-3 bg-purple-500/50 text-white font-extrabold rounded-xl border border-purple-400 hover:bg-purple-500/70 transition-all text-sm">
                    <MessageSquare size={16} /> Submit Feedback
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

        {/* Small Status Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 flex flex-col justify-center"
        >
          <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${isLinked ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className={`w-11 h-11 text-white rounded-full flex items-center justify-center shadow-md transition-colors ${isLinked ? 'bg-emerald-500' : 'bg-slate-400'}`}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${isLinked ? 'text-emerald-600' : 'text-slate-400'}`}>Link Status</p>
              <p className={`text-xl font-extrabold ${isLinked ? 'text-slate-800' : 'text-slate-500'}`}>
  {isLinked ? <span className="notranslate">{linkedStudent.full_name}</span> : 'Not linked'}
</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { icon: Map, label: "Child's Roadmap",    desc: 'View personalised career phases', color: 'from-blue-500 to-sky-400',   tab: 'roadmap' },
            { icon: MessageSquare, label: 'Submit Feedback',   desc: 'Share study habits & observations', color: 'from-purple-500 to-fuchsia-400', tab: 'feedback' },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                whileHover={{ scale: 1.02, y: -8 }} 
                transition={{ delay: 0.1 + i * 0.05, ...springTransition }}
                onClick={() => item.path ? navigate(item.path) : window.dispatchEvent(new CustomEvent('switchTab', { detail: item.tab }))}
                className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm p-6 text-left hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <ShinyOverlay />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <p className="font-extrabold text-slate-800 mb-1">{item.label}</p>
                  <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-bold text-purple-600">
                    Open <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
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
function LinkTab({ linkedStudent, onLinked, toast }) {
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!inviteCode || inviteCode.length !== 6) {
      toast("Please enter a valid 6-character code.", "error");
      return;
    }

    setSubmitting(true);
    try {
      await parentStudentApi.linkParentToStudent(inviteCode);
      toast("Account successfully linked!", "success");
      
      // Fetch the newly linked student to update the UI instantly
      const response = await parentStudentApi.getLinkedStudent();
      if (response && response.is_linked) {
        onLinked(response.student);
      }
    } catch (error) {
      console.error("Linking error:", error);
      toast(error.message || "Failed to link account. Please check the code.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (linkedStudent) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-emerald-200 shadow-sm p-8 max-w-lg"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 size={28} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">Account Linked!</h3>
            <p className="text-sm text-slate-500 font-medium">You are connected to {linkedStudent.full_name}'s Harmony account.</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Contact</p>
          <p className="text-sm font-medium text-slate-700 notranslate">{linkedStudent.email}</p>
        </div>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'roadmap' }))}
          className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-600 transition-colors"
        >
          View Roadmap <ArrowUpRight size={18} />
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Instructions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="group bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-7 text-white relative overflow-hidden shadow-md"
      >
        <ShinyOverlay />
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
              maxLength={6}
              required
              className="w-full px-4 py-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none font-mono text-2xl tracking-widest text-center text-slate-900 uppercase shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || inviteCode.length !== 6}
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
function RoadmapTab({ linkedStudent }) {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedPhase, setExpandedPhase] = useState(0);

  useEffect(() => {
    if (linkedStudent) fetchRoadmap();
  }, [linkedStudent]);

async function fetchRoadmap() {
    setLoading(true);
    setError('');
    try {
      const data = await roadmapApi.getStudentRoadmap(linkedStudent.id);
      setRoadmap(data);
    } catch (e) {
      setError(e.message || 'Failed to load roadmap or child has not started one yet.');
    } finally {
      setLoading(false);
    }
  }

  if (!linkedStudent) {
    return (
      <div className="text-center py-16 text-slate-400 max-w-md mx-auto">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Link2 size={32} className="text-slate-300" />
        </div>
        <p className="font-extrabold text-slate-600 text-lg mb-2">No child account linked</p>
        <p className="font-medium text-sm">Link your child's account first to view their career roadmap.</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'link' }))}
          className="mt-6 px-6 py-2.5 bg-purple-100 text-purple-600 font-bold rounded-xl hover:bg-purple-200 transition-colors"
        >
          Go to Link Tab
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
        <Loader2 size={32} className="animate-spin text-purple-500" />
        <span className="font-semibold text-lg">Fetching {linkedStudent.full_name}'s roadmap...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md">
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center">
          <AlertCircle size={40} className="text-amber-400 mx-auto mb-4" />
          <p className="font-extrabold text-slate-800 mb-2">Roadmap not found</p>
          <p className="text-sm text-slate-500 font-medium mb-5">{error}</p>
          <button onClick={fetchRoadmap} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all mx-auto shadow-sm">
            <RefreshCw size={16} /> Retry Fetch
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="group bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-md"
      >
        <ShinyOverlay />
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="relative z-10">
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
            <span className="notranslate">{linkedStudent.full_name}</span>'s Career Path
          </span>
          <BlurText text={roadmap.title || ''} className="text-3xl font-extrabold mb-3 block" />
          <div className="flex flex-wrap gap-3">
             <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30 text-sm font-bold">
                <Target size={14} /> Status: {roadmap.status}
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/30 text-sm font-bold">
                <Zap size={14} /> Progress: <span className="notranslate">{Math.round(roadmap.progress_percentage)}</span>%
              </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        {roadmap.phases?.map((phase, i) => {
          const gradient = PHASE_GRADIENTS[i % PHASE_GRADIENTS.length];
          const isOpen = expandedPhase === i;
          return (
            <div key={phase.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <button onClick={() => setExpandedPhase(isOpen ? -1 : i)} className="w-full text-left">
                <div className={`bg-gradient-to-r ${gradient} p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-sm border border-white/30">{phase.sequence}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/30">{phase.status}</span>
                        </div>
                        <h4 className="font-extrabold text-base">{phase.title}</h4>
                      </div>
                    </div>
                    {isOpen ? <ChevronRight size={20} className="rotate-90 text-white/80 transition-transform" /> : <ChevronRight size={20} className="text-white/80 transition-transform" />}
                  </div>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-slate-50">
                    <div className="p-5 space-y-3">
                      {phase.tasks?.map((task) => (
                        <div key={task.id} className={`p-4 rounded-xl border flex items-start gap-3 ${task.status === 'Completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                           {task.status === 'Completed' ? (
                             <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                           ) : (
                             <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5" />
                           )}
                           <div>
                             <p className={`text-sm font-bold ${task.status === 'Completed' ? 'text-emerald-800' : 'text-slate-700'}`}>{task.title}</p>
                           </div>
                        </div>
                      ))}
                      {(!phase.tasks || phase.tasks.length === 0) && (
                        <p className="text-slate-500 text-sm italic">No tasks found for this phase.</p>
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
function FeedbackTab({ linkedStudent, toast }) {
  const [form, setForm] = useState({ study_habits: '', behavior_insights: '' });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!linkedStudent) { toast("Link your child's account first", "error"); return; }
    
    setSubmitting(true);
    try {
      await mentorshipApi.submitParentFeedback({ student_id: linkedStudent.id, ...form });
      setForm({ study_habits: '', behavior_insights: '' });
      toast("Feedback submitted! It will shape your child's roadmap.", "success");
    } catch (err) {
      toast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm resize-none";

  if (!linkedStudent) {
    return (
      <div className="max-w-xl flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
        <AlertCircle size={18} className="text-amber-500 shrink-0" />
        <p className="text-sm font-semibold text-amber-700">Link your child's account first before submitting feedback.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      {/* {!linkedStudent && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <AlertCircle size={18} className="text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-700">Link your child's account first before submitting feedback.</p>
        </div>
      )} */}

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-3xl p-6"
      >
        <div className="flex items-start gap-3">
          <Sparkles size={20} className="text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-extrabold text-slate-800 text-sm">Personalise {linkedStudent.full_name}'s AI roadmap</p>
            <p className="text-xs text-slate-500 font-medium mt-1">The AI uses your observations to adjust your child's learning pace, focus areas, and recommendations.</p>
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
            disabled={submitting}
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
  const [linkedStudent, setLinkedStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Check link status on mount
  useEffect(() => {
    const fetchLinkStatus = async () => {
      try {
        const response = await parentStudentApi.getLinkedStudent();
        if (response && response.is_linked) {
          setLinkedStudent(response.student);
        }
      } catch (error) {
        console.log("No linked student found.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLinkStatus();
  }, []);

  useEffect(() => {
    const handler = (e) => setActiveTab(e.detail);
    window.addEventListener('switchTab', handler);
    return () => window.removeEventListener('switchTab', handler);
  }, []);

  function handleLogout() {
    clearUserSession();
    navigate('/');
  }

  function handleLinked(studentData) {
    setLinkedStudent(studentData);
    setActiveTab('overview');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-purple-500" />
      </div>
    );
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
          <button onClick={handleLogout} className="group flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold">
            <LogOut size={20} className="mr-3 group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-6 md:p-8">
        
        {/* 👈 UPDATED HEADER */}
        {/* 👈 TRANSLATION-SAFE HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight flex flex-wrap gap-2 pb-2">
              Hello, <span className="notranslate text-purple-600">{name}</span>!
            </h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="text-slate-500 font-medium mt-1">
              {TABS.find(t => t.id === activeTab)?.label || 'Overview'}
            </motion.p>
          </div>
          
          {/* RIGHT SIDE CONTROLS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* 👉 NEW: Language Selector */}
            <div className="shadow-sm rounded-full bg-white">
              <LanguageSelector />
            </div>

            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm transition-colors">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-400 to-fuchsia-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm cursor-pointer hover:scale-105 transition-transform notranslate">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'overview'  && <OverviewTab linkedStudent={linkedStudent} navigate={navigate} />}
            {activeTab === 'link'      && <LinkTab linkedStudent={linkedStudent} onLinked={handleLinked} toast={(m, t) => setToast({ message: m, type: t })} />}
            {activeTab === 'roadmap'   && <RoadmapTab linkedStudent={linkedStudent} />}
            {activeTab === 'feedback'  && <FeedbackTab linkedStudent={linkedStudent} toast={(m, t) => setToast({ message: m, type: t })} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}