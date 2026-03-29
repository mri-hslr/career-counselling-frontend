import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Map, Video, Settings, LogOut,
  Bell, User, Brain, Zap, Sparkles, ChevronRight, CheckCircle2,
  Lock, ArrowRight, Target,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName } from '../utils/jwt';

function useProgress() {
  const profileDone   = localStorage.getItem('harmony_profile_done') === 'true';
  const personalityDone = localStorage.getItem('harmony_personality_done') === 'true';
  const aptitudeDone  = localStorage.getItem('harmony_aptitude_done') === 'true';
  const assessmentsDone = personalityDone && aptitudeDone;
  const selectedCareer = (() => {
    try { return JSON.parse(localStorage.getItem('harmony_selected_career')); } catch { return null; }
  })();
  const personalityScores = (() => {
    try { return JSON.parse(localStorage.getItem('harmony_personality_scores')); } catch { return null; }
  })();
  const aptitudeScores = (() => {
    try { return JSON.parse(localStorage.getItem('harmony_aptitude_scores')); } catch { return null; }
  })();
  return { profileDone, personalityDone, aptitudeDone, assessmentsDone, selectedCareer, personalityScores, aptitudeScores };
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon size={20} className="mr-3 shrink-0" /> {label}
    </button>
  );
}

function PhaseStep({ number, label, status, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all ${
        status === 'done'    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30' :
        status === 'active'  ? `${color} border-transparent text-white shadow-md` :
        'bg-slate-100 border-slate-200 text-slate-400'
      }`}>
        {status === 'done' ? <CheckCircle2 size={18} /> : status === 'locked' ? <Lock size={14} /> : number}
      </div>
      <span className={`text-xs font-bold text-center leading-tight w-16 ${
        status === 'done' ? 'text-emerald-600' : status === 'active' ? 'text-slate-900' : 'text-slate-400'
      }`}>{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const name = getUserDisplayName();
  const progress = useProgress();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // Determine which phase is active
  const currentPhase = !progress.profileDone ? 1
    : !progress.assessmentsDone ? 2
    : !progress.selectedCareer ? 3
    : 4;

  const overallPct = [
    progress.profileDone,
    progress.personalityDone,
    progress.aptitudeDone,
    !!progress.selectedCareer,
  ].filter(Boolean).length * 25;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-sky-400 rounded-lg flex items-center justify-center shadow-md mr-3">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony</span>
          </div>
          <nav className="px-4 space-y-1">
            <NavItem icon={LayoutDashboard} label="Dashboard" active />
            <NavItem icon={User}            label="My Profile"     onClick={() => navigate('/profile-creation')} />
            <NavItem icon={Brain}           label="Personality"    onClick={() => navigate('/personality-test')} />
            <NavItem icon={Zap}             label="Aptitude Test"  onClick={() => navigate('/aptitude-test')} />
            <NavItem icon={Sparkles}        label="Career Matches" onClick={() => navigate('/career-recommendations')} />
            <NavItem icon={Map}             label="My Roadmap"     onClick={() => navigate('/roadmap')} />
            <NavItem icon={Video}           label="Mentorship"     />
            <NavItem icon={Settings}        label="Settings"       />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-3 mb-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Journey Progress</div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${overallPct}%` }} className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1">{overallPct}% complete</div>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold">
            <LogOut size={20} className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {currentPhase === 1 && "Let's start by building your profile — it only takes 5 minutes."}
              {currentPhase === 2 && "Your profile is set. Time to complete your assessments."}
              {currentPhase === 3 && "Assessments done! Let's discover your perfect career matches."}
              {currentPhase === 4 && "Your roadmap is ready. Start your journey today! 🚀"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
              <Bell size={20} className="text-slate-600" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Journey Progress Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-slate-800">Your AI Career Journey</h2>
            <span className="text-sm font-bold text-blue-600">{overallPct}% complete</span>
          </div>
          <div className="flex items-center">
            <PhaseStep number="1" label="Build Profile"    status={progress.profileDone ? 'done' : currentPhase === 1 ? 'active' : 'locked'} color="bg-gradient-to-r from-blue-500 to-sky-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.profileDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="2" label="Assessments"      status={progress.assessmentsDone ? 'done' : currentPhase === 2 ? 'active' : 'locked'} color="bg-gradient-to-r from-violet-500 to-purple-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.assessmentsDone ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="3" label="Career Path"      status={progress.selectedCareer ? 'done' : currentPhase === 3 ? 'active' : 'locked'} color="bg-gradient-to-r from-amber-500 to-orange-400" />
            <div className={`flex-1 h-1 rounded-full mx-2 ${progress.selectedCareer ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            <PhaseStep number="4" label="My Roadmap"       status={currentPhase === 4 ? 'active' : currentPhase > 4 ? 'done' : 'locked'} color="bg-gradient-to-r from-emerald-500 to-teal-400" />
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Phase 1: Build Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`md:col-span-2 rounded-3xl p-8 relative overflow-hidden ${
              progress.profileDone
                ? 'bg-gradient-to-br from-emerald-600 to-teal-500'
                : 'bg-gradient-to-br from-blue-600 to-sky-400'
            } text-white shadow-lg`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                  {progress.profileDone ? '✅ Phase 1 — Complete' : '📋 Phase 1 — Build Your Profile'}
                </span>
                {progress.profileDone ? (
                  <>
                    <h2 className="text-2xl font-extrabold mb-2">Profile Complete</h2>
                    <p className="text-white/80 font-medium max-w-md">Your profile has been built. Your background, interests, and aspirations have been captured.</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-extrabold mb-2">Start by building your profile</h2>
                    <p className="text-blue-50 font-medium max-w-md">Answer questions about your background, academics, lifestyle, interests, aspirations, and financial situation. Takes ~5 minutes.</p>
                  </>
                )}
              </div>
              {!progress.profileDone && (
                <button
                  onClick={() => navigate('/profile-creation')}
                  className="mt-6 flex items-center gap-2 px-6 py-3.5 bg-white text-blue-600 font-extrabold rounded-2xl shadow-sm hover:scale-105 transition-all w-fit text-base"
                >
                  Build My Profile <ArrowRight size={20} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Assessment Mini Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            {/* Personality */}
            <div
              onClick={() => progress.profileDone && navigate('/personality-test')}
              className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                progress.profileDone ? 'hover:border-violet-200 hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'
              } ${progress.personalityDone ? 'border-emerald-200' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${progress.personalityDone ? 'bg-emerald-100' : 'bg-violet-100'}`}>
                  <Brain size={20} className={progress.personalityDone ? 'text-emerald-600' : 'text-violet-600'} />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-800 text-sm">Personality Test</p>
                  <p className="text-xs font-medium text-slate-400">35 questions · ~10 min</p>
                </div>
                {progress.personalityDone
                  ? <CheckCircle2 size={20} className="text-emerald-500" />
                  : !progress.profileDone ? <Lock size={16} className="text-slate-300" /> : <ChevronRight size={18} className="text-slate-300" />
                }
              </div>
              {progress.personalityDone && progress.personalityScores && (
                <div className="flex gap-1 flex-wrap">
                  {progress.personalityScores.dominant_traits.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-full font-bold">
                      {{C:'Curious',D:'Disciplined',E:'Empathetic',S:'Social',H:'Resilient'}[t] || t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Aptitude */}
            <div
              onClick={() => progress.profileDone && navigate('/aptitude-test')}
              className={`bg-white rounded-3xl border p-6 shadow-sm transition-all ${
                progress.profileDone ? 'hover:border-blue-200 hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed'
              } ${progress.aptitudeDone ? 'border-emerald-200' : 'border-slate-100'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${progress.aptitudeDone ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  <Zap size={20} className={progress.aptitudeDone ? 'text-emerald-600' : 'text-blue-600'} />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-slate-800 text-sm">Aptitude Test</p>
                  <p className="text-xs font-medium text-slate-400">15 questions · ~8 min</p>
                </div>
                {progress.aptitudeDone
                  ? <CheckCircle2 size={20} className="text-emerald-500" />
                  : !progress.profileDone ? <Lock size={16} className="text-slate-300" /> : <ChevronRight size={18} className="text-slate-300" />
                }
              </div>
              {progress.aptitudeDone && progress.aptitudeScores && (
                <div className="flex gap-2 mt-3">
                  {[['Q', progress.aptitudeScores.quantitative], ['L', progress.aptitudeScores.logical], ['V', progress.aptitudeScores.verbal]].map(([l, v]) => (
                    <div key={l} className="flex-1 bg-blue-50 rounded-xl p-2 text-center border border-blue-100">
                      <div className="text-xs font-bold text-blue-400">{l}</div>
                      <div className="text-sm font-extrabold text-blue-700">{v}%</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Phase 3: Career Path CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`rounded-3xl p-8 relative overflow-hidden shadow-sm ${
              progress.assessmentsDone
                ? progress.selectedCareer
                  ? 'bg-gradient-to-br from-emerald-600 to-teal-500 text-white'
                  : 'bg-gradient-to-br from-amber-500 to-orange-400 text-white'
                : 'bg-white border border-slate-100 text-slate-900'
            }`}
            onClick={() => progress.assessmentsDone && !progress.selectedCareer && navigate('/career-recommendations')}
            style={{ cursor: progress.assessmentsDone && !progress.selectedCareer ? 'pointer' : 'default' }}
          >
            {!progress.assessmentsDone ? (
              <div className="flex flex-col h-full">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <Lock size={24} className="text-slate-400" />
                </div>
                <h3 className="font-extrabold text-slate-800 mb-2 text-lg">AI Career Matches</h3>
                <p className="text-slate-500 text-sm font-medium">Complete both assessments to unlock your personalised career recommendations.</p>
              </div>
            ) : (
              <>
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4" />
                <div className="relative z-10">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/30">
                    {progress.selectedCareer ? '✅ Career Selected' : '✨ Phase 3 — Ready!'}
                  </span>
                  <h3 className="text-xl font-extrabold mb-2">
                    {progress.selectedCareer ? progress.selectedCareer.title : 'Discover Your Career Path'}
                  </h3>
                  <p className="text-white/80 font-medium text-sm mb-4">
                    {progress.selectedCareer
                      ? progress.selectedCareer.rationale
                      : 'AI has analysed your complete profile. Tap to see your top 5 career matches.'}
                  </p>
                  {!progress.selectedCareer && (
                    <button
                      onClick={() => navigate('/career-recommendations')}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-amber-600 font-extrabold rounded-2xl text-sm hover:scale-105 transition-all shadow-sm"
                    >
                      <Sparkles size={16} /> See My Matches
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>

          {/* Phase 4: Roadmap CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`md:col-span-2 rounded-3xl p-8 relative overflow-hidden shadow-sm ${
              progress.selectedCareer
                ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white cursor-pointer hover:shadow-xl transition-all'
                : 'bg-white border border-slate-100 text-slate-900'
            }`}
            onClick={() => progress.selectedCareer && navigate('/roadmap')}
          >
            {!progress.selectedCareer ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Lock size={24} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 mb-2 text-lg">Your Career Roadmap</h3>
                  <p className="text-slate-500 text-sm font-medium">Select a career from the AI recommendations to generate your personalised step-by-step roadmap.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block border border-white/20">
                      🗺️ Phase 4 — Roadmap Ready
                    </span>
                    <h3 className="text-2xl font-extrabold mb-2 text-white">View Your Full Roadmap</h3>
                    <p className="text-slate-400 font-medium max-w-lg">
                      Your personalised week-by-week career roadmap is ready. See every phase, milestone, and task you need to reach your goal.
                    </p>
                  </div>
                  <div className="shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg ml-4">
                    <Target size={32} className="text-white" />
                  </div>
                </div>
              </>
            )}
          </motion.div>

        </div>

        {/* Motivation Footer */}
        {overallPct === 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-blue-600 to-sky-400 rounded-3xl p-8 text-white text-center"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-2xl font-extrabold mb-2">You've completed the full journey!</h3>
            <p className="text-blue-100 font-medium">Your career roadmap is live. Start with Phase 1 and make your dream a reality.</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
