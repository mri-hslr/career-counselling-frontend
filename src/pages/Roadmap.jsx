import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Loader2, ChevronDown, ChevronUp, CheckCircle2, Zap,
  Target, BookOpen, Flag, AlertCircle, Clock, BarChart2, Brain,
  ExternalLink, RefreshCw, Layers, Users, UserCheck,
  Wand2, MessageSquare, Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCareerRoadmap } from '../services/api/careerApi';

const IMPORTANCE_META = {
  CRITICAL:       { label: 'Critical',        bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    gradient: 'from-rose-500 to-pink-400' },
  STRATEGIC:      { label: 'Strategic',       bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   gradient: 'from-amber-500 to-orange-400' },
  SPECIALIZATION: { label: 'Specialization',  bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200',  gradient: 'from-violet-500 to-purple-400' },
};

const PHASE_GRADIENTS = [
  'from-blue-600 to-sky-400',
  'from-violet-600 to-purple-400',
  'from-emerald-600 to-teal-400',
  'from-amber-600 to-orange-400',
  'from-rose-600 to-pink-400',
];

const LEVEL_META = {
  BEGINNER:     { label: 'Beginner',     bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  INTERMEDIATE: { label: 'Intermediate', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  ADVANCED:     { label: 'Advanced',     bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500'    },
};


function PhaseCard({ phase, index, totalPhases }) {
  const [expanded, setExpanded] = useState(index === 0);
  const meta = IMPORTANCE_META[phase.importance] || IMPORTANCE_META.STRATEGIC;
  const gradient = PHASE_GRADIENTS[index % PHASE_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {index < totalPhases - 1 && (
        <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-slate-300 to-transparent z-10" />
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Phase Header */}
        <button onClick={() => setExpanded(e => !e)} className="w-full text-left">
          <div className={`bg-gradient-to-r ${gradient} p-6 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shrink-0">
                  <span className="text-white font-extrabold text-lg">{index + 1}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                      {meta.label}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-bold border border-white/30 backdrop-blur-sm">
                      {phase.duration_weeks} weeks
                    </span>
                  </div>
                  <h3 className="text-xl font-extrabold">{phase.phase_title}</h3>
                  <p className="text-white/80 font-medium mt-1 text-sm line-clamp-2">{phase.description}</p>
                </div>
              </div>
              <div className="shrink-0 mt-1">
                {expanded ? <ChevronUp size={22} className="text-white/80" /> : <ChevronDown size={22} className="text-white/80" />}
              </div>
            </div>

            {/* Skills Targeted */}
            {phase.skills_targeted && phase.skills_targeted.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {phase.skills_targeted.map((skill, si) => (
                  <span key={si} className="px-2.5 py-1 bg-white/15 border border-white/30 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 space-y-6">

                {/* Weekly Breakdown */}
                {phase.weekly_breakdown && phase.weekly_breakdown.length > 0 && (
                  <div>
                    <h4 className="flex items-center gap-2 font-extrabold text-slate-800 mb-4 text-sm uppercase tracking-wider">
                      <BookOpen size={16} className="text-blue-500" /> Week-by-Week Breakdown
                    </h4>
                    <div className="space-y-3">
                      {phase.weekly_breakdown.map((week) => (
                        <div key={week.week_number} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-extrabold flex items-center justify-center shrink-0`}>
                              W{week.week_number}
                            </div>
                            <span className="font-bold text-slate-800">{week.topic}</span>
                          </div>
                          <ul className="space-y-1.5 ml-11 mb-3">
                            {week.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>

                          {/* Resources */}
                          {week.resources && week.resources.length > 0 && (
                            <div className="ml-11 mt-3 pt-3 border-t border-slate-200">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Resources</p>
                              <div className="flex flex-wrap gap-2">
                                {week.resources.map((res, ri) => {
                                  const isUrl = typeof res === 'string' && (res.startsWith('http://') || res.startsWith('https://'));
                                  return isUrl ? (
                                    <a
                                      key={ri}
                                      href={res}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                                    >
                                      <ExternalLink size={11} /> {res.replace(/^https?:\/\//, '').split('/')[0]}
                                    </a>
                                  ) : (
                                    <span key={ri} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-xs font-semibold">
                                      <BookOpen size={11} /> {res}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Milestone Project */}
                {phase.milestone_project && (
                  <div className={`${meta.bg} ${meta.border} border rounded-2xl p-5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Flag size={16} className={meta.text} />
                      <span className={`text-xs font-extrabold uppercase tracking-wider ${meta.text}`}>Milestone Project</span>
                    </div>
                    <p className={`font-bold text-base ${meta.text}`}>{phase.milestone_project}</p>
                  </div>
                )}

                {/* Success Criteria */}
                {phase.success_criteria && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">You're ready when...</span>
                    </div>
                    <p className="font-semibold text-emerald-800 text-sm">{phase.success_criteria}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function Roadmap() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const selectedCareer = (() => {
    try { return JSON.parse(localStorage.getItem('harmony_selected_career')); } catch { return null; }
  })();

  const fetchRoadmap = useCallback((note) => {
    setLoading(true);
    setError('');
    getCareerRoadmap(selectedCareer?.title, note)
      .then(setRoadmap)
      .catch(e => setError(e.message || 'Failed to load roadmap'))
      .finally(() => setLoading(false));
  }, [selectedCareer?.title]);

  const handleAdjust = () => {
    setAdjusting(true);
    setAdjustSuccess(false);
    setAdjustOpen(false);
    getCareerRoadmap(selectedCareer?.title, adjustNote || undefined)
      .then(data => {
        setRoadmap(data);
        setAdjustNote('');
        setAdjustSuccess(true);
        setTimeout(() => setAdjustSuccess(false), 4000);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(e => setError(e.message || 'Adjustment failed. Please try again.'))
      .finally(() => setAdjusting(false));
  };

  useEffect(() => { fetchRoadmap(); }, [fetchRoadmap]);

  const totalWeeks = roadmap?.phases?.reduce((sum, p) => sum + (p.duration_weeks || 0), 0) || 0;
  const levelMeta = roadmap ? (LEVEL_META[roadmap.student_level] || LEVEL_META.BEGINNER) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 opacity-20 animate-ping absolute" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center relative">
              <Target size={36} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Building your roadmap...</h2>
          <p className="text-slate-500 font-medium">Creating a personalised step-by-step plan just for you</p>
          <Loader2 size={20} className="animate-spin text-blue-500 mx-auto mt-4" />
        </motion.div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-10 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Roadmap unavailable</h2>
          <p className="text-slate-500 font-medium mb-6">{error || 'Complete your profile and assessments to generate a personalised roadmap.'}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={fetchRoadmap}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> Retry
            </button>
            <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold">
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <Target size={20} className="text-blue-500" />
          <span className="text-lg font-extrabold text-slate-800">Your Career Roadmap</span>
        </div>
        <div className="w-24" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-600 to-sky-400 rounded-3xl p-10 text-white mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4" />

          <div className="relative z-10">
            {selectedCareer && (
              <span className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                🎯 Your Selected Career
              </span>
            )}
            <h1 className="text-4xl font-extrabold mb-3 leading-tight">
              {selectedCareer?.title || roadmap.career_title}
            </h1>
            <p className="text-blue-100 font-medium text-lg max-w-xl mb-8">
              {selectedCareer?.rationale || `A personalised roadmap to become a ${roadmap.career_title}.`}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Clock size={11} /> Total Duration
                </div>
                <div className="text-xl font-extrabold">{roadmap.total_duration || `${totalWeeks} Weeks`}</div>
              </div>
              {roadmap.daily_commitment && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap size={11} /> Daily Commitment
                  </div>
                  <div className="text-xl font-extrabold">{roadmap.daily_commitment}</div>
                </div>
              )}
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <BarChart2 size={11} /> Difficulty
                </div>
                <div className="text-xl font-extrabold">{roadmap.difficulty_level}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers size={11} /> Phases
                </div>
                <div className="text-xl font-extrabold">{roadmap.phases?.length || 0}</div>
              </div>
              {roadmap.student_level && levelMeta && (
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                  <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Brain size={11} /> Your Level
                  </div>
                  <div className="text-xl font-extrabold">{levelMeta.label}</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mentor & Parent Adjustments */}
        {(roadmap.mentor_adjustments || roadmap.parent_adjustments) && (
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {roadmap.mentor_adjustments && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-violet-50 border border-violet-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck size={18} className="text-violet-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-violet-700">Mentor's Note</span>
                </div>
                <p className="text-violet-800 font-medium text-sm">{roadmap.mentor_adjustments}</p>
              </motion.div>
            )}
            {roadmap.parent_adjustments && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-sky-50 border border-sky-200 rounded-2xl p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className="text-sky-600" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-sky-700">Parent's Note</span>
                </div>
                <p className="text-sky-800 font-medium text-sm">{roadmap.parent_adjustments}</p>
              </motion.div>
            )}
          </div>
        )}

        {/* Phase Overview Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {roadmap.phases?.map((phase, i) => {
            const meta = IMPORTANCE_META[phase.importance] || IMPORTANCE_META.STRATEGIC;
            return (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${meta.bg} ${meta.border} ${meta.text}`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center" style={{ opacity: 0.8 }}>
                  <span style={{ opacity: 1.5 }}>{i + 1}</span>
                </span>
                {phase.phase_title}
              </div>
            );
          })}
        </div>

        {/* Phases Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Zap size={20} className="text-blue-500" />
            <h2 className="text-xl font-extrabold text-slate-800">Your Learning Path</h2>
            <span className="text-sm font-bold text-slate-400">Click any phase to expand</span>
          </div>

          {roadmap.phases?.map((phase, i) => (
            <PhaseCard
              key={i}
              phase={phase}
              index={i}
              totalPhases={roadmap.phases.length}
            />
          ))}
        </div>

        {/* Adjust My Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          {/* Success toast */}
          <AnimatePresence>
            {adjustSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-4 mb-4"
              >
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="font-bold text-emerald-800 text-sm">Roadmap adjusted!</p>
                  <p className="text-emerald-600 text-xs font-medium">Your path has been regenerated with the latest feedback and your notes.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-3xl overflow-hidden">
            {/* Header row — always visible */}
            <button
              onClick={() => setAdjustOpen(o => !o)}
              className="w-full flex items-center justify-between p-6 text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <Wand2 size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Adjust My Path</h3>
                  <p className="text-sm font-medium text-slate-500">
                    Regenerate your roadmap incorporating mentor &amp; parent feedback plus your own notes
                  </p>
                </div>
              </div>
              <div className={`shrink-0 w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center transition-transform ${adjustOpen ? 'rotate-90' : ''}`}>
                <ChevronDown size={16} className="text-indigo-500" style={{ transform: adjustOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
            </button>

            {/* Expandable body */}
            <AnimatePresence>
              {adjustOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-5">
                    {/* Context cards */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-white rounded-2xl border border-violet-100 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCheck size={15} className="text-violet-500" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-violet-600">Mentor Feedback</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                          {roadmap.mentor_adjustments || 'No mentor feedback yet — book a session to get personalised guidance.'}
                        </p>
                      </div>
                      <div className="bg-white rounded-2xl border border-sky-100 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={15} className="text-sky-500" />
                          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">Parent Feedback</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                          {roadmap.parent_adjustments || 'No parent feedback yet — your parent can submit notes from their dashboard.'}
                        </p>
                      </div>
                    </div>

                    {/* Student's own note */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                        <MessageSquare size={15} className="text-indigo-500" />
                        Your adjustment request <span className="font-medium text-slate-400">(optional)</span>
                      </label>
                      <textarea
                        value={adjustNote}
                        onChange={e => setAdjustNote(e.target.value)}
                        rows={3}
                        placeholder="e.g. I want more focus on practical projects, I only have 1 hour daily on weekdays, I'd like more resources for each week..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleAdjust}
                        disabled={adjusting}
                        className="flex-1 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {adjusting ? (
                          <><Loader2 size={16} className="animate-spin" /> Regenerating...</>
                        ) : (
                          <><Sparkles size={16} /> Regenerate Roadmap</>
                        )}
                      </button>
                      <button
                        onClick={() => { setAdjustOpen(false); setAdjustNote(''); }}
                        className="px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs font-medium text-slate-400 text-center">
                      The AI will regenerate your full roadmap considering all available context. This may take a moment.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white text-center"
        >
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-extrabold mb-3">Your journey starts now!</h3>
          <p className="text-slate-300 font-medium max-w-md mx-auto mb-6">
            Start with Phase 1 and work your way through. Each milestone you complete brings you closer to your dream career.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-sky-400 text-white font-bold rounded-2xl shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Track Progress on Dashboard →
          </button>
        </motion.div>
      </div>
    </div>
  );
}
