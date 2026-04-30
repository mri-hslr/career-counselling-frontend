import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Calendar,
  Star,
  Loader2,
  UserPlus,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mentorshipApi } from "../services/api/mentorshipApi";
import { toast } from "react-hot-toast";

export default function Mentorship() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState(null);

  useEffect(() => {
    mentorshipApi
      .listMentors()
      .then(setMentors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleConnect = async (mentor) => {
    setConnectingId(mentor.id);
    try {
      await mentorshipApi.sendConnectionRequest(mentor.id, "");

      setMentors((prevMentors) =>
        prevMentors.map((m) =>
          m.id === mentor.id ? { ...m, connection_status: "pending" } : m,
        ),
      );

      toast.success(
        `Connection request sent to ${mentor.full_name || "Mentor"}!`,
      );
    } catch (err) {
      toast.error(err.message || "Failed to send request.");
    } finally {
      setConnectingId(null);
    }
  };

  // Helper function to render the correct button state based on the backend data.
  const renderConnectionButton = (mentor) => {
    const isConnecting = connectingId === mentor.id;
    const status = mentor.connection_status || "none";

    if (status === "accepted") {
      return (
        <button
          disabled
          className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-2xl flex items-center justify-center gap-2 opacity-100 cursor-default"
        >
          <UserCheck size={16} /> Connected
        </button>
      );
    }

    if (status === 'pending'){
      return (
        <button disabled className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 opacity-100 cursor-default">
          <CheckCircle2 size={16} /> Request Sent
        </button>
      );
    }
    
    return (
      <button
        onClick={() => handleConnect(mentor)}
        disabled={isConnecting}
        className="w-full py-3 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-2xl hover:bg-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConnecting ? <Loader2 size={16} className="animate-spin" />: <>
        <UserPlus size={16} /> Connect</>}
      </button>
    )
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold mb-8 transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 flex items-center gap-3">
            <Users size={32} className="text-blue-500" /> Professional Mentors
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Connect with industry experts to accelerate your career journey.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin text-blue-500" />
            <p className="font-bold">Loading mentor profiles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <motion.div
                key={mentor.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col h-full hover:shadow-xl hover:shadow-blue-500/5 transition-all"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {mentor.full_name?.[0] || "M"}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {mentor.full_name || "Verified Mentor"}
                    </h3>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={14} fill="currentColor" />
                      <span className="text-xs font-black uppercase tracking-widest">
                        {mentor.rating || "New"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs font-black text-blue-500 uppercase tracking-widest mb-2">
                    Expertise
                  </p>
                  <p className="text-sm font-bold text-slate-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg inline-block">
                    {mentor.expertise}
                  </p>
                </div>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8 flex-grow">
                  {mentor.bio ||
                    "Experienced professional ready to provide data-driven career guidance and technical mentorship."}
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/mentorship/${mentor.id}`)}
                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} /> Book Session
                  </button>

                  {renderConnectionButton(mentor)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
