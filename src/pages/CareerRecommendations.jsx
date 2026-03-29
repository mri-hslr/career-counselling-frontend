import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Sparkles, ChevronRight, CheckCircle2, AlertCircle, Map } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAIRecommendations } from '../services/api/careerApi';
import { buildProfile } from '../services/api/assessmentApi';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';

const CAREER_GRADIENTS = [
  'from-blue-600 to-sky-400',
  'from-violet-600 to-purple-400',
  'from-rose-500 to-pink-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
];

const CAREER_ICONS = ['💻', '🔬', '🎨', '📊', '🏥', '⚖️', '🎬', '🚀', '🌍', '🏗️'];

export default function CareerRecommendations() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [buildingProfile, setBuildingProfile] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    setError('');
    try {
      // First, build the profile if we have scores
      const personalityRaw = localStorage.getItem('harmony_personality_scores');
      const aptitudeRaw = localStorage.getItem('harmony_aptitude_scores');

      if (personalityRaw && aptitudeRaw && user?.userId) {
        setBuildingProfile(true);
        const personalityScores = JSON.parse(personalityRaw);
        const aptitudeScores = JSON.parse(aptitudeRaw);

        try {
          await buildProfile({
            basic_info: { grade: '10', interests: ['technology', 'science'] },
            aptitude: {
              quantitative: aptitudeScores.quantitative || 50,
              logical: aptitudeScores.logical || 50,
              verbal: aptitudeScores.verbal || 50,
            },
            personality: personalityScores,
          });
        } catch (e) {
          console.error('Profile build failed (continuing):', e);
        } finally {
          setBuildingProfile(false);
        }
      }

      const rec = await getAIRecommendations();
      setData(rec);
    } catch (e) {
      setError(e.message || 'Failed to generate recommendations. Please ensure you are logged in.');
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(career) {
    setSelected(career);
    localStorage.setItem('harmony_selected_career', JSON.stringify(career));
  }

  function handleViewRoadmap() {
    navigate('/roadmap');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 opacity-20 animate-ping absolute" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center relative">
              <Sparkles size={36} className="text-white animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">
            {buildingProfile ? 'Building your profile...' : 'AI is analysing your data...'}
          </h2>
          <p className="text-slate-500 font-medium">
            {buildingProfile
              ? 'Combining your assessment scores into a comprehensive profile'
              : 'Cross-referencing your personality, aptitude, interests, and aspirations to find your perfect career matches'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-blue-500" />
            <span className="text-sm font-semibold text-slate-500">This may take a few seconds...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <div className="bg-white rounded-3xl shadow-sm border border-red-100 p-10 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Something went wrong</h2>
          <p className="text-slate-500 font-medium mb-6">{error}</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all">
              Dashboard
            </button>
            <button onClick={loadRecommendations} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">
              Try Again
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
          <Sparkles size={20} className="text-blue-500" />
          <span className="text-lg font-extrabold text-slate-800">Your Career Matches</span>
        </div>
        <div className="w-20" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Intro */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Hey {getUserDisplayName()}, here are your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
              top career matches
            </span>
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-xl mx-auto">
            Based on your profile, assessments, and aspirations — our AI has identified the best career paths for you.
          </p>
        </motion.div>

        {/* Brutal Truth Card */}
        {data?.brutal_truth_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-white mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                  🤖 AI Honest Assessment
                </span>
              </div>
              <p className="text-slate-200 font-medium leading-relaxed text-lg">{data.brutal_truth_summary}</p>
            </div>
          </motion.div>
        )}

        {/* Career Cards */}
        <div className="space-y-4 mb-10">
          <h2 className="text-xl font-extrabold text-slate-800 mb-5 flex items-center gap-2">
            <Sparkles size={20} className="text-blue-500" /> Select your preferred career path
          </h2>

          {(data?.top_5_careers || []).map((career, i) => {
            const isSelected = selected?.title === career.title;
            const gradient = CAREER_GRADIENTS[i % CAREER_GRADIENTS.length];
            const icon = CAREER_ICONS[i % CAREER_ICONS.length];

            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => handleSelect(career)}
                className={`w-full text-left p-6 rounded-3xl border-2 transition-all group ${
                  isSelected
                    ? 'border-blue-400 bg-white shadow-xl shadow-blue-500/10 scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5'
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shrink-0 shadow-lg`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-7 h-7 rounded-full bg-gradient-to-r ${gradient} text-white text-xs font-extrabold flex items-center justify-center shrink-0`}>
                        {i + 1}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-900">{career.title}</h3>
                      {isSelected && <CheckCircle2 size={20} className="text-blue-500 ml-auto" />}
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">{career.rationale}</p>
                  </div>
                  {!isSelected && <ChevronRight size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors shrink-0 mt-2" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* CTA */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="sticky bottom-6 bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Career</p>
                <p className="text-lg font-extrabold text-slate-900">{selected.title}</p>
              </div>
              <button
                onClick={handleViewRoadmap}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/30 hover:-translate-y-0.5 transition-all whitespace-nowrap"
              >
                <Map size={20} /> Generate Roadmap
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
