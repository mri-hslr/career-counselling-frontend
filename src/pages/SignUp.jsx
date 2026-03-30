import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CloudBackground from '../components/layout/CloudBackground';
import { registerUser } from '../services/api/authApi';

export default function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser(form);
      navigate("/signin");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center lg:justify-start px-6 py-12 lg:p-20 font-sans antialiased text-slate-900 overflow-hidden bg-[#f0f9ff]">
      <CloudBackground />

      <Link
        to="/signin"
        className="absolute top-8 left-8 z-20 flex items-center text-sm font-bold text-slate-500 hover:text-[#3b82f6] transition-colors cursor-pointer bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-sm"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Sign In
      </Link>

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
          <span className="text-3xl font-extrabold tracking-tight text-slate-800">AI Career Path</span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">Create Account</h1>
          <p className="text-slate-500 font-medium text-sm">Start your AI-powered career journey today.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Full Name</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="full_name"
                placeholder="Alex Johnson"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700 placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">I am a...</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] outline-none transition-all shadow-sm font-medium text-slate-700"
            >
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="parent">Parent / Guardian</option>
            </select>
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
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm font-medium text-slate-500">
          Already have an account?{" "}
          <Link to="/signin" className="text-[#3b82f6] font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
