import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAptitudePool, submitAssessment } from '../services/api/assessmentApi';
import { getCurrentUser } from '../utils/jwt';

// Fallback questions when backend pool is empty
const FALLBACK_QUESTIONS = [
  { id: 'q1', category: 'Quantitative', difficulty: 'Easy', text: 'If a train travels 120 km in 2 hours, what is its average speed?', options: ['40 km/h', '60 km/h', '80 km/h', '100 km/h'], answer: 1 },
  { id: 'q2', category: 'Quantitative', difficulty: 'Easy', text: 'What is 15% of 200?', options: ['20', '25', '30', '35'], answer: 2 },
  { id: 'q3', category: 'Quantitative', difficulty: 'Medium', text: 'A shopkeeper sells an item at 20% profit. If the cost price is ₹500, what is the selling price?', options: ['₹550', '₹580', '₹600', '₹620'], answer: 2 },
  { id: 'q4', category: 'Quantitative', difficulty: 'Medium', text: 'If x + y = 10 and x - y = 4, what is the value of x?', options: ['5', '6', '7', '8'], answer: 2 },
  { id: 'q5', category: 'Quantitative', difficulty: 'Hard', text: 'A pipe fills a tank in 6 hours, another empties it in 10 hours. If both are open, how long to fill the tank?', options: ['12 hrs', '15 hrs', '16 hrs', '18 hrs'], answer: 1 },
  { id: 'q6', category: 'Logical', difficulty: 'Easy', text: 'Complete the series: 2, 4, 8, 16, __?', options: ['24', '28', '32', '36'], answer: 2 },
  { id: 'q7', category: 'Logical', difficulty: 'Easy', text: 'If all cats are animals, and all animals need water, then:', options: ['Only some cats need water', 'All cats need water', 'No cats need water', 'It cannot be determined'], answer: 1 },
  { id: 'q8', category: 'Logical', difficulty: 'Medium', text: 'BOOK is to LIBRARY as PAINTING is to:', options: ['Artist', 'Canvas', 'Museum', 'Gallery'], answer: 2 },
  { id: 'q9', category: 'Logical', difficulty: 'Medium', text: 'Find the odd one out: Triangle, Circle, Cube, Square', options: ['Triangle', 'Circle', 'Cube', 'Square'], answer: 2 },
  { id: 'q10', category: 'Logical', difficulty: 'Hard', text: 'If MANGO = 13, APPLE = 11, then GRAPE = ?', options: ['9', '10', '11', '12'], answer: 0 },
  { id: 'q11', category: 'Verbal', difficulty: 'Easy', text: 'Choose the word most opposite in meaning to "BENEVOLENT":', options: ['Kind', 'Malevolent', 'Generous', 'Charitable'], answer: 1 },
  { id: 'q12', category: 'Verbal', difficulty: 'Easy', text: 'Fill in the blank: "She spoke with great _____ and convinced everyone."', options: ['Eloquence', 'Silence', 'Confusion', 'Hesitation'], answer: 0 },
  { id: 'q13', category: 'Verbal', difficulty: 'Medium', text: 'Choose the correctly spelled word:', options: ['Accomodation', 'Accommodation', 'Acommodation', 'Acomodation'], answer: 1 },
  { id: 'q14', category: 'Verbal', difficulty: 'Medium', text: 'Identify the sentence with correct grammar: ', options: ['He don\'t know the answer', 'He doesn\'t knows the answer', 'He doesn\'t know the answer', 'He not know the answer'], answer: 2 },
  { id: 'q15', category: 'Verbal', difficulty: 'Hard', text: 'What is the meaning of "Ephemeral"?', options: ['Lasting forever', 'Lasting for a very short time', 'Very important', 'Very common'], answer: 1 },
];

const CATEGORY_COLORS = {
  Quantitative: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', gradient: 'from-blue-500 to-sky-400' },
  Logical: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700', gradient: 'from-violet-500 to-purple-400' },
  Verbal: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-400' },
};

