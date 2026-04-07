import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Wifi, WifiOff, Loader2, ArrowLeft, CheckCheck } from 'lucide-react';
import { toISTTime } from '../utils/time';
import { chatApi } from '../services/api/chatApi';

// Derive WS base from the same host as the HTTP API so they always match.
// http://host → ws://host  |  https://host → wss://host
const HTTP_BASE = import.meta.env.VITE_API_BASE_URL || 'http://192.168.1.106:8000';
const WS_BASE = HTTP_BASE.replace(/^http/, 'ws');

function Avatar({ name, size = 'md' }) {
  const initials = name
    ?.split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
  const COLORS = ['bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  const color = COLORS[(name?.charCodeAt(0) ?? 0) % COLORS.length];
  const sizeClass = size === 'lg' ? 'w-11 h-11 text-base' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

export default function SessionChat({ otherUserId, otherPartyName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [wsStatus, setWsStatus] = useState('connecting');
  const [errorMsg, setErrorMsg] = useState('');
  const wsRef = useRef(null);
  const bottomRef = useRef(null);
  const pendingSent = useRef(new Set());
  const connectingRef = useRef(false); // prevents double WebSocket connection
  const token = localStorage.getItem('token');

  // Load 24h message history on mount
  useEffect(() => {
    chatApi.getMessages(otherUserId)
      .then(history => {
        const mapped = (history || []).map(m => ({
          id: `hist-${m.sent_at}-${Math.random()}`,
          sender: m.is_me ? 'You' : otherPartyName,
          text: m.message,
          timestamp: m.sent_at,
          isMe: m.is_me,
        }));
        setMessages(mapped);
      })
      .catch(() => {});
  }, [otherUserId, otherPartyName]);

  useEffect(() => {
    // Hard lock: never open a second socket while one is in-flight or open
    if (connectingRef.current) return;
    connectingRef.current = true;

    let isMounted = true;

    const ws = new WebSocket(
      `${WS_BASE}/api/v1/mentorship/chat/${otherUserId}/?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      if (isMounted) setWsStatus('connected');
    };

    ws.onmessage = (e) => {
      if (!isMounted) return;
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'NEW_MESSAGE') {
          if (pendingSent.current.has(data.message)) {
            pendingSent.current.delete(data.message);
            return;
          }
          setMessages(prev => [...prev, {
            id: `${Date.now()}-${Math.random()}`,
            sender: data.sender,
            text: data.message,
            timestamp: data.timestamp,
            isMe: false,
          }]);
        } else if (data.event === 'ERROR') {
          setErrorMsg(data.message);
          setWsStatus('error');
        }
      } catch {}
    };

    ws.onclose = () => {
      connectingRef.current = false;
      wsRef.current = null;
      // Don't overwrite 'error' — the ERROR event already set the right message
      if (isMounted) setWsStatus(prev => (prev === 'error' ? prev : 'disconnected'));
    };

    ws.onerror = () => {
      if (isMounted) setWsStatus('error');
      // onclose always fires after onerror, so connectingRef is reset there
    };

    return () => {
      isMounted = false;
      connectingRef.current = false;
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'component unmounted');
      }
      wsRef.current = null;
    };
  }, [otherUserId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    // Use readyState directly — more reliable than React state which can lag
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ message: text }));
    pendingSent.current.add(text);
    setMessages(prev => [...prev, {
      id: `sent-${Date.now()}-${Math.random()}`,
      sender: 'You',
      text,
      timestamp: new Date().toISOString(),
      isMe: true,
    }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const statusDot =
    wsStatus === 'connected' ? 'bg-emerald-400' :
    wsStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
    'bg-red-400';
  const statusLabel =
    wsStatus === 'connected' ? 'Online' :
    wsStatus === 'connecting' ? 'Connecting...' :
    wsStatus === 'error' ? (errorMsg || 'Connection error') :
    'Disconnected';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 24 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="w-full max-w-md h-[88vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: '#0a0f14' }}
      >
        {/* ── Header ────────────────────────────────────── */}
        <div
          className="px-5 py-4 flex items-center gap-3 shrink-0 border-b border-white/8"
          style={{ background: 'linear-gradient(135deg, #111820 0%, #0d1520 100%)' }}
        >
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all mr-0.5"
          >
            <ArrowLeft size={18} />
          </button>

          <Avatar name={otherPartyName} size="lg" />

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate leading-tight">{otherPartyName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
              <span className="text-[11px] text-slate-400">{statusLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wsStatus === 'connecting' && <Loader2 size={15} className="text-slate-500 animate-spin" />}
            {wsStatus === 'connected' && <Wifi size={15} className="text-emerald-400" />}
            {(wsStatus === 'disconnected' || wsStatus === 'error') && <WifiOff size={15} className="text-red-400" />}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Chat background watermark ─────────────────── */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5 space-y-1"
          style={{
            background: 'repeating-linear-gradient(135deg, #0d1117 0px, #0d1117 40px, #0e1219 40px, #0e1219 80px)',
          }}
        >
          {wsStatus === 'connecting' && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={30} className="animate-spin text-slate-600" />
              <span className="text-sm text-slate-500">Connecting to chat...</span>
            </div>
          )}

          {(wsStatus === 'error' || wsStatus === 'disconnected') && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <WifiOff size={30} className="text-red-400" />
              <span className="text-sm text-slate-400">
                {errorMsg || 'Could not connect. Make sure the mentorship request is approved.'}
              </span>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex items-end gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!msg.isMe && <Avatar name={msg.sender} size="sm" />}

                <div className={`flex flex-col gap-0.5 max-w-[75%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  {!msg.isMe && (
                    <span className="text-[10px] font-semibold text-slate-500 px-1 ml-0.5">
                      {msg.sender}
                    </span>
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.isMe
                        ? 'text-white rounded-2xl rounded-br-sm'
                        : 'text-slate-100 rounded-2xl rounded-bl-sm border border-white/8'
                    }`}
                    style={{
                      background: msg.isMe
                        ? 'linear-gradient(135deg, #25a244 0%, #1a8c36 100%)'
                        : '#1a2230',
                    }}
                  >
                    {msg.text}
                  </div>
                  <div className={`flex items-center gap-1 px-1 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-slate-600">{toISTTime(msg.timestamp)}</span>
                    {msg.isMe && <CheckCheck size={12} className="text-emerald-400" />}
                  </div>
                </div>

                {msg.isMe && <Avatar name="You" size="sm" />}
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* ── Input ─────────────────────────────────────── */}
        <div
          className="px-4 py-4 shrink-0 border-t border-white/8"
          style={{ background: '#0d1117' }}
        >
          <div
            className="flex items-end gap-3 rounded-2xl px-4 py-2.5 border border-white/10"
            style={{ background: '#1a2230' }}
          >
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={wsStatus === 'connected' ? 'Type a message…' : 'Waiting for connection…'}
              disabled={wsStatus !== 'connected'}
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 resize-none outline-none max-h-28 disabled:opacity-40"
              style={{ lineHeight: '1.6' }}
            />
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={sendMessage}
              disabled={!input.trim() || wsStatus !== 'connected'}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #25a244 0%, #1a8c36 100%)' }}
            >
              <Send size={15} className="text-white" />
            </motion.button>
          </div>
          <p className="text-center text-[10px] text-slate-700 mt-2 tracking-wide">
            Messages are saved to your record
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
