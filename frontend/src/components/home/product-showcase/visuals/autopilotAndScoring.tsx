export const AutopilotVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-teal-500/5 rounded-full blur-2xl -top-10 -right-10 group-hover:bg-teal-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Interview Pipeline</span>
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[6px] text-emerald-700 font-bold uppercase tracking-wider">Autopilot ON</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1">
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-150">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[7px] text-teal-600 font-bold">JD</div>
            <div className="flex flex-col">
              <span className="text-[7.5px] font-bold text-slate-800 leading-none">Jane Doe</span>
              <span className="text-[5.5px] text-slate-500 mt-0.5">Frontend Applicant</span>
            </div>
          </div>
          <span className="text-[6.5px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 rounded font-bold">Done 09:30</span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg border border-slate-150">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[7px] text-indigo-600 font-bold">AS</div>
            <div className="flex flex-col">
              <span className="text-[7.5px] font-bold text-slate-800 leading-none">Alex Smith</span>
              <span className="text-[5.5px] text-slate-500 mt-0.5">UI Designer</span>
            </div>
          </div>
          <span className="text-[6.5px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded font-bold animate-pulse">Screening</span>
        </div>
        <div className="flex items-center justify-between bg-slate-50/40 p-1.5 rounded-lg border border-slate-100">
          <div className="flex items-center gap-1.5 opacity-60">
            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[7px] text-slate-500 font-bold">ML</div>
            <div className="flex flex-col">
              <span className="text-[7.5px] font-bold text-slate-800 leading-none">Mike Lee</span>
              <span className="text-[5.5px] text-slate-500 mt-0.5">Queued today 14:00</span>
            </div>
          </div>
          <span className="text-[6.5px] text-slate-500 bg-slate-100 border border-slate-200/40 px-1 rounded font-bold">Queued</span>
        </div>
      </div>
      <div className="text-[6.5px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
        <span>Screened: <strong className="text-slate-800">12 Candidates</strong></span>
        <span className="text-indigo-600 font-bold">Time Saved: 18.5h</span>
      </div>
    </div>
  </div>
);

export const SmartScoringVisual = () => (
  <div className="w-full h-full bg-slate-55/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -bottom-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Consensus Scoring</span>
        <span className="text-[7px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-bold">Dual AI Audit</span>
      </div>
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ color: "#f1f5f9" }} />
            <path className="text-indigo-600 animate-[pulseGlow_3s_infinite]" strokeDasharray="95, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ strokeDashoffset: 0 }} />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-sm font-bold text-slate-800 font-mono leading-none">95%</span>
            <span className="text-[4.5px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Match</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          <div className="bg-slate-50 p-1 rounded border border-slate-150 flex flex-col gap-0.5">
            <div className="flex justify-between text-[6.5px] font-bold text-slate-700">
              <span>Agent A (Skills Audit)</span>
              <span className="text-indigo-600">96%</span>
            </div>
            <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500" style={{ width: "96%" }} />
            </div>
          </div>
          <div className="bg-slate-50 p-1 rounded border border-slate-150 flex flex-col gap-0.5">
            <div className="flex justify-between text-[6.5px] font-bold text-slate-700">
              <span>Agent B (Behavioral)</span>
              <span className="text-purple-650">94%</span>
            </div>
            <div className="h-0.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: "94%" }} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded p-1 flex items-center justify-between">
        <span className="text-[6.5px] text-emerald-700 font-bold uppercase tracking-wider">Consensus Reached ✓</span>
        <span className="text-[6.5px] text-slate-500">Diff: &lt; 2%</span>
      </div>
    </div>
  </div>
);
