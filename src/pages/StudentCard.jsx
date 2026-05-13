import React from 'react';
import { MessageCircle, ExternalLink, GraduationCap } from 'lucide-react';

const StudentCard = ({ student, onChatClick, onViewProfile }) => {
  // Fallback checks for the name depending on how the backend sends it
  const studentName = student.full_name || student.student_name || "Unknown Student";
  
  // Safely check for class data (handles both nested and flat structures)
  const academicData = student.student_snapshot?.academic_data || student.academic_data || {};
  const studentClass = academicData.class;

  return (
    <div className="relative group bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
      
      {/* Avatar & Identity Section */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[1rem] flex items-center justify-center text-white text-lg font-black shadow-lg">
            {studentName.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-slate-800 text-base leading-tight truncate">
            {studentName}
          </h4>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5">
            Connected
          </p>
        </div>
      </div>

      {/* Snapshot / Details Section - ONLY renders if studentClass exists */}
      {studentClass && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
          <div className="flex items-center gap-2 text-slate-700 text-xs font-bold">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-sm text-emerald-500 shrink-0">
              <GraduationCap size={14} />
            </div>
            <span className="truncate">{studentClass}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => onChatClick && onChatClick(student)}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-black transition-colors shadow-md"
        >
          <MessageCircle size={14} /> CHAT
        </button>
        <button 
          onClick={() => onViewProfile && onViewProfile(student.student_id)}
          className="w-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors shrink-0"
        >
          <ExternalLink size={14} />
        </button>
      </div>

    </div>
  );
};

export default StudentCard;