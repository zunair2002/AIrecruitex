export const CVParsingVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -right-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex justify-between items-center pb-1 border-b border-slate-100">
        <span className="text-[9px] font-bold text-slate-800">CV Extraction Engine</span>
        <span className="text-[6px] text-indigo-650 bg-indigo-50 px-1.5 rounded font-mono font-bold">PARSING</span>
      </div>
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1.5 relative">
        <div className="w-16 h-20 bg-slate-50 rounded border border-slate-200 relative overflow-hidden flex flex-col p-1.5 gap-1.5 justify-center shadow-sm">
          <div className="w-6 h-1.5 bg-slate-300 rounded-full" />
          <div className="w-10 h-0.5 bg-slate-200 rounded-full" />
          <div className="w-full flex flex-col gap-0.5 mt-0.5 opacity-70">
            <div className="w-full h-0.5 bg-indigo-500/20 rounded-full" />
            <div className="w-3/4 h-0.5 bg-indigo-500/20 rounded-full" />
            <div className="w-5/6 h-0.5 bg-indigo-500/20 rounded-full" />
          </div>
          <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_6px_#6366f1] animate-[scan_2.8s_infinite] opacity-80" />
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-center">
          {[
            { label: "NAME", value: "Jonathan D.", color: "text-slate-800" },
            { label: "SKILLS", value: "React, Go, AWS", color: "text-indigo-600" },
            { label: "EXP", value: "5+ Years", color: "text-emerald-705" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-50 p-1 rounded border border-slate-150 flex items-center justify-between">
              <span className="text-[5.5px] text-slate-500 font-bold uppercase">{label}</span>
              <span className={`text-[7.5px] ${color} font-bold leading-none`}>{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-[6px] text-slate-500 text-center border-t border-slate-100 pt-1">
        Parsed from <strong className="text-slate-700 font-mono">resume-doc.pdf</strong>
      </div>
    </div>
  </div>
);

export const CandidateInsightsVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-purple-500/5 rounded-full blur-2xl -bottom-10 -left-10 group-hover:bg-purple-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-800">Insight Skill Vector</span>
        <span className="text-[6.5px] text-purple-650 bg-purple-50 border border-purple-100 px-2 rounded-full font-bold">Metrics</span>
      </div>
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1">
        <div className="w-12 h-12 relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-slate-200" />
          <div className="absolute w-8 h-8 rounded-full border border-slate-200" />
          <div className="absolute w-4 h-4 rounded-full border border-slate-200" />
          <div className="absolute w-full h-px bg-slate-100" />
          <div className="absolute w-px h-full bg-slate-100" />
          <svg className="absolute w-full h-full" viewBox="0 0 64 64">
            <polygon points="32,10 52,22 46,46 18,38 12,24" fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6" strokeWidth="1" />
            <circle cx="32" cy="10" r="1.5" fill="#8B5CF6" />
            <circle cx="52" cy="22" r="1.5" fill="#8B5CF6" />
            <circle cx="46" cy="46" r="1.5" fill="#8B5CF6" />
            <circle cx="18" cy="38" r="1.5" fill="#8B5CF6" />
            <circle cx="12" cy="24" r="1.5" fill="#8B5CF6" />
          </svg>
        </div>
        <div className="flex-1 flex flex-col gap-1 justify-center">
          {[
            { label: "Communication", score: "9/10" },
            { label: "Tech Depth", score: "9.5/10" },
            { label: "Leadership", score: "8.5/10" },
          ].map(({ label, score }) => (
            <div key={label} className="flex justify-between text-[6.5px] font-semibold text-slate-500 leading-none">
              <span>{label}</span>
              <span className="text-slate-800">{score}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-50 p-1 rounded border border-slate-150 flex justify-between items-center text-[6.5px] text-slate-500">
        <span>Session: <strong className="text-slate-700">22m</strong></span>
        <span className="text-purple-650 font-bold uppercase tracking-wide">Elite Fit Rank</span>
      </div>
    </div>
  </div>
);

export const EmailNotificationsVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between animate-pulse-slow">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
        <span className="text-[9px] font-bold text-slate-800">Alerts System</span>
        <span className="text-[6.5px] text-indigo-600 bg-indigo-50 px-1.5 rounded font-bold font-mono">EMAIL</span>
      </div>
      <div className="flex-1 flex items-center justify-center py-1.5">
        <div className="w-11/12 bg-white rounded border border-indigo-100 p-2 flex flex-col gap-1 shadow-md animate-[float_4s_infinite]">
          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
            <span className="text-[7.5px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
              <span>📬 AI Shortlist Ready!</span>
            </span>
            <span className="text-[5.5px] text-slate-400 font-mono">Just Now</span>
          </div>
          <p className="text-[6.5px] text-slate-500 leading-relaxed">
            3 candidates finished screening. High-quality shortlist is ready to review.
          </p>
          <div className="h-3.5 bg-indigo-600 hover:bg-indigo-700 rounded flex items-center justify-center font-bold text-[6.5px] text-white cursor-pointer select-none">
            Review Shortlist →
          </div>
        </div>
      </div>
      <div className="text-[6px] text-slate-500 flex justify-between items-center border-t border-slate-100 pt-1">
        <span>Delivery options:</span>
        <div className="flex gap-1.5 font-bold text-[5.5px] uppercase tracking-wider text-slate-400">
          <span className="text-indigo-600">Email</span>
          <span>•</span>
          <span>Slack Hook</span>
        </div>
      </div>
    </div>
  </div>
);
