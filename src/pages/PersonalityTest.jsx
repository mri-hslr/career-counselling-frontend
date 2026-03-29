import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getModuleQuestions, submitAssessment } from '../services/api/assessmentApi';
import { getCurrentUser } from '../utils/jwt';

const TRAIT_META = {
  C: { label: 'Curiosity & Creativity',  color: 'from-violet-500 to-purple-400', bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200' },
  D: { label: 'Discipline & Consistency', color: 'from-blue-500 to-sky-400',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  E: { label: 'Empathy & Teamwork',       color: 'from-rose-500 to-pink-400',    bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200' },
  S: { label: 'Social Confidence',        color: 'from-amber-500 to-orange-400', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  H: { label: 'Stress Handling',          color: 'from-emerald-500 to-teal-400', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const LIKERT = [
  { value: 1, label: 'Strongly\nDisagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly\nAgree' },
];

const QUESTIONS_PER_PAGE = 5;

function computeScores(questions, answers) {
  const traitRaw = {};
  const traitCount = {};
  Object.entries(questions).forEach(([key, q]) => {
    const trait = key[0]; // C, D, E, S, H
    const response = parseInt(answers[key]) || 3;
    const score = q.type === 'negative' ? (6 - response) : response;
    traitRaw[trait] = (traitRaw[trait] || 0) + score;
    traitCount[trait] = (traitCount[trait] || 0) + 1;
  });

  const raw_scores = {};
  Object.keys(traitRaw).forEach(trait => {
    raw_scores[trait] = Math.round((traitRaw[trait] / (traitCount[trait] * 5)) * 100);
  });

  const sorted = Object.entries(raw_scores).sort(([, a], [, b]) => b - a);
  const dominant_traits = sorted.slice(0, 2).map(([t]) => t);
  return { dominant_traits, raw_scores };
}

export default function PersonalityTest() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    getModuleQuestions('personality')
      .then(data => setQuestions(data.questions || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const questionEntries = Object.entries(questions);
  const totalPages = Math.ceil(questionEntries.length / QUESTIONS_PER_PAGE);
  const pageQuestions = questionEntries.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);
  const answeredOnPage = pageQuestions.filter(([k]) => answers[k]).length;
  const progress = questionEntries.length > 0
    ? Math.round((Object.keys(answers).length / questionEntries.length) * 100)
    : 0;

  function handleAnswer(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  async function handleFinish() {
    const computed = computeScores(questions, answers);
    setScores(computed);
    setSubmitting(true);
    try {
      if (user?.userId) {
        await submitAssessment({
          userId: user.userId,
          moduleKey: 'personality',
          payload: { answers, scores: computed },
        });
      }
      localStorage.setItem('harmony_personality_done', 'true');
      localStorage.setItem('harmony_personality_scores', JSON.stringify(computed));
      setDone(true);
    } catch (e) {
      console.error(e);
      localStorage.setItem('harmony_personality_done', 'true');
      localStorage.setItem('harmony_personality_scores', JSON.stringify(computed));
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-3 font-sans">
        <Loader2 size={28} className="animate-spin text-blue-500" />
        <span className="font-semibold text-slate-600 text-lg">Loading assessment...</span>
      </div>
    );
  }

  if (done && scores) {
    const topTrait = scores.dominant_traits[0];
    const meta = TRAIT_META[topTrait];
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Brain size={40} className="text-violet-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Personality Mapped!</h2>
            <p className="text-slate-500 font-medium">Here's how your personality breaks down across 5 key dimensions.</p>
          </div>

          <div className="space-y-4 mb-8">
            {Object.entries(scores.raw_scores).sort(([,a],[,b]) => b - a).map(([trait, score]) => {
              const m = TRAIT_META[trait] || TRAIT_META.C;
              const isDominant = scores.dominant_traits.includes(trait);
              return (
                <div key={trait} className={`p-4 rounded-2xl border ${isDominant ? m.border + ' ' + m.bg : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold text-sm ${isDominant ? m.text : 'text-slate-600'}`}>{m.label}</span>
                      {isDominant && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${m.bg} ${m.text} border ${m.border}`}>Dominant</span>}
                    </div>
                    <span className="font-extrabold text-slate-800">{score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full bg-gradient-to-r ${m.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Continue to Next Step →
          </button>
        </motion.div>
      </div>
    );
  }

  const currentTrait = pageQuestions[0]?.[0]?.[0];
  const traitMeta = TRAIT_META[currentTrait] || TRAIT_META.C;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold">
          <ArrowLeft size={18} /> Exit
        </button>
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-violet-500" />
          <span className="text-lg font-extrabold text-slate-800">Personality Assessment</span>
        </div>
        <div className="text-sm font-bold text-slate-400">{Object.keys(answers).length} / {questionEntries.length}</div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Progress</span><span>{progress}% complete</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Trait Badge */}
        <motion.div
          key={page}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${traitMeta.color} text-white text-sm font-bold mb-6 shadow-md`}
        >
          <Brain size={16} />
          {traitMeta.label} — Page {page + 1} of {totalPages}
        </motion.div>

        {/* Instruction */}
        <p className="text-slate-500 font-medium mb-8 text-sm">
          Rate each statement honestly. There are no right or wrong answers — your genuine response is what matters most.
        </p>

        {/* Questions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-5"
          >
            {pageQuestions.map(([key, q], idx) => (
              <div key={key} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <div className="flex items-start gap-3 mb-5">
                  <span className={`w-7 h-7 rounded-full bg-gradient-to-r ${traitMeta.color} text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5`}>
                    {idx + 1 + page * QUESTIONS_PER_PAGE}
                  </span>
                  <p className="text-slate-800 font-semibold leading-relaxed">{q.text}</p>
                </div>
                <div className="flex gap-2">
                  {LIKERT.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => handleAnswer(key, opt.value)}
                      className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all leading-tight text-center ${
                        answers[key] === opt.value
                          ? `bg-gradient-to-b ${traitMeta.color} text-white border-transparent shadow-md scale-105`
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="text-lg font-extrabold mb-0.5">{opt.value}</div>
                      <div className="whitespace-pre-line">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {page > 0 && (
            <button onClick={() => setPage(p => p - 1)} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft size={18} /> Previous
            </button>
          )}
          {page < totalPages - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={answeredOnPage < pageQuestions.length}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-lg rounded-xl shadow-lg bg-gradient-to-r from-violet-500 to-purple-400 text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={submitting || Object.keys(answers).length < questionEntries.length * 0.8}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-lg rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Calculating...</> : <><CheckCircle2 size={20} /> Submit & View Results</>}
            </button>
          )}
        </div>

        {page < totalPages - 1 && answeredOnPage < pageQuestions.length && (
          <p className="text-center text-sm text-amber-600 font-semibold mt-3">
            Answer all {pageQuestions.length} questions on this page to continue
          </p>
        )}
      </div>
    </div>
  );
}
