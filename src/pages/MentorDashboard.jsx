import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, BarChart2, Settings, LogOut, Bell, Video, Star, BookOpen, Map, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, getUserDisplayName } from '../utils/jwt';

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon size={20} className="mr-3 shrink-0" /> {label}
    </button>
  );
}

const MOCK_STUDENTS = [
  { name: 'Arjun Sharma', grade: '11th', career: 'Software Engineer', progress: 72, avatar: 'AS' },
  { name: 'Priya Mehta', grade: '12th', career: 'Data Scientist', progress: 55, avatar: 'PM' },
  { name: 'Rahul Verma', grade: '10th', career: 'UI/UX Designer', progress: 40, avatar: 'RV' },
];

const MENTOR_TOOLS = [
  { icon: Map,      label: 'Career Roadmap Explorer', desc: 'Browse career paths to guide your students', color: 'from-blue-500 to-sky-400', path: '/roadmap' },
  { icon: Sparkles, label: 'AI Career Engine',         desc: 'See how our AI analyses student profiles',   color: 'from-violet-500 to-purple-400', path: '/career-recommendations' },
  { icon: BookOpen, label: 'Assessment Library',       desc: 'Preview personality and aptitude tests',      color: 'from-amber-500 to-orange-400', path: '/personality-test' },
];

export default function MentorDashboard() {
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
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-lg flex items-center justify-center shadow-md mr-3">
              <span className="text-white text-sm">💼</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-800">Harmony Pro</span>
          </div>
          <nav className="px-4 space-y-1">
            <NavItem icon={Calendar}  label="Dashboard"      active />
            <NavItem icon={Users}     label="My Students"    />
            <NavItem icon={Map}       label="Career Tools"   onClick={() => navigate('/roadmap')} />
            <NavItem icon={BarChart2} label="Impact Metrics" />
            <NavItem icon={Settings}  label="Settings"       />
          </nav>
        </div>
        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-bold text-slate-700 truncate">{user?.email || 'Mentor'}</p>
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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome, {name}! 👋</h1>
            <p className="text-slate-500 font-medium mt-1">You have {MOCK_STUDENTS.length} active students on their career journeys.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-white border border-slate-200 rounded-full hover:bg-slate-50 shadow-sm">
              <Bell size={20} className="text-slate-600" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border-2 border-white shadow-sm flex items-center justify-center text-white font-extrabold text-sm">
              {name[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Hero Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-400 rounded-3xl p-8 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider mb-5 inline-block border border-white/30">
                Mentor Dashboard
              </span>
              <h2 className="text-2xl font-extrabold mb-2">Guide students to their dream careers</h2>
              <p className="text-emerald-50 font-medium max-w-md mb-6">
                Use the AI-powered career tools to understand each student's profile, strengths, and ideal career paths — then tailor your mentorship accordingly.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-5 py-3 bg-white text-emerald-600 font-extrabold rounded-xl shadow-sm hover:scale-105 transition-all text-sm">
                  <Video size={16} /> Schedule Session
                </button>
                <button className="flex items-center gap-2 px-5 py-3 bg-emerald-500/50 text-white font-extrabold rounded-xl border border-emerald-400 hover:bg-emerald-500/70 transition-all text-sm">
                  <Users size={16} /> View All Students
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-2xl border border-yellow-100">
              <div className="w-11 h-11 bg-yellow-500 text-white rounded-full flex items-center justify-center shadow-md shadow-yellow-500/20">
                <Star size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Rating</p>
                <p className="text-2xl font-extrabold text-slate-800">4.9/5.0</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <div className="w-11 h-11 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-500/20">
                <Users size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Active Students</p>
                <p className="text-2xl font-extrabold text-slate-800">{MOCK_STUDENTS.length}</p>
              </div>
            </div>
          </motion.div>

          {/* Student Progress List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="md:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2"><Users size={18} className="text-emerald-500" /> My Students</h3>
              <button className="text-sm font-bold text-emerald-600 hover:underline">View All</button>
            </div>
            <div className="space-y-4">
              {MOCK_STUDENTS.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition-colors group cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-slate-800 text-sm">{s.name}</p>
                      <span className="text-xs text-slate-400 font-medium">{s.grade}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mb-1.5">Target: {s.career}</p>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-600 shrink-0">{s.progress}%</span>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Mentor Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <h3 className="text-lg font-extrabold text-slate-800 mb-5 flex items-center gap-2"><Sparkles size={18} className="text-blue-500" /> Career Tools</h3>
            <div className="space-y-3">
              {MENTOR_TOOLS.map((tool, i) => {
                const ToolIcon = tool.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(tool.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0`}>
                      <ToolIcon size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{tool.label}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{tool.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
