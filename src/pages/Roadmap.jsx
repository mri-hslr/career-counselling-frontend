import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, ChevronDown, ChevronUp, CheckCircle2, Zap, Target, BookOpen, Flag, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCareerRoadmap } from '../services/api/careerApi';

const IMPORTANCE_META = {
  CRITICAL:       { label: 'Critical', bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-500',    gradient: 'from-rose-500 to-pink-400' },
  STRATEGIC:      { label: 'Strategic', bg: 'bg-amber-50',  text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-500',   gradient: 'from-amber-500 to-orange-400' },
  SPECIALIZATION: { label: 'Specialization', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500', gradient: 'from-violet-500 to-purple-400' },
};

const PHASE_GRADIENTS = [
  'from-blue-600 to-sky-400',
  'from-violet-600 to-purple-400',
  'from-emerald-600 to-teal-400',
  'from-amber-600 to-orange-400',
  'from-rose-600 to-pink-400',
];

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
      {/* Timeline connector */}
      {index < totalPhases - 1 && (
        <div className="absolute left-8 top-full h-6 w-0.5 bg-gradient-to-b from-slate-300 to-transparent z-10" />
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {/* Phase Header */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full text-left"
        >
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
                          <ul className="space-y-1.5 ml-11">
                            {week.tasks.map((task, ti) => (
                              <li key={ti} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>
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
  const selectedCareer = (() => {
    try { return JSON.parse(localStorage.getItem('harmony_selected_career')); } catch { return null; }
  })();

  useEffect(() => {
    getCareerRoadmap()
      .then(setRoadmap)
      .catch(e => setError(e.message || 'Failed to load roadmap'))
      .finally(() => setLoading(false));
  }, []);

  const totalWeeks = roadmap?.phases?.reduce((sum, p) => sum + (p.duration_weeks || 0), 0) || 0;

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
          <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
            Back to Dashboard
          </button>
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
          className="bg-gradient-to-br from-blue-600 to-sky-400 rounded-3xl p-10 text-white mb-10 relative overflow-hidden"
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
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Total Duration</div>
                <div className="text-xl font-extrabold">{roadmap.total_duration || `${totalWeeks} Weeks`}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Difficulty</div>
                <div className="text-xl font-extrabold">{roadmap.difficulty_level}</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border border-white/30">
                <div className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Phases</div>
                <div className="text-xl font-extrabold">{roadmap.phases?.length || 0}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Phase Overview Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {roadmap.phases?.map((phase, i) => {
            const meta = IMPORTANCE_META[phase.importance] || IMPORTANCE_META.STRATEGIC;
            return (
              <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${meta.bg} ${meta.border} ${meta.text}`}>
                <span className="w-5 h-5 rounded-full bg-current text-white flex items-center justify-center" style={{opacity:0.8}}>
                  <span style={{opacity:1.5}}>{i + 1}</span>
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

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white text-center"
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
