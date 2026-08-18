export const DiscrepancyVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-amber-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-amber-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="text-[9px] font-bold text-slate-800">Fact-Check Engine</span>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-amber-700 text-[7px] font-bold animate-pulse">
          <span>⚠️ 1 Flag Detected</span>
        </div>
      </div>
      <div className="flex-1 flex gap-2 justify-center items-center py-1.5">
        <div className="w-1/2 bg-slate-50 p-1.5 rounded border border-slate-150 flex flex-col gap-1 h-full justify-center">
          <span className="text-[5.5px] text-slate-500 font-bold uppercase tracking-wider">Resume Claims</span>
          <div className="bg-white p-1 rounded border border-slate-200 shadow-sm">
            <span className="text-[6.5px] text-slate-700 font-bold">AWS Kubernetes</span>
            <p className="text-[5px] text-slate-450 mt-0.5">&quot;Led deployments in prod...&quot;</p>
          </div>
        </div>
        <div className="w-1/2 bg-amber-50 border border-amber-100 p-1.5 rounded flex flex-col gap-1 h-full justify-center">
          <span className="text-[5.5px] text-amber-700 font-bold uppercase tracking-wider">Interview Response</span>
          <div className="bg-white p-1 rounded border border-amber-200 shadow-sm">
            <span className="text-[6.5px] text-amber-650 font-bold">&quot;Never deployed K8s...&quot;</span>
            <p className="text-[5px] text-amber-500 mt-0.5">Admitted to only theoretical knowledge.</p>
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-100 rounded p-1 text-center text-amber-700 text-[6.5px] font-bold uppercase tracking-wider">
        AI Alert: Skills Mismatch Flagged
      </div>
    </div>
  </div>
);

export const AntiCheatVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-rose-500/5 rounded-full blur-2xl -bottom-10 -right-10 group-hover:bg-rose-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Security Proctoring</span>
        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-rose-600 text-[6px] font-bold">
          <span className="w-1 h-1 rounded-full bg-rose-450 animate-pulse" />
          <span>ACTIVE MONITORING</span>
        </div>
      </div>
      <div className="flex-1 flex gap-2.5 justify-center items-center py-1.5">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-100" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ color: "#f1f5f9" }} />
            <path className="text-rose-500" strokeDasharray="30, 100" strokeWidth="2.5" strokeLinecap="round" stroke="#ef4444" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-[8px] font-bold text-rose-600 font-mono">00:45</span>
            <span className="text-[4px] text-slate-500 uppercase font-bold tracking-wider">Timer</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {["Adaptive Interviewing", "Clipboard Blocked", "Focus Track Active"].map((label) => (
            <div key={label} className="flex items-center gap-1 text-[7.5px] text-slate-700 font-medium">
              <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[6px] text-emerald-600 font-bold">✓</div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-emerald-50 border border-emerald-100 rounded p-1 flex items-center justify-center gap-1">
        <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span className="text-[6.5px] text-emerald-700 font-bold uppercase tracking-wider">Verified Authentic Response</span>
      </div>
    </div>
  </div>
);
