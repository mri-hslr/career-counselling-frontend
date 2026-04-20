import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toISTTime, toISTDate, toISTDateTime, nowIST } from '../utils/time';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, BarChart2, LogOut, Bell, Star, CheckCircle2,
  Loader2, AlertCircle, Clock, ClipboardList, UserCheck,
  MessageSquare, StopCircle, X, Wifi, WifiOff, Info,
  Check, Users, Send, PhoneCall, Trash2, Map, Radio
} from 'lucide-react';
import VideoCallRoom from '../components/VideoCallRoom';
import { useNavigate } from 'react-router-dom';
import { getUserDisplayName, clearUserSession, setUserFullName } from '../utils/jwt';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { chatApi } from '../services/api/chatApi';
import { roadmapApi } from '../services/api/roadmapApi';
import LanguageSelector from '../components/LanguageSelector';
// ── SHARED UI ─────────────────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-semibold text-left ${
        active ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
      }`}
    >
      <Icon size={20} className="mr-3 shrink-0" />
      <span className="truncate flex-1">{label}</span>
      {badge > 0 && (
        <span className="ml-2 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {active && !badge && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
    </button>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
      exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
      className={`fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm min-w-[300px] border ${
        type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-red-600 text-white border-red-500'
      }`}
    >
      {type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X size={18} /></button>
    </motion.div>
  );
}

// ── CHAT INTERFACE ────────────────────────────────────────────────────────────

function ChatInterface({ session, onClose, onSessionEnded }) {
  const name     = getUserDisplayName();
  const token    = localStorage.getItem('token');
  const HTTP_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const WS_BASE  = HTTP_BASE.replace(/^http/, 'ws');
  const wsUrl    = `${WS_BASE}/api/v1/mentorship/chat/${session.other_user_id}/?token=${token}`;

  const [wsState,  setWsState]  = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const wsRef      = useRef(null);
  const scrollRef  = useRef(null);
  const pendingSent = useRef(new Set());

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.addEventListener('open', () => setWsState('open'));
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'ERROR') {
          setWsState(data.message?.toLowerCase().includes('locked') ? 'locked' : 'error');
          setErrorMsg(data.message);
          return;
        }
        if (data.event === 'NEW_MESSAGE') {
          if (pendingSent.current.has(data.message)) {
            pendingSent.current.delete(data.message);
            return;
          }
          setMessages(prev => [...prev, { sender: data.sender, text: data.message, timestamp: data.timestamp, isMe: false }]);
        }
        if (data.event === 'SESSION_ENDED') {
          setMessages(prev => [...prev, { system: true, text: '✅ Session concluded. Please submit your feedback.' }]);
          setWsState('ended');
          setTimeout(() => onSessionEnded?.(session.session_id), 2500);
        }
      } catch { /* non-JSON */ }
    };
    ws.onclose = () => setWsState(p => p === 'connecting' ? 'error' : p === 'open' ? 'closed' : p);
    ws.onerror = () => { setWsState('error'); setErrorMsg('Could not connect. Please try again.'); };
    return () => ws.close();
  }, [wsUrl]); // eslint-disable-line

  const sendMessage = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ message: text }));
    pendingSent.current.add(text);
    setMessages(prev => [...prev, {
      sender: name,
      text,
      timestamp: new Date().toISOString(),
      isMe: true,
    }]);
    setInput('');
  };

  if (wsState === 'connecting') return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md"
    >
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-[32px] p-12 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="font-black text-slate-800 text-lg">Joining Session</p>
          <p className="text-slate-400 text-sm mt-1">Connecting with <span className="font-bold text-slate-600">{session.other_party_name}</span>...</p>
        </div>
        <button onClick={onClose} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cancel</button>
      </motion.div>
    </motion.div>
  );

  if (wsState === 'locked' || wsState === 'error') {
    const isLocked = wsState === 'locked';
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-md"
      >
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="bg-white rounded-[32px] p-10 flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4 text-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isLocked ? 'bg-amber-50' : 'bg-red-50'}`}>
            {isLocked ? <Clock size={36} className="text-amber-500" /> : <WifiOff size={36} className="text-red-400" />}
          </div>
          <div>
            <p className="font-black text-slate-800 text-lg mb-2">{isLocked ? 'Room Not Open Yet' : 'Connection Failed'}</p>
            <p className="text-slate-500 text-sm leading-relaxed">
              {errorMsg || (isLocked ? 'This room opens 2 minutes before the session.' : 'Check your connection and try again.')}
            </p>
          </div>
          <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all">Close</button>
        </motion.div>
      </motion.div>
    );
  }

  const isInputDisabled = wsState === 'ended' || wsState === 'closed';
  const statusConfig = ({
    open:   { icon: <Wifi size={12} />,         label: 'Live',         cls: 'bg-emerald-500/20 text-emerald-300' },
    ended:  { icon: <CheckCircle2 size={12} />, label: 'Ended',        cls: 'bg-slate-500/20 text-slate-300' },
    closed: { icon: <WifiOff size={12} />,      label: 'Disconnected', cls: 'bg-red-500/20 text-red-300' },
  })[wsState] ?? { icon: <Loader2 size={12} className="animate-spin" />, label: 'Connecting', cls: 'bg-yellow-500/20 text-yellow-300' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
    >
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
        style={{ height: '620px' }}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-emerald-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
              {session.other_party_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-black text-white text-base">{session.other_party_name}</p>
              <p className="text-xs text-slate-400">{toISTDateTime(session.scheduled_at)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black ${statusConfig.cls}`}>
              {statusConfig.icon} {statusConfig.label.toUpperCase()}
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/60">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <MessageSquare size={40} className="opacity-20" />
              <p className="font-bold text-sm">Session is live — say hello!</p>
            </div>
          )}
          {messages.map((msg, i) => msg.system ? (
            <div key={i} className="flex justify-center">
              <span className="text-xs font-bold px-4 py-2 bg-slate-200 text-slate-500 rounded-full">{msg.text}</span>
            </div>
          ) : (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm font-medium shadow-sm ${
                msg.isMe ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-bl-sm'
              }`}>
                {!msg.isMe && <p className="text-[10px] font-black text-emerald-600 mb-1 uppercase tracking-widest">{msg.sender}</p>}
                <p className="leading-relaxed">{msg.text}</p>
                {msg.timestamp && (
                  <p className="text-[10px] mt-1.5 text-slate-400">
                    {toISTTime(msg.timestamp)}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>

        <div className="px-5 py-4 bg-white border-t border-slate-100 shrink-0">
          {isInputDisabled ? (
            <p className="text-center text-sm font-bold text-slate-400 py-2">
              {wsState === 'ended' ? 'Session has ended. Thank you!' : 'Connection lost. Please refresh.'}
            </p>
          ) : (
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                placeholder="Type a message..."
                className="flex-1 bg-slate-100 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" disabled={!input.trim()}
                className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 shadow-lg active:scale-95 shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── OVERVIEW TAB ──────────────────────────────────────────────────────────────

function OverviewTab({ profileData, connectionCount, onTabChange }) {
  const name = profileData?.full_name || getUserDisplayName();

  const stats = [
    { label: 'Active Students', value: connectionCount, icon: Users, color: 'emerald' },
    { label: 'Rating',          value: profileData?.rating || '—', icon: Star, color: 'amber' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <span className="px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block border border-white/20">
            {profileData?.is_verified ? '⚡ Verified Expert' : profileData ? '⏳ Verification Pending' : '⚠️ Action Required'}
          </span>
          <h2 className="text-4xl font-black mb-2 leading-tight">
            Welcome back, {name} 👋
          </h2>
          <p className="text-slate-300 font-medium max-w-xl text-base leading-relaxed mb-6">
            {profileData?.is_verified
              ? 'Your broadcast studio is ready. Go live to connect with your students.'
              : profileData
              ? 'Your application is under review. You will be notified once approved.'
              : 'Complete your profile to start building your audience.'}
          </p>

          {/* Quick profile details */}
          {profileData && (
            <div className="flex flex-wrap gap-4">
              {profileData.expertise && (
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold border border-white/10">
                  🎯 {profileData.expertise.split(',')[0].trim()}
                </div>
              )}
              {profileData.years_experience > 0 && (
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold border border-white/10">
                  🏆 {profileData.years_experience} yrs experience
                </div>
              )}
              {profileData.bio && (
                <div className="px-4 py-2 bg-white/10 rounded-xl text-sm font-bold border border-white/10 max-w-xs truncate">
                  💬 {profileData.bio.substring(0, 40)}{profileData.bio.length > 40 ? '...' : ''}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            onClick={() => label === 'Active Students' && onTabChange('connections')}
            className={`bg-white rounded-[2rem] p-7 border border-slate-100 shadow-lg flex items-center gap-5 ${
              label === 'Active Students' ? 'cursor-pointer hover:border-emerald-200' : ''
            }`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner relative ${
              color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Icon size={26} fill={color === 'amber' ? 'currentColor' : 'none'} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</p>
              <p className="text-3xl font-black text-slate-800">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── SESSIONS TAB (THE BROADCAST HUB) ──────────────────────────────────────────

function useCountdown(secondsInit) {
  const [secs, setSecs] = useState(secondsInit);
  useEffect(() => { setSecs(secondsInit); }, [secondsInit]);
  useEffect(() => {
    if (secs <= -3600) return;
    const t = setInterval(() => setSecs(p => p - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);
  if (secs <= 0) return { display: 'Live Now', isLive: true };
  const h = Math.floor(secs / 3600), m = Math.floor((secs % 3600) / 60), s = secs % 60;
  return { display: `${h > 0 ? h + 'h ' : ''}${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`, isLive: secs <= 300 };
}

function SessionCard({ session, onEnd, endingId, onJoinVideo, joiningVideoId }) {
  const { display, isLive } = useCountdown(session.seconds_until_start);
  const liveStatus = session.is_live || isLive;

  return (
    <motion.div layout className={`group flex items-center gap-6 p-6 rounded-[2rem] border transition-all ${
      liveStatus ? 'bg-emerald-50 border-emerald-200 ring-4 ring-emerald-500/5' : 'bg-white border-slate-100 hover:border-slate-200'
    }`}>
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
        liveStatus ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 animate-pulse' : 'bg-slate-100 text-slate-400'
      }`}>
        <Radio size={28} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-black text-slate-800 text-lg truncate">Broadcast to Connected Students</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
          <span className="flex items-center gap-1.5"><Clock size={14} />{toISTTime(session.scheduled_at)}</span>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span>{toISTDate(session.scheduled_at)}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {liveStatus ? (
          <>
            <button onClick={() => onJoinVideo(session)} disabled={joiningVideoId === session.session_id}
              className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-200 disabled:opacity-50 active:scale-95"
            >
              {joiningVideoId === session.session_id ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />} 
              {joiningVideoId === session.session_id ? 'JOINING...' : 'ENTER STUDIO'}
            </button>
            <button onClick={() => onEnd(session.session_id)} disabled={endingId === session.session_id}
              className="px-4 py-2.5 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 flex items-center gap-2 shadow-lg shadow-red-200 disabled:opacity-50 active:scale-95"
            >
              {endingId === session.session_id ? <Loader2 size={14} className="animate-spin" /> : <StopCircle size={14} />} END
            </button>
          </>
        ) : (
          <div className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 text-xs font-black tabular-nums">Starts in {display}</div>
        )}
      </div>
    </motion.div>
  );
}

function SessionsTab({ toast, profileData }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [endingId, setEndingId] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null); // { token, meeting_id }
  const [joiningVideoId, setJoiningVideoId] = useState(null);
  
  // Broadcast Modal State
  const [showModal, setShowModal] = useState(false);
  const [bTopic, setBTopic] = useState('');
  const [bDelay, setBDelay] = useState(0);
  const [bLoading, setBLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try { setSessions((await mentorshipApi.getUpcomingSessions()) || []); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleJoinVideo = useCallback(async (session) => {
    setJoiningVideoId(session.session_id);
    try {
      const data = await mentorshipApi.joinVideo(session.session_id);
      setActiveVideo({ token: data.token, meeting_id: data.meeting_id });
    } catch (err) { toast(err.message || 'Could not join video call.', 'error'); } 
    finally { setJoiningVideoId(null); }
  }, [toast]);

  const handleEnd = async (id) => {
    setEndingId(id);
    try {
      await mentorshipApi.endSession(id);
      setSessions(prev => prev.filter(s => s.session_id !== id));
      toast('Session ended successfully.', 'success');
    } catch (err) { toast(err.message || 'Error ending session', 'error'); }
    finally { setEndingId(null); }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBLoading(true);
    try {
      await mentorshipApi.broadcastSession(Number(bDelay), bTopic || "Open Mentorship Session");
      toast('Broadcast scheduled successfully!', 'success');
      setShowModal(false);
      setBTopic('');
      fetchSessions();
    } catch (err) { toast(err.message || 'Failed to schedule broadcast', 'error'); }
    finally { setBLoading(false); }
  };

  return (
    <>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800">Broadcast Studio</h3>
            <p className="text-slate-500 font-bold">Go live and interact with your connected students</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            disabled={!profileData?.is_verified}
            className="px-6 py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Radio size={18} /> GO LIVE
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200"><Radio size={40} /></div>
            <h4 className="text-xl font-black text-slate-800 mb-2">No Active Broadcasts</h4>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">Click "Go Live" to instantly open a room for your students.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {sessions.map(s => (
                <SessionCard key={s.session_id} session={s} onEnd={handleEnd} endingId={endingId} onJoinVideo={handleJoinVideo} joiningVideoId={joiningVideoId} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl"
            >
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Radio size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">Schedule Broadcast</h2>
              <p className="text-slate-500 font-medium mb-6">Notify your students and open a video room.</p>
              
              <form onSubmit={handleBroadcast} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Topic (Optional)</label>
                  <input value={bTopic} onChange={e => setBTopic(e.target.value)} placeholder="e.g. Q&A, Roadmap Review"
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">When</label>
                  <select value={bDelay} onChange={e => setBDelay(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none font-bold text-slate-800 appearance-none"
                  >
                    <option value={0}>Instant (Go Live Now)</option>
                    <option value={5}>In 5 Minutes</option>
                    <option value={15}>In 15 Minutes</option>
                    <option value={60}>In 1 Hour</option>
                  </select>
                </div>
                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={bLoading} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-emerald-200 flex justify-center items-center gap-2 transition-colors disabled:opacity-50">
                    {bLoading ? <Loader2 size={18} className="animate-spin" /> : <Radio size={18} />} START
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dyte video call */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Radio size={16} className="text-emerald-400 animate-pulse" />
                <span className="font-bold text-sm">Live Broadcast</span>
              </div>
              <button onClick={() => setActiveVideo(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors">
                <X size={14} /> Leave Studio
              </button>
            </div>
            <div className="flex-1"><VideoCallRoom authToken={activeVideo.token} /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── DIRECT MESSAGES TAB (24h ephemeral) ──────────────────────────────────────

function DirectMessagesTab({ toast }) {
  const [contacts,        setContacts]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [activeChat,      setActiveChat]      = useState(null); // { user_id, full_name }
  const [messages,        setMessages]        = useState([]);
  const [msgLoading,      setMsgLoading]      = useState(false);
  const [input,           setInput]           = useState('');
  const [confirmDelete,  setConfirmDelete]  = useState(null); // contact to delete
  const [deleting,        setDeleting]        = useState(false);
  const [roadmapView,    setRoadmapView]    = useState(null); // { contact, data } or null
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const wsRef        = useRef(null);
  const scrollRef    = useRef(null);
  const pendingSent = useRef(new Set());
  const token        = localStorage.getItem('token');
  const HTTP_BASE    = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const WS_BASE      = HTTP_BASE.replace(/^http/, 'ws');

  useEffect(() => {
    chatApi.getConnections()
      .then(data => setContacts(Array.isArray(data) ? data : []))
      .catch(() => toast('Failed to load connections.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const openChat = useCallback(async (contact) => {
    setActiveChat(contact);
    setMsgLoading(true);
    // Load 24h history
    try {
      const history = await chatApi.getMessages(contact.user_id);
      setMessages(history || []);
    } catch { setMessages([]); }
    finally { setMsgLoading(false); }

    // Open WebSocket
    if (wsRef.current) wsRef.current.close();
    const ws = new WebSocket(`${WS_BASE}/api/v1/mentorship/chat/${contact.user_id}/?token=${token}`);
    wsRef.current = ws;
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'NEW_MESSAGE') {
          // Suppress our own message echo from the broadcast
          if (pendingSent.current.has(data.message)) {
            pendingSent.current.delete(data.message);
            return;
          }
          setMessages(prev => [...prev, {
            id: Date.now(), message: data.message,
            sent_at: data.timestamp, is_me: false, sender: data.sender,
          }]);
        }
        if (data.event === 'ERROR') toast(data.message, 'error');
      } catch {}
    };
  }, [token, WS_BASE, toast]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { return () => wsRef.current?.close(); }, []);

  const sendMessage = (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || wsRef.current?.readyState !== WebSocket.OPEN) return;
    pendingSent.current.add(text);
    wsRef.current.send(JSON.stringify({ message: text }));
    setMessages(prev => [...prev, { id: Date.now(), message: text, sent_at: new Date().toISOString(), is_me: true }]);
    setInput('');
  };

  const handleDeleteConnection = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await chatApi.deleteConnection(confirmDelete.user_id);
      setContacts(prev => prev.filter(c => c.user_id !== confirmDelete.user_id));
      if (activeChat?.user_id === confirmDelete.user_id) {
        setActiveChat(null);
        setMessages([]);
        wsRef.current?.close();
      }
      toast(`Disconnected from ${confirmDelete.full_name}.`, 'success');
      setConfirmDelete(null);
    } catch (err) {
      toast(err.message || 'Failed to delete connection.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewRoadmap = async (contact) => {
    setRoadmapLoading(true);
    try {
      const data = await roadmapApi.getStudentRoadmap(contact.user_id);
      setRoadmapView({ contact, data });
    } catch (err) {
      toast(err.message || 'Could not load roadmap.', 'error');
    } finally {
      setRoadmapLoading(false);
    }
  };

  return (
    <>
    <div className="max-w-4xl flex gap-5 h-[600px]">
      {/* Sidebar — contact list */}
      <div className="w-64 shrink-0 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-sm">Connections</h3>
          <p className="text-xs text-slate-400 mt-0.5">Messages vanish after 24 h</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-400" /></div>
          ) : contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
              <Users size={28} className="text-slate-300" />
              <p className="text-xs text-slate-400 font-medium">No accepted connections yet.</p>
            </div>
          ) : (
            contacts.map(c => (
              <div key={c.user_id}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all ${
                  activeChat?.user_id === c.user_id
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <button onClick={() => openChat(c)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs shrink-0">
                    {c.full_name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-bold text-slate-700 truncate">{c.full_name}</span>
                </button>
                <button
                  onClick={() => handleViewRoadmap(c)}
                  disabled={roadmapLoading}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all shrink-0"
                  title="View roadmap"
                >
                  {roadmapLoading ? <Loader2 size={13} className="animate-spin" /> : <Map size={13} />}
                </button>
                <button
                  onClick={() => setConfirmDelete(c)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                  title="Remove connection"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main pane — chat */}
      <div className="flex-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {!activeChat ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
            <MessageSquare size={40} className="opacity-20" />
            <p className="font-bold text-sm">Select a contact to start chatting</p>
            <p className="text-xs opacity-70">Messages are ephemeral — 24h window</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm">
                {activeChat.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-black text-slate-800 text-sm">{activeChat.full_name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last 24 hours · Ephemeral</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {msgLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-emerald-400" /></div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                  <MessageSquare size={28} className="opacity-20" />
                  <p className="text-sm font-bold">No messages in the last 24 hours</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={msg.id || i} className={`flex ${msg.is_me ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium ${
                      msg.is_me ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}>
                      <p>{msg.message}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_me ? 'text-slate-400' : 'text-slate-400'}`}>
                        {toISTTime(msg.sent_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="px-5 py-4 border-t border-slate-100">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button type="submit" disabled={!input.trim()}
                  className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 active:scale-95 shrink-0"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>

    {/* Delete confirmation modal */}
    <AnimatePresence>
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setConfirmDelete(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl"
          >
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="font-extrabold text-slate-800 text-center text-base mb-1">Remove Connection?</h3>
            <p className="text-xs text-slate-500 text-center mb-5">
              This will permanently sever your connection with <span className="font-bold text-slate-700">{confirmDelete.full_name}</span> and delete all chat history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConnection}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Roadmap modal */}
    <AnimatePresence>
      {roadmapView && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setRoadmapView(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Career Roadmap</p>
                  <h2 className="text-xl font-black">{roadmapView.contact.full_name}</h2>
                  <p className="text-sm opacity-80 mt-0.5">{roadmapView.data.title}</p>
                </div>
                <button onClick={() => setRoadmapView(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                  <X size={15} />
                </button>
              </div>
              {/* Overall progress */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold opacity-80 mb-1">
                  <span>Overall Progress</span>
                  <span>{Math.round(roadmapView.data.progress_percentage ?? 0)}%</span>
                </div>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-700"
                    style={{ width: `${roadmapView.data.progress_percentage ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
            {/* Phases */}
            <div className="p-5 space-y-3 max-h-72 overflow-y-auto">
              {(roadmapView.data.phases || []).map((phase, i) => {
                const pct = Math.round(phase.progress_percentage ?? 0);
                const statusColor = phase.status === 'Completed' ? 'text-emerald-600' : phase.status === 'Active' ? 'text-blue-600' : 'text-slate-400';
                return (
                  <div key={phase.id || i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black shrink-0">{i + 1}</span>
                        <p className="font-bold text-slate-800 text-sm truncate">{phase.title}</p>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-wider ${statusColor}`}>{phase.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-500 shrink-0">{pct}%</span>
                    </div>
                  </div>
                );
              })}
              {(roadmapView.data.phases || []).length === 0 && (
                <p className="text-center text-slate-400 text-sm py-8">No phases found.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}

// ── CONNECTIONS TAB ───────────────────────────────────────────────────────────

function ConnectionsTab({ toast, onCountChange }) {
  const [requests,    setRequests]   = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [actionId,    setActionId]   = useState(null);
  const [viewProfile, setViewProfile] = useState(null); // { studentId, data }
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      const data = (await mentorshipApi.getPendingConnectionRequests()) || [];
      setRequests(data);
      onCountChange?.(data.length);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [onCountChange]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleAccept = async (id) => {
    setActionId(id);
    try {
      await mentorshipApi.acceptConnectionRequest(id);
      toast('Connection accepted! Chat is now enabled.', 'success');
      fetchRequests();
    } catch (err) { toast(err.message || 'Failed to accept', 'error'); }
    finally { setActionId(null); }
  };

  const handleReject = async (id) => {
    setActionId(id + '_reject');
    try {
      await mentorshipApi.rejectConnectionRequest(id);
      toast('Request declined.', 'success');
      fetchRequests();
    } catch (err) { toast(err.message || 'Failed to reject', 'error'); }
    finally { setActionId(null); }
  };

  const handleViewProfile = async (studentId) => {
    setProfileLoading(true);
    try {
      const data = await mentorshipApi.getStudentProfile(studentId);
      setViewProfile({ studentId, data });
    } catch (err) { toast(err.message || 'Could not load profile', 'error'); }
    finally { setProfileLoading(false); }
  };

  const scoreValue = (obj, keys) => {
    if (!obj) return '—';
    for (const k of keys) {
      if (obj[k] !== undefined) return obj[k];
    }
    return '—';
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800">Incoming Connections</h3>
        <p className="text-slate-500 font-bold">Students who want to connect with you — review their profile before accepting</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-emerald-500" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-12 text-center border border-slate-100">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-400 font-bold">No pending connection requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <motion.div layout key={r.request_id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg shrink-0">
                  {r.student_name?.[0] || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-800 text-lg">{r.student_name || 'Student'}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {r.message && (
                    <div className="mt-2 bg-slate-50 p-3 rounded-xl text-xs font-medium text-slate-600 border border-slate-100 italic">
                      "{r.message}"
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleViewProfile(r.student_id)}
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  {profileLoading ? <Loader2 size={13} className="animate-spin" /> : <Info size={13} />}
                  VIEW PROFILE
                </button>
                <button
                  onClick={() => handleAccept(r.request_id)}
                  disabled={actionId === r.request_id}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                  {actionId === r.request_id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  ACCEPT
                </button>
                <button
                  onClick={() => handleReject(r.request_id)}
                  disabled={actionId === r.request_id + '_reject'}
                  className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                >
                  {actionId === r.request_id + '_reject' ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  DECLINE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Student Profile Modal */}
      <AnimatePresence>
        {viewProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setViewProfile(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div initial={{ scale: 0.92, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Student Snapshot</p>
                    <h2 className="text-xl font-black">{viewProfile.data?.full_name || 'Student'}</h2>
                  </div>
                  <button onClick={() => setViewProfile(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Aptitude Scores */}
                {(() => {
                  const ad = viewProfile.data?.apti_data;
                  let q = 0, l = 0, v = 0, max = 5;
                  if (ad?.scores) {
                    const s = ad.scores; max = s.max_score ?? 5;
                    const norm = n => ((n ?? 0) > max ? Math.round(((n ?? 0) / 100) * max) : (n ?? 0));
                    q = norm(s.quantitative); l = norm(s.logical); v = norm(s.verbal);
                  } else if (ad?.quantitative_aptitude || ad?.logical_reasoning || ad?.verbal_ability) {
                    max = Math.max(ad.quantitative_aptitude?.total ?? 15, ad.logical_reasoning?.total ?? 15, ad.verbal_ability?.total ?? 15);
                    q = ad.quantitative_aptitude?.score ?? 0; l = ad.logical_reasoning?.score ?? 0; v = ad.verbal_ability?.score ?? 0;
                  }
                  const hasData = q > 0 || l > 0 || v > 0;
                  return (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Aptitude Scores</p>
                      {hasData ? (
                        <div className="space-y-2">
                          {[['Quantitative', q], ['Logical', l], ['Verbal', v]].map(([label, val]) => (
                            <div key={label}>
                              <div className="flex justify-between text-xs font-bold mb-0.5">
                                <span className="text-slate-600">{label}</span>
                                <span className="text-slate-800">{val}/{max}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${max > 0 ? (val / max) * 100 : 0}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-slate-400 italic">Test not yet completed</p>}
                    </div>
                  );
                })()}
                {/* Personality Type */}
                {(() => {
                  const traits = viewProfile.data?.personality_data?.dominant_traits ?? [];
                  return (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Personality Type</p>
                      {traits.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {traits.slice(0, 4).map((t, i) => (
                            <span key={i} className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full border border-violet-200">{t}</span>
                          ))}
                        </div>
                      ) : <p className="text-xs text-slate-400 italic">Test not yet completed</p>}
                    </div>
                  );
                })()}
                {/* Dream Career */}
                {(() => {
                  const career = viewProfile.data?.aspiration_data?.dream_career;
                  const motivation = viewProfile.data?.aspiration_data?.why_this_career;
                  return (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dream Career</p>
                      {career ? (
                        <>
                          <p className="font-black text-slate-800 text-base">{career}</p>
                          {motivation && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{motivation}</p>}
                        </>
                      ) : <p className="text-xs text-slate-400 italic">Profile not yet completed</p>}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── PROFILE TAB ───────────────────────────────────────────────────────────────

function ProfileTab({ profileData, onProfileCreated, toast }) {
  const [form, setForm] = useState({
    expertise: profileData?.expertise || '', bio: profileData?.bio || '', years_experience: profileData?.years_experience || 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profileData) setForm({ expertise: profileData.expertise || '', bio: profileData.bio || '', years_experience: profileData.years_experience || 0 });
  }, [profileData]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await mentorshipApi.upsertMentorProfile(form);
      const fresh = await mentorshipApi.getMentorProfile();
      if (fresh?.full_name) setUserFullName(fresh.full_name);
      onProfileCreated(fresh);
      toast('Profile updated and saved!', 'success');
    } catch (err) { toast(err.message || 'Failed to save', 'error'); }
    finally { setLoading(false); }
  };

  const fieldCls = "w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-800";

  return (
    <div className="max-w-2xl">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl"
      >
        <div className="mb-8">
          <h3 className="text-2xl font-black text-slate-800">Mentor Profile</h3>
          <p className="text-slate-500 font-bold">Visible to students looking for guidance</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Core Expertise', key: 'expertise', type: 'text', placeholder: 'e.g. Full Stack Development, UI/UX Design' },
            { label: 'Years of Experience', key: 'years_experience', type: 'number', placeholder: '5' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">{label}</label>
              <input type={type} required min={type === 'number' ? 0 : undefined} value={form[key]} placeholder={placeholder}
                onChange={e => setForm({ ...form, [key]: type === 'number' ? parseInt(e.target.value) || 0 : e.target.value })}
                className={fieldCls}
              />
            </div>
          ))}
          <div className="space-y-2">
            <label className="text-sm font-black text-slate-700 uppercase tracking-widest ml-1">Professional Bio</label>
            <textarea rows={4} required value={form.bio} placeholder="Briefly describe your career journey..."
              onChange={e => setForm({ ...form, bio: e.target.value })} className={`${fieldCls} resize-none`}
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : <UserCheck size={24} />}
            SAVE PROFILE SETTINGS
          </button>
        </form>
        {profileData && !profileData.is_verified && (
          <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-amber-700">Your profile is under review. Once verified, you can set availability and receive bookings.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── FEEDBACK TAB ──────────────────────────────────────────────────────────────

function FeedbackTab() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-800">Session Feedback</h3>
        <p className="text-slate-500 font-bold">Provide insights on student progress and behaviour</p>
      </div>
      <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-sm">
        <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
        <h4 className="text-xl font-black text-slate-800 mb-2">No Feedback Pending</h4>
        <p className="text-slate-500 font-medium">After a session ends, submit feedback here to help parents track progress.</p>
      </div>
    </div>
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',    label: 'Overview',         icon: BarChart2 },
  { id: 'sessions',    label: 'Broadcast Studio', icon: Radio },
  { id: 'messages',    label: 'Messages',         icon: MessageSquare },
  { id: 'connections', label: 'My Audience',      icon: Users },
  { id: 'profile',     label: 'My Profile',       icon: UserCheck },
  { id: 'feedback',    label: 'Session Feedback', icon: ClipboardList },
];

export default function MentorDashboard() {
  const navigate      = useNavigate();
  const name          = getUserDisplayName();
  const [activeTab,   setActiveTab]   = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [toast,       setToast]       = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);

  const fetchCoreData = useCallback(async () => {
    try {
      const profile = await mentorshipApi.getMentorProfile();
      if (profile) {
        if (profile.full_name) setUserFullName(profile.full_name);
        setProfileData(profile);
        localStorage.setItem('harmony_mentor_profile', JSON.stringify(profile));
      }
    } catch (err) { console.error('Dashboard bootstrap:', err); }
    finally { setLoading(false); }
  }, []);

  const fetchConnectionCount = useCallback(async () => {
    try {
      const conn = await mentorshipApi.getPendingConnectionRequests();
      setConnectionCount((conn || []).length);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'mentor') { navigate(role === 'parent' ? '/parent-dashboard' : '/dashboard'); return; }
    fetchCoreData();
    fetchConnectionCount();
  }, [navigate, fetchCoreData, fetchConnectionCount]);

  const showToast = useCallback((msg, type) => setToast({ message: msg, type }), []);
  const handleProfileSaved = useCallback(async (freshProfile) => {
    if (!freshProfile) return fetchCoreData();
    if (freshProfile.full_name) setUserFullName(freshProfile.full_name);
    setProfileData(freshProfile);
    localStorage.setItem('harmony_mentor_profile', JSON.stringify(freshProfile));
  }, [fetchCoreData]);

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-emerald-600">H</span>
        </div>
      </div>
      <p className="mt-6 text-slate-400 font-black tracking-widest text-xs uppercase animate-pulse">Establishing Secure Session...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col justify-between fixed h-screen z-50">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <span className="text-white font-black text-lg">H</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-800">HARMONY<span className="text-emerald-600">.</span></span>
          </div>
          <nav className="space-y-2">
            {TABS.map(tab => (
              <NavItem 
                key={tab.id} 
                icon={tab.icon} 
                label={tab.label} 
                active={activeTab === tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                badge={tab.id === 'connections' ? connectionCount : 0} 
              />
            ))}
          </nav>
        </div>
        <div className="p-8 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
              {(profileData?.full_name || name)[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-black text-slate-800 truncate text-sm">{profileData?.full_name || name}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MENTOR NODE</p>
            </div>
          </div>
          <button onClick={() => { clearUserSession(); navigate('/'); }}
            className="flex items-center w-full px-4 py-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all font-black text-xs tracking-widest uppercase"
          >
            <LogOut size={18} className="mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 lg:ml-72 p-6 lg:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Control Center</h1>
            <p className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-xs">
              Live Operations / <span className="text-emerald-600">{TABS.find(t => t.id === activeTab)?.label}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="shadow-sm rounded-full">
              <LanguageSelector />
            </div>
            <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 shadow-sm relative"
              onClick={() => setActiveTab('connections')}
            >
              <Bell size={20} />
              {connectionCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {connectionCount > 99 ? '99+' : connectionCount}
                </span>
              )}
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-2" />
            <div className="flex flex-col items-end">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">System Status</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-xs font-black text-slate-800">CONNECTED</p>
              </div>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: 'circOut' }}>
            {activeTab === 'overview'    && <OverviewTab profileData={profileData} connectionCount={connectionCount} onTabChange={setActiveTab} />}
            {activeTab === 'sessions'    && <SessionsTab toast={showToast} profileData={profileData} />}
            {activeTab === 'messages'    && <DirectMessagesTab toast={showToast} />}
            {activeTab === 'connections' && <ConnectionsTab toast={showToast} onCountChange={setConnectionCount} />}
            {activeTab === 'profile'     && <ProfileTab profileData={profileData} onProfileCreated={handleProfileSaved} toast={showToast} />}
            {activeTab === 'feedback'    && <FeedbackTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {toast && <Toast key={toast.message} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}