import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Star, Calendar, MessageSquare, Loader2,
  ShieldCheck, Clock, CheckCircle2, X, Briefcase, UserPlus
} from 'lucide-react';
import { mentorshipApi } from '../services/api/mentorshipApi';
import { toast } from 'react-hot-toast';

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MentorProfilePublic() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  
  const [mentor, setMentor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking States
  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingNote, setBookingNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Success States
  const [requestSent, setRequestSent] = useState(false);
  const [backendMessage, setBackendMessage] = useState("");

  // Connection States
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const mData = await mentorshipApi.getMentorDetails(mentorId);
        setMentor(mData);
        const sData = await mentorshipApi.getMentorAvailability(mentorId);
        setSlots(sData);
      } catch (err) {
        console.error(err);
        toast.error("Mentor details unavailable");
        navigate('/mentorship');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [mentorId, navigate]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await mentorshipApi.sendConnectionRequest(mentorId, '');
      setConnected(true);
      toast.success('Connection request sent! The mentor will review your profile.');
    } catch (err) {
      toast.error(err.message || 'Failed to send request.');
    } finally {
      setConnecting(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      // Hits the POST /requests/create endpoint
      const response = await mentorshipApi.createMentorshipRequest(
        mentorId, 
        selectedSlot.id, 
        bookingNote
      );
      
      // Capture message from backend return {"message": "..."}
      setBackendMessage(response.message || "Request sent successfully!");
      setRequestSent(true); 
      
      // Remove the slot from the local list so others can't click it
      setSlots(slots.filter(s => s.id !== selectedSlot.id));
    } catch (err) {
      // Backend error (e.g., "Slot unavailable" or "Already pending")
      toast.error(err.message || "Failed to book session");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <p className="text-slate-500 font-bold">Loading Profile...</p>
      </div>
    );
  }

  if (!mentor) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors">
          <ArrowLeft size={18} /> Back
        </button>

        {/* PROFILE CARD */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden mb-12"
        >
          <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-500 relative">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          </div>
          
          <div className="px-8 pb-10">
            <div className="relative flex justify-between items-end -mt-16 mb-8">
              <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-2xl">
                <div className="w-full h-full rounded-[1.5rem] bg-slate-100 flex items-center justify-center text-5xl font-black text-blue-600">
                  {mentor.full_name?.[0] || 'M'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleConnect}
                  disabled={connecting || connected}
                  className="px-6 py-4 bg-slate-100 border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {connecting ? <Loader2 size={18} className="animate-spin" /> : connected ? <CheckCircle2 size={18} className="text-emerald-500" /> : <UserPlus size={18} />}
                  {connected ? 'Requested' : 'Connect'}
                </button>
                <button
                  onClick={() => {
                    setRequestSent(false);
                    setIsBooking(true);
                  }}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 hover:scale-105 hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Calendar size={20} /> Book a Session
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{mentor.full_name || 'Verified Mentor'}</h1>
              <ShieldCheck className="text-blue-500" size={28} />
            </div>
            
            <p className="text-blue-600 font-extrabold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
              <Briefcase size={16} /> {mentor.expertise} • {mentor.years_experience} Years Experience
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Professional Biography</h3>
                  <p className="text-slate-600 leading-relaxed font-medium text-lg">
                    {mentor.bio || "Verified professional in our network."}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Core Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.split(',').map(skill => (
                      <span key={skill} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Rating</p>
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-3xl">
                    <Star size={24} fill="currentColor" /> {mentor.rating || '5.0'}
                  </div>
                </div>
                <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-center">
                  <p className="text-xs font-bold text-emerald-400 uppercase mb-2">Available Slots</p>
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-3xl">
                    <Clock size={24} /> {slots.length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* BOOKING MODAL */}
        <AnimatePresence>
          {isBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => !submitting && setIsBooking(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden p-8"
              >
                <AnimatePresence mode="wait">
                  {!requestSent ? (
                    <motion.div 
                      key="booking-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h2 className="text-2xl font-black text-slate-900">Select a Slot</h2>
                          <p className="text-sm font-medium text-slate-500">Pick a time for your session</p>
                        </div>
                        <button onClick={() => setIsBooking(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <X size={24} className="text-slate-400" />
                        </button>
                      </div>

                      {slots.length === 0 ? (
                        <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 mb-6">
                          <Clock size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-slate-400 font-bold">No slots available this week.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                          {slots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setSelectedSlot(slot)}
                              className={`w-full p-5 rounded-2xl border-2 flex justify-between items-center transition-all ${
                                selectedSlot?.id === slot.id 
                                ? 'border-blue-600 bg-blue-50 shadow-md' 
                                : 'border-slate-100 hover:border-blue-200'
                              }`}
                            >
                              <div className="text-left">
                                <p className="font-black text-slate-800 uppercase text-xs tracking-widest mb-1">{DAYS[slot.day_of_week]}</p>
                                <p className="text-lg font-bold text-slate-600">{slot.start_time.slice(0,5)} — {slot.end_time.slice(0,5)}</p>
                              </div>
                              {selectedSlot?.id === slot.id ? (
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                                  <CheckCircle2 className="text-white" size={16} />
                                </div>
                              ) : (
                                <div className="w-6 h-6 border-2 border-slate-200 rounded-full" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      <textarea
                        placeholder="What do you want to discuss? (e.g., Portfolio review, career advice...)"
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none mb-6 resize-none"
                        rows={3}
                        value={bookingNote}
                        onChange={(e) => setBookingNote(e.target.value)}
                      />

                      <button
                        disabled={!selectedSlot || submitting}
                        onClick={handleConfirmBooking}
                        className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : "Request Session"}
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="success-screen"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <CheckCircle2 size={48} className="text-emerald-500" />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">Awesome!</h2>
                      <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                        {backendMessage} <br />
                        You'll see it in your dashboard once approved.
                      </p>
                      <button
                        onClick={() => {
                          setIsBooking(false);
                          setRequestSent(false);
                        }}
                        className="w-full py-4 bg-slate-900 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-slate-800 transition-all"
                      >
                        Got it, thanks!
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}