import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Heart, BookOpen, Settings, LogOut, Bell, ShieldCheck, ArrowUpRight, Sparkles, ChevronRight, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-purple-50 text-purple-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon size={20} className="mr-3 shrink-0" /> {label}
    </button>
  );
}

const RESOURCES = [
  { icon: Sparkles, label: 'AI Career Engine',    desc: 'See how AI recommends careers for your child', color: 'from-violet-500 to-purple-400', path: '/career-recommendations' },
  { icon: Target,   label: 'Career Roadmap',      desc: 'Explore the step-by-step learning roadmap',    color: 'from-blue-500 to-sky-400', path: '/roadmap' },
  { icon: BookOpen, label: 'Assessment Overview', desc: 'Understand what personality tests reveal',      color: 'from-amber-500 to-orange-400', path: '/personality-test' },
];

const TIPS = [
  { emoji: '💬', title: 'Talk about careers early', body: 'Regular conversations about future goals help students feel supported, not pressured.' },
  { emoji: '🎯', title: 'Focus on interests, not marks', body: 'The best career fit aligns with natural strengths and genuine curiosity, not just academic performance.' },
  { emoji: '💰', title: 'Plan finances proactively', body: 'Explore scholarships, education loans, and government schemes to ensure no career is out of reach.' },
];

export default function ParentDashboard() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const name = getUserDisplayName();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between fixed h-screen z-20">
        <div>
          <div className="h-20 flex items-center px-8 border-b border-slate-100 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-fuchsia-400 rounded-lg flex items-center justify-center shadow-md mr-3">
              <span className="text-white text-sm">👨‍👩‍👧</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony</span>
          </div>
          <nav className="px-4 space-y-1">
            <NavItem icon={LineChart}  label="Overview"        active />
            <NavItem icon={Target}     label="Career Path"     onClick={() => navigate('/roadmap')} />
            <NavItem icon={BookOpen}   label="Assessments"     onClick={() => navigate('/career-recommendations')} />
            <NavItem icon={Heart}      label="Wellbeing Hub"   />
            <NavItem icon={Settings}   label="Settings"        />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-slate-700 truncate">{user?.email || 'Parent'}</p>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-semibold">
            <LogOut size={20} className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hello, {name}! 👋</h1>
            <p className="text-slate-500 font-medium mt-1">Track your child's AI-powered career journey and stay informed every step of the way.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-gradient-to-br from-purple-600 to-fuchsia-500 rounded-3xl p-8 text-white shadow-lg shadow-purple-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-5 inline-block border border-white/30">
                Parent Dashboard
              </span>
              <h2 className="text-2xl font-extrabold mb-3">Support your child's career journey</h2>
              <p className="text-purple-100 font-medium max-w-md mb-6">
                Harmony's AI analyses your child's personality, aptitude, and aspirations to recommend the most suitable career paths. Explore the tools below to stay involved.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => navigate('/roadmap')}
                  className="flex items-center gap-2 px-5 py-3 bg-white text-purple-600 font-extrabold rounded-xl shadow-sm hover:scale-105 transition-all text-sm"
                >
                  <Target size={16} /> View Career Roadmap
                </button>
                <button
                  onClick={() => navigate('/career-recommendations')}
                  className="flex items-center gap-2 px-5 py-3 bg-purple-500/50 text-white font-extrabold rounded-xl border border-purple-400 hover:bg-purple-500/70 transition-all text-sm"
                >
                  <Sparkles size={16} /> See AI Career Matches
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-4 bg-sky-50 p-4 rounded-2xl border border-sky-100">
              <div className="w-11 h-11 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-md shadow-sky-500/20">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider">AI Confidence</p>
                <p className="text-2xl font-extrabold text-slate-800">High</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
              <div className="w-11 h-11 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-500/20">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Platform Status</p>
                <p className="text-2xl font-extrabold text-slate-800">Active</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Tools for Parent */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-purple-500" /> Explore Career Tools
            </h3>
            <div className="space-y-3">
              {RESOURCES.map((r, i) => {
                const RIcon = r.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(r.path)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-purple-100 hover:bg-purple-50/30 transition-colors text-left group"
                  >
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center shrink-0 shadow-sm`}>
                      <RIcon size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{r.label}</p>
                      <p className="text-sm text-slate-500 font-medium">{r.desc}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-purple-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Parenting Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2">
              <Heart size={18} className="text-rose-500" /> Parent Tips
            </h3>
            <div className="space-y-4">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{tip.emoji}</span>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{tip.title}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