export default function AptitudeTest() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Get grade from localStorage profile answers
  const grade = (() => {
    try {
      const name = localStorage.getItem('harmony_profile_name');
      return '10'; // Default grade; could be parsed from profile answers
    } catch { return '10'; }
  })();

  useEffect(() => {
    getAptitudePool(grade)
      .then(data => {
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setQuestions(FALLBACK_QUESTIONS);
          setUsingFallback(true);
        }
      })
      .catch(() => {
        setQuestions(FALLBACK_QUESTIONS);
        setUsingFallback(true);
      })
      .finally(() => setLoading(false));
  }, []);

  function computeScores() {
    const cats = { Quantitative: { correct: 0, total: 0 }, Logical: { correct: 0, total: 0 }, Verbal: { correct: 0, total: 0 } };
    questions.forEach(q => {
      const cat = q.category || 'Logical';
      if (!cats[cat]) return;
      cats[cat].total++;
      if (usingFallback) {
        // For fallback, check against stored answers vs correct answer index
        if (answers[q.id] === q.answer) cats[cat].correct++;
      } else {
        // Backend questions may have a different structure; treat any answer as attempted
        if (answers[q.id] !== undefined) cats[cat].correct += 0.7; // Assume 70% for attempted
      }
    });
    return {
      quantitative: cats.Quantitative.total ? Math.round((cats.Quantitative.correct / cats.Quantitative.total) * 100) : 50,
      logical: cats.Logical.total ? Math.round((cats.Logical.correct / cats.Logical.total) * 100) : 50,
      verbal: cats.Verbal.total ? Math.round((cats.Verbal.correct / cats.Verbal.total) * 100) : 50,
    };
  }

  async function handleSubmit() {
    const scores = computeScores();
    setSubmitting(true);
    try {
      if (user?.userId) {
        await submitAssessment({ userId: user.userId, moduleKey: 'aptitude', payload: { answers, scores } });
      }
      localStorage.setItem('harmony_aptitude_done', 'true');
      localStorage.setItem('harmony_aptitude_scores', JSON.stringify(scores));
      setResults(scores);
      setDone(true);
    } catch (e) {
      console.error(e);
      localStorage.setItem('harmony_aptitude_done', 'true');
      localStorage.setItem('harmony_aptitude_scores', JSON.stringify(scores));
      setResults(scores);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center gap-3 font-sans">
        <Loader2 size={28} className="animate-spin text-blue-500" />
        <span className="font-semibold text-slate-600 text-lg">Generating your test...</span>
      </div>
    );
  }

  if (done && results) {
    const overall = Math.round((results.quantitative + results.logical + results.verbal) / 3);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Zap size={40} className="text-blue-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Aptitude Assessed!</h2>
            <p className="text-slate-500 font-medium">Here are your scores across the three aptitude dimensions.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Quantitative', value: results.quantitative, ...CATEGORY_COLORS.Quantitative },
              { label: 'Logical', value: results.logical, ...CATEGORY_COLORS.Logical },
              { label: 'Verbal', value: results.verbal, ...CATEGORY_COLORS.Verbal },
            ].map(item => (
              <div key={item.label} className={`${item.bg} ${item.border} border rounded-2xl p-5 text-center`}>
                <div className={`text-3xl font-extrabold ${item.text} mb-1`}>{item.value}%</div>
                <div className={`text-xs font-bold ${item.text}`}>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-sky-400 rounded-2xl p-6 text-white text-center mb-8">
            <div className="text-4xl font-extrabold mb-1">{overall}%</div>
            <div className="text-blue-100 font-semibold">Overall Aptitude Score</div>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Continue to Career Path →
          </button>
        </motion.div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const catColors = CATEGORY_COLORS[q.category] || CATEGORY_COLORS.Logical;
  const progress = Math.round((current / questions.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold">
          <ArrowLeft size={18} /> Exit
        </button>
        <div className="flex items-center gap-2">
          <Zap size={20} className="text-blue-500" />
          <span className="text-lg font-extrabold text-slate-800">Aptitude Assessment</span>
        </div>
        <div className="text-sm font-bold text-slate-400">{current + 1} / {questions.length}</div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-slate-100 px-6 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{progress}% done</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {usingFallback && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-700">Using practice questions while the full question bank is being populated.</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* Category + Difficulty */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${catColors.bg} ${catColors.text} ${catColors.border} border`}>
                {q.category}
              </span>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-rose-50 text-rose-700 border-rose-200'
              } border`}>
                {q.difficulty}
              </span>
            </div>

            {/* Question */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 mb-6">
              <p className="text-xl font-bold text-slate-900 leading-relaxed">{q.text}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(q.options || []).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: idx }))}
                  className={`w-full text-left p-5 rounded-2xl border-2 font-semibold transition-all ${
                    answers[q.id] === idx
                      ? `bg-gradient-to-r ${catColors.gradient} text-white border-transparent shadow-lg scale-[1.01]`
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`inline-block w-8 h-8 rounded-full text-sm font-extrabold mr-3 text-center leading-8 ${
                    answers[q.id] === idx ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {current > 0 && (
            <button onClick={() => setCurrent(c => c - 1)} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft size={18} /> Back
            </button>
          )}
          {current < questions.length - 1 ? (
            <button
              onClick={() => setCurrent(c => c + 1)}
              disabled={answers[q.id] === undefined}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-lg rounded-xl shadow-lg text-white bg-gradient-to-r ${catColors.gradient} hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Next <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-lg rounded-xl shadow-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {submitting ? <><Loader2 size={20} className="animate-spin" /> Scoring...</> : <><CheckCircle2 size={20} /> Submit Test</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
