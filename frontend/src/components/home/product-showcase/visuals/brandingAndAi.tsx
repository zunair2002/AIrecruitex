export const BrandBrandingVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md">
      <div className="h-8 bg-slate-50 border-b border-slate-150 flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="ml-2 text-[9px] text-slate-400 font-mono select-none">branding-control.io</div>
      </div>
      <div className="flex-1 flex p-2.5 gap-2.5 items-center">
        <div className="w-1/2 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-slate-800">Brand Identity</div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200/60 flex flex-col gap-1">
            <span className="text-[7px] text-slate-500 font-semibold tracking-wider">PRIMARY THEME</span>
            <div className="flex gap-1.5 items-center">
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 ring-2 ring-indigo-200 ring-offset-2 ring-offset-white cursor-pointer animate-pulse" />
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 cursor-pointer hover:scale-110 transition-transform" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 cursor-pointer hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-200/60 flex items-center justify-between">
            <span className="text-[7px] text-slate-500 font-semibold tracking-wider">LOGO</span>
            <div className="w-7 h-3.5 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center text-[6px] text-indigo-600 font-bold">LOGO</div>
          </div>
        </div>
        <div className="w-1/2 bg-slate-50 rounded-lg p-2 flex flex-col gap-2 border border-slate-150 justify-center items-center relative h-full">
          <div className="absolute top-1 right-1 text-[5px] text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-100 uppercase tracking-widest font-bold">Preview</div>
          <div className="w-full bg-white rounded border border-indigo-200/60 overflow-hidden shadow-sm flex flex-col mt-2">
            <div className="h-2 bg-indigo-600 flex items-center px-1 justify-between">
              <div className="w-2.5 h-0.5 bg-white/40 rounded-full" />
              <div className="w-1 h-1 rounded-full bg-white/80" />
            </div>
            <div className="p-1.5 flex flex-col gap-1">
              <div className="w-3/4 h-0.5 bg-slate-200 rounded-full" />
              <div className="w-1/2 h-0.5 bg-slate-150 rounded-full" />
              <div className="h-2.5 bg-indigo-600 rounded mt-1 flex items-center justify-center">
                <span className="text-[5px] text-white font-bold font-mono">Start Interview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const AIHumanVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    <div className="absolute w-40 h-40 bg-purple-500/5 rounded-full blur-2xl -bottom-10 -right-10 group-hover:bg-purple-500/10 transition-all duration-700" />
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md justify-between p-2.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">AI</div>
            <div className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-800 leading-none">Skreena Voice AI</span>
            <span className="text-[6px] text-emerald-605 mt-0.5 tracking-wider uppercase font-bold">Active Chat</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1.5">
        <div className="flex gap-1.5 max-w-[85%] self-start">
          <div className="bg-slate-100 border border-slate-150 rounded-lg p-1.5 flex flex-col gap-1 shadow-sm">
            <p className="text-[7.5px] text-slate-700">How would you approach scaling a database for 10M active users?</p>
          </div>
        </div>
        <div className="flex gap-1.5 max-w-[80%] self-end">
          <div className="bg-indigo-600 text-white rounded-lg p-1.5 shadow-sm">
            <p className="text-[7.5px] leading-relaxed">I would use horizontal sharding, implement Redis, and set up read replicas...</p>
          </div>
        </div>
        <div className="flex gap-1.5 max-w-[85%] self-start border-l-2 border-indigo-500 pl-1 animate-pulse">
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-1.5">
            <p className="text-[7.5px] text-indigo-700 font-medium flex flex-col gap-0.5">
              <span className="text-[6px] font-bold text-indigo-600">💡 Smart Follow-up:</span>
              <span className="text-slate-700">How would you handle eventual consistency in sharding?</span>
            </p>
          </div>
        </div>
      </div>
      <div className="h-4.5 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center gap-1 px-4">
        <div className="w-0.5 rounded-full bg-indigo-500 animate-[wave_1.2s_infinite]" style={{ animationDelay: "0.1s" }} />
        <div className="w-0.5 rounded-full bg-indigo-400 animate-[wave_1.2s_infinite]" style={{ animationDelay: "0.3s" }} />
        <div className="w-0.5 rounded-full bg-purple-500 animate-[wave_1.2s_infinite]" style={{ animationDelay: "0.5s" }} />
        <div className="w-0.5 rounded-full bg-purple-400 animate-[wave_1.2s_infinite]" style={{ animationDelay: "0.2s" }} />
        <div className="w-0.5 rounded-full bg-indigo-500 animate-[wave_1.2s_infinite]" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  </div>
);
