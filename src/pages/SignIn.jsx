import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CloudBackground from '../components/layout/CloudBackground';
import { loginUser } from '../services/api/authApi';

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginUser({ email, password });

      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);
      if (res.userId) localStorage.setItem("userId", res.userId);

      if (res.role === "parent" || res.role === "admin") {
        navigate("/parent-dashboard");
      } else if (res.role === "mentor") {
        navigate("/mentor-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center lg:justify-start px-6 py-12 lg:p-20 font-sans antialiased text-slate-900 overflow-hidden bg-[#f0f9ff]">
      <CloudBackground />
      
      <Link 
        to="/"
        className="absolute top-8 left-8 z-20 flex items-center text-sm font-bold text-slate-500 hover:text-[#3b82f6] transition-colors cursor-pointer bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Home
      </Link>

      {/* ========================================= */}
      {/* LEFT SIDE: Floating White Form Card       */}
      {/* ========================================= */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[500px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-8 sm:p-12 mx-auto lg:mx-0"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white text-2xl">🤖</span>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">
            AI Career Path
          </span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Sign in to access your AI career dashboard.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-slate-400" />
              </div>
              <input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-4 bg-[#3b82f6] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Don't have an account? <Link to="/signup" className="text-[#3b82f6] font-bold hover:underline">Sign up</Link>
        </p>
      </motion.div>

      {/* ========================================= */}
      {/* RIGHT SIDE: Animated Robo Mascot          */}
      {/* ========================================= */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center z-10 pointer-events-none pl-12">
        <motion.div 
          animate={{ y: [-15, 15, -15] }} 
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }} 
          className="relative w-full flex justify-center items-center"
        >
          {/* Replaced the rocket placeholder with your exact Hero Robo setup! */}
          <img 
            src="/public/robo.png" 
            alt="AI Mascot" 
            // Kept -scale-x-100 so he looks left toward the login form
            className="w-full max-w-[400px] xl:max-w-[500px] object-contain -scale-x-100" 
            style={{ 
              filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.15)) hue-rotate(210deg) saturate(1.2)' 
            }}
          />
        </motion.div>
      </div>

    </div>
  );
}