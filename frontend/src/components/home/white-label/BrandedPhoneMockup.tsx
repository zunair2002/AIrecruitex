"use client";

export const BrandedPhoneMockup = ({ id }: { id: number }) => {
  return (
    <div className="w-[180px] h-[320px] bg-slate-900 rounded-[24px] p-2.5 shadow-lg relative border-[3px] border-slate-800 flex flex-col justify-between overflow-hidden select-none hover:scale-105 transition-transform duration-300">
      {/* Speaker and Notch */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-14 h-3 bg-slate-900 rounded-full z-20 flex items-center justify-center">
        <div className="w-5 h-0.5 bg-slate-700 rounded-full" />
      </div>
      
      {/* Branded Screen */}
      <div className="w-full h-full bg-white rounded-[16px] overflow-hidden flex flex-col justify-between border border-slate-100 relative pt-3">
        {id === 1 && (
          <>
            {/* FastTrack Deliveries (Mustard/Amber branding) */}
            <div className="bg-amber-500 h-8 flex items-center justify-center px-2 relative text-white border-b border-amber-600">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">FastTrack</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Driver Screening</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 2 of 5</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  &quot;Do you hold a clean commercial driving license?&quot;
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-4.5 bg-amber-500 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer hover:bg-amber-600">
                  Yes, Clean Record
                </div>
                <div className="h-4.5 bg-white border border-amber-500 rounded flex items-center justify-center font-bold text-[6.5px] text-amber-600 cursor-pointer hover:bg-amber-50">
                  No, Minor Violations
                </div>
              </div>
            </div>
          </>
        )}

        {id === 2 && (
          <>
            {/* Swift Recruitment (Teal branding) */}
            <div className="bg-teal-700 h-8 flex items-center justify-center px-2 relative text-white border-b border-teal-800">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">SWIFT RECRUIT</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Consulting Placement</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 1 of 4</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  &quot;Explain how you manage high-stress environments.&quot;
                </p>
              </div>
              {/* Mic Icon pulse container */}
              <div className="flex flex-col items-center justify-center gap-1 my-1">
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white shadow-md animate-pulse cursor-pointer">
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                  </svg>
                </div>
                <span className="text-[5px] text-teal-600 font-bold animate-pulse">Recording Answer...</span>
              </div>
            </div>
          </>
        )}

        {id === 3 && (
          <>
            {/* The Local Kitchen (Coral Orange branding) */}
            <div className="bg-orange-500 h-8 flex items-center justify-center px-2 relative text-white border-b border-orange-600">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">LOCAL KITCHEN</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Staff Auditing</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 3 of 6</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  &quot;Do you hold a valid local food handlers card?&quot;
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-4.5 bg-orange-500 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer">
                  Yes, Active Card
                </div>
                <div className="h-4.5 bg-white border border-orange-500 rounded flex items-center justify-center font-bold text-[6.5px] text-orange-600 cursor-pointer">
                  No, Obtaining soon
                </div>
              </div>
            </div>
          </>
        )}

        {id === 4 && (
          <>
            {/* TechStart Solutions (Indigo branding) */}
            <div className="bg-indigo-600 h-8 flex items-center justify-center px-2 relative text-white border-b border-indigo-700">
              <span className="text-[8px] font-extrabold tracking-wider font-mono">TECHSTART</span>
            </div>
            <div className="flex-1 p-2 flex flex-col justify-between bg-slate-50/50">
              <div className="flex flex-col gap-1 mt-1">
                <span className="text-[6px] text-slate-500 font-bold uppercase tracking-wider">Software Engineering</span>
                <span className="text-[7px] font-bold text-slate-800 leading-tight">Question 4 of 5</span>
                <p className="text-[7.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                  &quot;Briefly outline JavaScript closures.&quot;
                </p>
              </div>
              <div className="flex flex-col gap-1 mb-2">
                <div className="h-7 w-full bg-white border border-slate-200 rounded p-1 text-[5px] text-slate-400 font-mono flex items-start select-text overflow-hidden">
                  {'const closure = () => ...'}
                </div>
                <div className="h-4.5 bg-indigo-600 rounded flex items-center justify-center font-bold text-[6.5px] text-white shadow-sm cursor-pointer">
                  Submit Answer
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Universal Brand Footer */}
        <div className="h-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center select-none">
          <span className="text-[5px] text-slate-400 font-medium">Powered by Skreena</span>
        </div>
      </div>
    </div>
  );
};
