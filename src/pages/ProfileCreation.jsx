import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, User, BookOpen, Heart, Compass, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getModuleQuestions, submitAssessment } from '../services/api/assessmentApi';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';

const MODULES = [
  { key: 'profile',   label: 'Basic Profile',      icon: User,     color: 'from-blue-500 to-sky-400',      desc: 'Tell us who you are' },
  { key: 'academic',  label: 'Academic Profile',    icon: BookOpen, color: 'from-violet-500 to-purple-400', desc: 'Your academic background' },
  { key: 'lifestyle', label: 'Lifestyle & Habits',  icon: Heart,    color: 'from-rose-500 to-pink-400',     desc: 'Your daily routine & habits' },
  { key: 'interests', label: 'Interests & Strengths', icon: Compass, color: 'from-amber-500 to-orange-400', desc: 'What drives and excites you' },
  { key: 'aspiration',label: 'Dreams & Aspirations', icon: Star,    color: 'from-emerald-500 to-teal-400',  desc: 'Your vision for the future' },
  { key: 'financial', label: 'Financial Background', icon: DollarSign, color: 'from-slate-500 to-gray-400', desc: 'Help us find the right fit' },
];

const QUESTION_CONFIGS = {
  // profile
  full_name: { type: 'text', placeholder: 'Your full legal name' },
  dob: { type: 'date' },
  gender: { type: 'select', options: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  current_class: { type: 'select', options: ['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'College 1st Year', 'College 2nd Year', 'College 3rd Year'] },
  school_type: { type: 'select', options: ['Government', 'Private', 'International', 'Semi-Government'] },
  state: { type: 'text', placeholder: 'e.g., Maharashtra, Delhi' },
  area_type: { type: 'select', options: ['Urban', 'Semi-Urban', 'Rural'] },
  medium_of_learning: { type: 'select', options: ['English', 'Hindi', 'Regional Language', 'Mixed (English + Hindi)'] },
  // academic
  overall_percentage_band: { type: 'select', options: ['Below 40%', '40–60%', '60–75%', '75–90%', 'Above 90%'] },
  strongest_subject: { type: 'text', placeholder: 'e.g., Mathematics, Science' },
  weakest_subject: { type: 'text', placeholder: 'e.g., History, Geography' },
  favorite_subject: { type: 'text', placeholder: 'e.g., Physics (regardless of marks)' },
  learning_style: { type: 'select', options: ['Visual – Videos & Diagrams', 'Auditory – Lectures & Podcasts', 'Kinesthetic – Hands-on & Doing'] },
  study_hours_home: { type: 'select', options: ['Less than 1 hour/day', '1–2 hours/day', '2–4 hours/day', 'More than 4 hours/day'] },
  homework_completion: { type: 'select', options: ['Always (90–100%)', 'Usually (70–90%)', 'Sometimes (50–70%)', 'Rarely (below 50%)'] },
  achievements: { type: 'textarea', placeholder: 'List any academic or co-curricular achievements, awards, competitions...' },
  // lifestyle
  screen_time: { type: 'select', options: ['Less than 1 hr/day', '1–2 hrs/day', '2–4 hrs/day', 'More than 4 hrs/day'] },
  sleep_quality: { type: 'select', options: ['Less than 6 hrs (poor quality)', '6–7 hrs (adequate)', '7–8 hrs (good)', 'More than 8 hrs (excellent)'] },
  study_hours: { type: 'select', options: ['Less than 1 hr', '1–2 hrs of deep work', '2–4 hrs of deep work', 'More than 4 hrs'] },
  routine_consistency: { type: 'scale10', label: 'Routine Strictness' },
  distraction_level: { type: 'select', options: ['Very easily distracted', 'Somewhat distracted', 'Rarely distracted', 'Completely focused'] },
  reaction_to_failure: { type: 'select', options: ['Get upset and give up', 'Feel bad, but try again after a while', 'Analyze what went wrong and fix it', 'Stay calm and bounce back immediately'] },
  pressure_handling: { type: 'select', options: ['Panic and freeze', 'Get anxious but eventually manage', 'Handle with moderate stress', 'Thrive under pressure'] },
  social_preference: { type: 'select', options: ['Group study – collaborative', 'Solo focus – independent deep work'] },
  focus_ability: { type: 'select', options: ['Less than 20 minutes', '20–45 minutes', '45–90 minutes', 'More than 2 hours'] },
  biggest_distraction: { type: 'text', placeholder: 'e.g., Social media, mobile notifications, TV' },
  // interests
  work_environment: { type: 'select', options: ['Indoor / Office / Lab setting', 'Outdoor / Field / On-site work'] },
  work_style: { type: 'select', options: ['Team-based & collaborative', 'Individual deep-work & independent'] },
  biggest_strength: { type: 'text', placeholder: 'e.g., Problem-solving, communication, creativity' },
  biggest_weakness: { type: 'text', placeholder: 'e.g., Procrastination, public speaking, time management' },
  preferred_activity: { type: 'text', placeholder: 'e.g., Coding, drawing, writing, sports' },
  interest_domain: { type: 'select', options: ['Technology & Computers', 'Art, Design & Media', 'Business & Finance', 'Social Work & Education', 'Science & Research', 'Healthcare & Medicine', 'Law & Governance', 'Not Sure Yet'] },
  leadership: { type: 'select', options: ['Yes, I love leading and organizing', 'Sometimes, depends on the situation', 'Not really, I prefer to follow'] },
  helping_nature: { type: 'select', options: ['Yes, very fulfilling to me', 'Somewhat fulfilling', 'Not particularly my thing'] },
  data_orientation: { type: 'select', options: ['Yes, I love numbers, logic & data', 'Somewhat comfortable with data', 'Not really, I prefer creative/verbal work'] },
  creativity: { type: 'select', options: ['Yes, very creative', 'Somewhat creative', 'Not particularly creative'] },
  research_inclination: { type: 'select', options: ['Yes, I love deep research', 'Sometimes', 'Not really'] },
  physical_activity: { type: 'select', options: ['Yes, I prefer active/moving work', 'No preference', 'No, I prefer desk/mental work'] },
  preferred_career_type: { type: 'select', options: ['Government / Public Sector', 'Private Company / Corporate', 'Own Business / Entrepreneurship', 'Freelance / Independent', 'Not Sure Yet'] },
  career_awareness: { type: 'select', options: ['High – I know exactly what I want', 'Medium – I have a general idea', 'Low – Still actively exploring'] },
  // aspiration
  dream_career: { type: 'text', placeholder: 'e.g., Software Engineer, Doctor, Film Director' },
  life_direction: { type: 'text', placeholder: 'e.g., Getting into IIT, starting my own startup' },
  ten_year_vision: { type: 'textarea', placeholder: 'Describe exactly where you want to be in 10 years...' },
  why_this_career: { type: 'select', options: ['Passion – I genuinely love it', 'Money – It pays very well', 'Respect / Status', 'Family Expectation', 'Impact – To change the world'] },
  what_matters_most: { type: 'select', options: ['Money & Financial Security', 'Happiness & Work-Life Balance', 'Impact & Making a Difference', 'Stability & Job Security', 'Recognition & Status'] },
  what_drives_you: { type: 'text', placeholder: 'e.g., Fear of failure, desire to prove myself, love of the subject' },
  what_stops_you: { type: 'text', placeholder: 'e.g., Lack of resources, uncertainty, family pressure' },
  goal_clarity: { type: 'select', options: ['Very clear – I know exactly what I want', 'Somewhat clear – I have a rough idea', 'Not clear – Still figuring out'] },
  steps_taken: { type: 'select', options: ['Yes, actively working towards my goal', 'Just starting out', 'No, not yet'] },
  no_constraints_vision: { type: 'textarea', placeholder: 'If money, time, and location were no barrier, what would you be doing right now?' },
  five_year_goal: { type: 'text', placeholder: 'Where specifically do you see yourself in 5 years?' },
  // financial
  family_structure: { type: 'select', options: ['Nuclear Family (parents + children)', 'Joint Family (with grandparents/relatives)', 'Single Parent Household', 'Other'] },
  income_band: { type: 'select', options: ['Below ₹3 LPA', '₹3–5 LPA', '₹5–10 LPA', '₹10–20 LPA', 'Above ₹20 LPA'] },
  father_education: { type: 'select', options: ['Below 10th Standard', '10th / SSC', '12th / HSC / Intermediate', 'Diploma / ITI', 'Graduate (B.A./B.Sc./B.Com/B.Tech)', 'Post-Graduate or higher'] },
  mother_education: { type: 'select', options: ['Below 10th Standard', '10th / SSC', '12th / HSC / Intermediate', 'Diploma / ITI', 'Graduate (B.A./B.Sc./B.Com/B.Tech)', 'Post-Graduate or higher'] },
  affordability_level: { type: 'select', options: ['Very important – Need affordable options', 'Somewhat important – Can stretch a little', 'Not a priority – Can invest in quality education'] },
  coaching_access: { type: 'select', options: ['Yes, currently in coaching institute', 'No, but considering joining', 'No, relying on self-study', 'No, using online resources'] },
};

function QuestionField({ questionKey, questionText, value, onChange }) {
  const config = QUESTION_CONFIGS[questionKey] || { type: 'text', placeholder: 'Your answer...' };

  const baseInput = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium text-slate-700 placeholder:text-slate-400 shadow-sm";

  if (config.type === 'select') {
    return (
      <select value={value || ''} onChange={e => onChange(questionKey, e.target.value)} className={baseInput}>
        <option value="">Select an option...</option>
        {config.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    );
  }
  if (config.type === 'textarea') {
    return (
      <textarea
        value={value || ''}
        onChange={e => onChange(questionKey, e.target.value)}
        placeholder={config.placeholder}
        rows={3}
        className={`${baseInput} resize-none`}
      />
    );
  }
  if (config.type === 'date') {
    return (
      <input type="date" value={value || ''} onChange={e => onChange(questionKey, e.target.value)} className={baseInput} />
    );
  }
  if (config.type === 'scale10') {
    const num = parseInt(value) || 5;
    return (
      <div className="space-y-3">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>1 — No routine at all</span>
          <span className="text-blue-600 text-sm font-extrabold">{num}/10</span>
          <span>10 — Very strict</span>
        </div>
        <input
          type="range" min="1" max="10" value={num}
          onChange={e => onChange(questionKey, e.target.value)}
          className="w-full accent-blue-500 h-2 cursor-pointer"
        />
        <div className="flex justify-between">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <span key={n} className={`text-xs font-bold ${n === num ? 'text-blue-600' : 'text-slate-300'}`}>{n}</span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(questionKey, e.target.value)}
      placeholder={config.placeholder || 'Your answer...'}
      className={baseInput}
    />
  );
}

export default function ProfileCreation() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [step, setStep] = useState(0);
  const [allQuestions, setAllQuestions] = useState({});
  const [answers, setAnswers] = useState({});
  const [loadingStep, setLoadingStep] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const currentModule = MODULES[step];

  useEffect(() => {
    loadQuestions(step);
  }, [step]);

  async function loadQuestions(stepIndex) {
    const mod = MODULES[stepIndex];
    if (allQuestions[mod.key]) return;
    setLoadingStep(true);
    try {
      const data = await getModuleQuestions(mod.key);
      const filtered = {};
      Object.entries(data.questions || {}).forEach(([k, v]) => {
        if (v !== null) filtered[k] = v;
      });
      setAllQuestions(prev => ({ ...prev, [mod.key]: filtered }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStep(false);
    }
  }

  function handleAnswer(key, val) {
    setAnswers(prev => ({ ...prev, [key]: val }));
    if (key === 'full_name' && val) {
      localStorage.setItem('harmony_profile_name', val.split(' ')[0]);
    }
  }

  async function handleNext() {
    const mod = currentModule;
    const payload = {};
    const questions = allQuestions[mod.key] || {};
    Object.keys(questions).forEach(k => { payload[k] = answers[k] || ''; });

    setSubmitting(true);
    try {
      if (user?.userId) {
        await submitAssessment({ userId: user.userId, moduleKey: mod.key, payload });
      }
    } catch (e) {
      console.error('Submit failed (continuing):', e);
    } finally {
      setSubmitting(false);
    }

    if (step < MODULES.length - 1) {
      setStep(s => s + 1);
    } else {
      localStorage.setItem('harmony_profile_done', 'true');
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-12 max-w-lg w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Profile Complete!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Amazing work, {getUserDisplayName()}! Your profile has been built. Next up — let's assess your personality and aptitude.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-lg rounded-xl shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Continue to Assessments →
          </button>
        </motion.div>
      </div>
    );
  }

  const questions = allQuestions[currentModule.key] || {};
  const Icon = currentModule.icon;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors">
          <ArrowLeft size={18} /> Dashboard
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <span className="text-lg font-extrabold text-slate-800">Build Your Profile</span>
        </div>
        <div className="text-sm font-bold text-slate-400">{step + 1} / {MODULES.length}</div>
      </div>

      {/* Step Progress */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {MODULES.map((mod, i) => {
            const ModIcon = mod.icon;
            return (
              <React.Fragment key={mod.key}>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  i === step ? `bg-gradient-to-r ${mod.color} text-white shadow-md` :
                  i < step ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
                }`}>
                  {i < step ? <CheckCircle2 size={14} /> : <ModIcon size={14} />}
                  <span className="hidden sm:inline">{mod.label}</span>
                </div>
                {i < MODULES.length - 1 && (
                  <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step Header */}
            <div className={`bg-gradient-to-r ${currentModule.color} rounded-3xl p-8 text-white mb-8 relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Icon size={30} className="text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-1">Step {step + 1} of {MODULES.length}</p>
                  <h2 className="text-2xl font-extrabold">{currentModule.label}</h2>
                  <p className="text-white/80 font-medium">{currentModule.desc}</p>
                </div>
              </div>
            </div>

            {/* Questions */}
            {loadingStep ? (
              <div className="flex items-center justify-center py-20 gap-3 text-slate-500">
                <Loader2 size={24} className="animate-spin text-blue-500" />
                <span className="font-semibold">Loading questions...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(questions).map(([key, questionText]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                  >
                    <label className="block text-sm font-bold text-slate-800 mb-3 leading-relaxed">
                      {questionText}
                    </label>
                    <QuestionField
                      questionKey={key}
                      questionText={questionText}
                      value={answers[key]}
                      onChange={handleAnswer}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Navigation */}
            {!loadingStep && (
              <div className="flex gap-4 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <ArrowLeft size={18} /> Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-lg rounded-xl shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r ${currentModule.color} text-white`}
                >
                  {submitting ? (
                    <><Loader2 size={20} className="animate-spin" /> Saving...</>
                  ) : step === MODULES.length - 1 ? (
                    <><CheckCircle2 size={20} /> Complete Profile</>
                  ) : (
                    <>Next Step <ArrowRight size={20} /></>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
