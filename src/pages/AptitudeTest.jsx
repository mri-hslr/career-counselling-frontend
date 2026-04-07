import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowLeft, Loader2, Zap, AlertCircle, TrendingUp, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { apiClient } from '../services/api/apiClient';
import { getAptitudePool, submitAssessment, saveTestProgress, getTestProgress } from '../services/api/assessmentApi';
import { getCurrentUser } from '../utils/jwt';

// ─── Result Screen Component ──────────────────────────────────────────────────

function ScoreCard({ label, value, max, color, bgColor, icon: Icon }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bgColor} rounded-2xl p-6 border transition-all hover:shadow-md`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-slate-800 text-sm">{label}</p>
          <p className="text-2xl font-black text-slate-900">
            {value}<span className="text-sm font-semibold text-slate-400">/{max}</span>
          </p>
        </div>
      </div>
      <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden border border-white/50">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
      <p className="text-[10px] font-black text-slate-500 mt-2 text-right uppercase tracking-wider">{pct}% Accuracy</p>
    </motion.div>
  );
}

function AptitudeResultScreen({ aptiData }) {
  const navigate = useNavigate();

  // DEBUG: Let's see what the data looks like
  console.log("🛠️ Result Screen Data Received:", aptiData);

  const getScore = (patterns) => {
    if (!aptiData) return 0;
    
    // Check for exact keys first (mridul123 format)
    const exactKey = Object.keys(aptiData).find(k => 
      patterns.some(p => k.toLowerCase() === p.toLowerCase())
    );
    
    // If not found, check for partial matches (user@yash format)
    const fuzzyKey = exactKey || Object.keys(aptiData).find(k => 
      patterns.some(p => k.toLowerCase().includes(p.toLowerCase()))
    );

    if (!fuzzyKey) return 0;
    
    const value = aptiData[fuzzyKey];
    const rawVal = typeof value === 'object' ? value?.score : value;
    
    // Normalize: Handle 0-100 scales or 0-5 scales
    return rawVal > 5 ? Math.round((rawVal / 100) * 5) : (rawVal || 0);
  };

  const q = getScore(['quantitative', 'quant', 'quantitative_aptitude']);
  const l = getScore(['logical', 'logi', 'logical_reasoning']);
  const v = getScore(['verbal', 'verb', 'verbal_ability']);
  
  const max = 5; 
  const total = q + l + v;
  const totalMax = 15;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-2xl">
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">Adaptive Assessment Complete</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                  <TrendingUp size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">Aptitude Profile</h1>
                  <p className="text-blue-50 font-medium opacity-90">Analysis of {totalMax} adaptive questions</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-1">Total</p>
                <p className="text-5xl font-black">{total}<span className="text-xl font-bold opacity-60">/{totalMax}</span></p>
              </div>
            </div>
          </div>

          <div className="p-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
              <ScoreCard label="Quantitative" value={q} max={max} color="bg-blue-500" bgColor="bg-blue-50/50 border-blue-100" icon={Zap} />
              <ScoreCard label="Logical" value={l} max={max} color="bg-violet-500" bgColor="bg-violet-50/50 border-violet-100" icon={Zap} />
              <ScoreCard label="Verbal" value={v} max={max} color="bg-emerald-500" bgColor="bg-emerald-50/50 border-emerald-100" icon={Zap} />
            </div>
            <button onClick={() => navigate('/dashboard')} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function OptionButton({ text, selected, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left p-5 rounded-2xl border-2 font-bold transition-all flex items-center gap-4 ${
        selected 
          ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-md' 
          : 'border-slate-100 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50/50'
      } ${disabled && !selected ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${selected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
        {text.substring(0, 1)}
      </div>
      <span className="flex-1 font-medium">{text.split(')')[1]?.trim() || text}</span>
    </motion.button>
  );
}

function CategoryBadge({ category }) {
  const cat = category?.toLowerCase() || '';
  const map = {
    'quantitative aptitude': { label: 'Quantitative', cls: 'bg-blue-100 text-blue-700' },
    'logical reasoning': { label: 'Logical', cls: 'bg-violet-100 text-violet-700' },
    'verbal ability': { label: 'Verbal', cls: 'bg-emerald-100 text-emerald-700' },
  };
  const key = Object.keys(map).find(k => cat.includes(k.split(' ')[0])) || 'logical reasoning';
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-current opacity-70 ${map[key].cls}`}>{map[key].label}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AptitudeTest() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [status, setStatus] = useState('loading'); 
  const [aptiData, setAptiData] = useState(null);
  const [masterPool, setMasterPool] = useState([]); 
  const [sessionQuestions, setSessionQuestions] = useState([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [targetGrade, setTargetGrade] = useState('8');

  useEffect(() => {
    async function init() {
      try {
        const me = await apiClient.get('/api/v1/auth/users/me');

        // Check if already completed
        const rawData = me.apti_data || {};
        const finalScores = rawData.scores ? rawData.scores : rawData;
        // Only consider completed if there are non-progress keys (not in-progress marker)
        const hasCompletedScores = Object.keys(finalScores).filter(k => !k.startsWith('_')).length > 0
          && finalScores._status !== 'in_progress';

        if (hasCompletedScores) {
          setAptiData(finalScores);
          setStatus('completed');
          return;
        }

        // Check for in-progress session to resume
        const progressData = await getTestProgress('aptitude', me.user_id).catch(() => null);
        if (progressData?.in_progress && progressData.session_questions?.length > 0) {
          const pool = await getAptitudePool(targetGrade).catch(() => ({ questions: [] }));
          setMasterPool(pool?.questions || []);
          setSessionQuestions(progressData.session_questions);
          // Restore answers keyed by index (convert string keys back to numbers where needed)
          setAnswers(progressData.answers || {});
          setCurrentIndex(progressData.current_index || 0);
          setStatus('testing');
          return;
        }

        const localGrade = localStorage.getItem('harmony_student_grade');
        const extractedNum = localGrade?.toString().match(/\d+/)
          ? parseInt(localGrade.toString().match(/\d+/)[0], 10)
          : 8;

        let mappedGrade = '6-8';
        if (extractedNum >= 6 && extractedNum <= 8) mappedGrade = '6-8';
        else if (extractedNum >= 9 && extractedNum <= 11) mappedGrade = '9-11';
        else if (extractedNum >= 12) mappedGrade = '12';

        setTargetGrade(mappedGrade);

        const pool = await getAptitudePool(mappedGrade);
        const questions = pool?.questions || pool || [];
        setMasterPool(questions);

        if (questions.length > 0) {
          const categories = [...new Set(questions.map(q => q.category))];
          const initialSet = categories.map(cat =>
            questions.find(q => q.category === cat && q.difficulty === 'Easy')
          ).filter(Boolean);

          setSessionQuestions(initialSet);
          setStatus('testing');
        } else {
          setStatus('testing');
        }
      } catch (err) {
        console.error('Init error:', err);
        setStatus('testing');
      }
    }
    init();
  }, []); // eslint-disable-line

  const currentQuestion = sessionQuestions[currentIndex];
  const totalInSession = 15;
  const progress = Math.round(((currentIndex + 1) / totalInSession) * 100);

  const handlePickOption = (optionText) => {
    if (submitting) return;
    const letter = optionText.substring(0, 1).toUpperCase();
    const qId = currentQuestion.id || currentIndex;

    const updatedAnswers = { ...answers, [qId]: letter };
    setAnswers(updatedAnswers);
    const isCorrect = letter === currentQuestion.answer;

    // Auto-save progress silently after each answer (fire-and-forget)
    const userId = user?.userId;
    if (userId) {
      saveTestProgress({
        userId,
        testKey: 'aptitude',
        sessionQuestions,
        answers: updatedAnswers,
        currentIndex,
      }).catch(() => {}); // fire-and-forget, don't block UX
    }

    if (currentIndex < totalInSession - 1) {
      setTimeout(() => navigateNextAdaptive(isCorrect), 400);
    }
  };

  const navigateNextAdaptive = (isCorrect) => {
    const currentCat = currentQuestion.category;
    const currentDiff = currentQuestion.difficulty;
    
    let nextDiff = currentDiff;
    if (isCorrect) {
      if (currentDiff === 'Easy') nextDiff = 'Medium';
      else if (currentDiff === 'Medium') nextDiff = 'Hard';
    } else {
      if (currentDiff === 'Hard') nextDiff = 'Medium';
      else if (currentDiff === 'Medium') nextDiff = 'Easy';
    }

    const nextQ = masterPool.find(q => 
      q.category === currentCat && 
      q.difficulty === nextDiff && 
      !sessionQuestions.some(sq => sq.question === q.question)
    ) || masterPool.find(q => q.category === currentCat && !sessionQuestions.some(sq => sq.question === q.question));

    if (nextQ) {
      setSessionQuestions(prev => [...prev, nextQ]);
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let qCount = 0, lCount = 0, vCount = 0;
      sessionQuestions.forEach(q => {
        const userAnswer = answers[q.id || sessionQuestions.indexOf(q)];
        if (userAnswer === q.answer) {
          const cat = q.category;
          if (cat === "Quantitative Aptitude") qCount++;
          else if (cat === "Logical Reasoning") lCount++;
          else if (cat === "Verbal Ability") vCount++;
        }
      });

      const calculatedScores = { 
        quantitative: qCount, 
        logical: lCount, 
        verbal: vCount, 
        max_score: 5 
      };

      // Final submit — clears the in_progress marker by overwriting with completed scores
      await submitAssessment({
        userId: user?.userId,
        moduleKey: 'aptitude',
        payload: { answers, scores: calculatedScores, target_grade: targetGrade },
      });

      localStorage.setItem('harmony_aptitude_done', 'true');
      setAptiData(calculatedScores);
      setStatus('completed');
      toast.success('Assessment Results Saved');
    } catch (err) {
      toast.error('Failed to save results.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 size={40} className="animate-spin text-blue-600" />
    </div>
  );

  if (status === 'completed') return <AptitudeResultScreen aptiData={aptiData} />;
  
  if (!currentQuestion) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl max-w-sm border border-slate-100">
        <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
        <p className="text-slate-600 font-bold mb-6">No questions found for Grade {targetGrade}.</p>
        <button onClick={() => navigate('/dashboard')} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-all"><ArrowLeft size={18} /> Exit</button>
        <div className="flex items-center gap-6">
          <CategoryBadge category={currentQuestion.category} />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Question {currentIndex + 1} OF {totalInSession}</span>
            <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden"><motion.div animate={{ width: `${progress}%` }} className="h-full bg-blue-600" /></div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-10 mb-8 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-8">
                   <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200"><Zap size={16} className="text-white fill-white" /></div>
                   <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Adaptive Challenge</span>
                   <span className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      currentQuestion.difficulty.toLowerCase() === 'hard' ? 'bg-rose-100 text-rose-600' :
                      currentQuestion.difficulty.toLowerCase() === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>{currentQuestion.difficulty}</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-10 leading-[1.4] relative z-10">{currentQuestion.question}</h2>
                <div className="space-y-4 relative z-10">
                  {currentQuestion.options.map((opt, i) => (
                    <OptionButton 
                      key={i} 
                      text={opt} 
                      selected={answers[currentQuestion.id || currentIndex] === opt.substring(0, 1).toUpperCase()} 
                      onClick={() => handlePickOption(opt)} 
                      disabled={submitting}
                    />
                  ))}
                </div>
              </div>

              {currentIndex === totalInSession - 1 && answers[currentQuestion.id || currentIndex] && (
                <motion.button 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleSubmit} 
                  disabled={submitting} 
                  className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Submit Final Assessment'} <ChevronRight size={20} />
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}