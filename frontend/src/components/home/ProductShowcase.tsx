"use client";

import { useState, useEffect, useRef } from "react";

// Slide Illustrations Custom Components (Light Theme to match website branding)

const BrandBrandingVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    
    {/* Browser Card */}
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md">
      {/* Header */}
      <div className="h-8 bg-slate-50 border-b border-slate-150 flex items-center px-3 gap-1.5">
        <div className="w-2 h-2 rounded-full bg-rose-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <div className="ml-2 text-[9px] text-slate-400 font-mono select-none">branding-control.io</div>
      </div>
      
      {/* Settings layout */}
      <div className="flex-1 flex p-2.5 gap-2.5 items-center">
        {/* Settings panel */}
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
        
        {/* Live Preview card */}
        <div className="w-1/2 bg-slate-50 rounded-lg p-2 flex flex-col gap-2 border border-slate-150 justify-center items-center relative h-full">
          <div className="absolute top-1 right-1 text-[5px] text-indigo-600 bg-indigo-50 px-1 rounded border border-indigo-100 uppercase tracking-widest font-bold">Preview</div>
          {/* Mock Interview Window */}
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

const AIHumanVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-purple-500/5 rounded-full blur-2xl -bottom-10 -right-10 group-hover:bg-purple-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md justify-between p-2.5">
      {/* Header/Status */}
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
      
      {/* Conversation Thread */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1.5">
        {/* Message 1 (AI) */}
        <div className="flex gap-1.5 max-w-[85%] self-start">
          <div className="bg-slate-100 border border-slate-150 rounded-lg p-1.5 flex flex-col gap-1 shadow-sm">
            <p className="text-[7.5px] text-slate-700">How would you approach scaling a database for 10M active users?</p>
          </div>
        </div>
        
        {/* Message 2 (Candidate) */}
        <div className="flex gap-1.5 max-w-[80%] self-end">
          <div className="bg-indigo-600 text-white rounded-lg p-1.5 shadow-sm">
            <p className="text-[7.5px] leading-relaxed">I would use horizontal sharding, implement Redis, and set up read replicas...</p>
          </div>
        </div>
        
        {/* Message 3 (AI Smart Follow-up) */}
        <div className="flex gap-1.5 max-w-[85%] self-start border-l-2 border-indigo-500 pl-1 animate-pulse">
          <div className="bg-indigo-50/80 border border-indigo-100 rounded-lg p-1.5">
            <p className="text-[7.5px] text-indigo-700 font-medium flex flex-col gap-0.5">
              <span className="text-[6px] font-bold text-indigo-600">💡 Smart Follow-up:</span>
              <span className="text-slate-700">How would you handle eventual consistency in sharding?</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Audio Waveform Animating */}
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

const AutopilotVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-teal-500/5 rounded-full blur-2xl -top-10 -right-10 group-hover:bg-teal-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Interview Pipeline</span>
        <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full">
          <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[6px] text-emerald-700 font-bold uppercase tracking-wider">Autopilot ON</span>
        </div>
      </div>
      
      {/* Autopilot Pipeline visual */}
      <div className="flex-1 flex flex-col gap-1.5 justify-center py-1">
        {/* Row 1 */}
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
        
        {/* Row 2 */}
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
        
        {/* Row 3 */}
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
      
      {/* Mini Stats Banner */}
      <div className="text-[6.5px] text-slate-500 border-t border-slate-100 pt-1.5 flex justify-between">
        <span>Screened: <strong className="text-slate-800">12 Candidates</strong></span>
        <span className="text-indigo-600 font-bold">Time Saved: 18.5h</span>
      </div>
    </div>
  </div>
);

const SmartScoringVisual = () => (
  <div className="w-full h-full bg-slate-55/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -bottom-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Consensus Scoring</span>
        <span className="text-[7px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 font-bold">Dual AI Audit</span>
      </div>
      
      {/* Dynamic Radial and comparison charts */}
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1">
        {/* Radial gauge */}
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
        
        {/* Breakdown Panel */}
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
      
      {/* Footer Consensus status */}
      <div className="bg-emerald-50 border border-emerald-100 rounded p-1 flex items-center justify-between">
        <span className="text-[6.5px] text-emerald-700 font-bold uppercase tracking-wider">Consensus Reached ✓</span>
        <span className="text-[6.5px] text-slate-500">Diff: &lt; 2%</span>
      </div>
    </div>
  </div>
);

const DiscrepancyVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-amber-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-amber-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Header with mismatch alert */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
        <span className="text-[9px] font-bold text-slate-800">Fact-Check Engine</span>
        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded text-amber-700 text-[7px] font-bold animate-pulse">
          <span>⚠️ 1 Flag Detected</span>
        </div>
      </div>
      
      {/* Discrepancy split panels */}
      <div className="flex-1 flex gap-2 justify-center items-center py-1.5">
        {/* Resume CV data panel */}
        <div className="w-1/2 bg-slate-50 p-1.5 rounded border border-slate-150 flex flex-col gap-1 h-full justify-center">
          <span className="text-[5.5px] text-slate-500 font-bold uppercase tracking-wider">Resume Claims</span>
          <div className="bg-white p-1 rounded border border-slate-200 shadow-sm">
            <span className="text-[6.5px] text-slate-700 font-bold">AWS Kubernetes</span>
            <p className="text-[5px] text-slate-450 mt-0.5">"Led deployments in prod..."</p>
          </div>
        </div>
        
        {/* Answer verification panel */}
        <div className="w-1/2 bg-amber-50 border border-amber-100 p-1.5 rounded flex flex-col gap-1 h-full justify-center">
          <span className="text-[5.5px] text-amber-700 font-bold uppercase tracking-wider">Interview Response</span>
          <div className="bg-white p-1 rounded border border-amber-200 shadow-sm">
            <span className="text-[6.5px] text-amber-650 font-bold">"Never deployed K8s..."</span>
            <p className="text-[5px] text-amber-500 mt-0.5">Admitted to only theoretical knowledge.</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Alert detail */}
      <div className="bg-amber-50 border border-amber-100 rounded p-1 text-center text-amber-700 text-[6.5px] font-bold uppercase tracking-wider">
        AI Alert: Skills Mismatch Flagged
      </div>
    </div>
  </div>
);

const AntiCheatVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-rose-500/5 rounded-full blur-2xl -bottom-10 -right-10 group-hover:bg-rose-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-slate-800">Security Proctoring</span>
        <div className="flex items-center gap-1 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded text-rose-600 text-[6px] font-bold">
          <span className="w-1 h-1 rounded-full bg-rose-450 animate-pulse" />
          <span>ACTIVE MONITORING</span>
        </div>
      </div>
      
      {/* Proctored screen overlay */}
      <div className="flex-1 flex gap-2.5 justify-center items-center py-1.5">
        {/* Countdown Ring */}
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
        
        {/* Anti-cheat checklist */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center gap-1 text-[7.5px] text-slate-700 font-medium">
            <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[6px] text-emerald-600 font-bold">✓</div>
            <span>Adaptive Interviewing</span>
          </div>
          
          <div className="flex items-center gap-1 text-[7.5px] text-slate-700 font-medium">
            <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[6px] text-emerald-600 font-bold">✓</div>
            <span>Clipboard Blocked</span>
          </div>
          
          <div className="flex items-center gap-1 text-[7.5px] text-slate-700 font-medium">
            <div className="w-3 h-3 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[6px] text-emerald-600 font-bold">✓</div>
            <span>Focus Track Active</span>
          </div>
        </div>
      </div>
      
      {/* Proctoring status notification */}
      <div className="bg-emerald-50 border border-emerald-100 rounded p-1 flex items-center justify-center gap-1">
        <svg className="w-2.5 h-2.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
        <span className="text-[6.5px] text-emerald-700 font-bold uppercase tracking-wider">Verified Authentic Response</span>
      </div>
    </div>
  </div>
);

const CVParsingVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -right-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Top Banner */}
      <div className="flex justify-between items-center pb-1 border-b border-slate-100">
        <span className="text-[9px] font-bold text-slate-800">CV Extraction Engine</span>
        <span className="text-[6px] text-indigo-650 bg-indigo-50 px-1.5 rounded font-mono font-bold">PARSING</span>
      </div>
      
      {/* Scanning effect and parsed fields */}
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1.5 relative">
        {/* Resume document container */}
        <div className="w-16 h-20 bg-slate-50 rounded border border-slate-200 relative overflow-hidden flex flex-col p-1.5 gap-1.5 justify-center shadow-sm">
          <div className="w-6 h-1.5 bg-slate-300 rounded-full" />
          <div className="w-10 h-0.5 bg-slate-200 rounded-full" />
          
          <div className="w-full flex flex-col gap-0.5 mt-0.5 opacity-70">
            <div className="w-full h-0.5 bg-indigo-500/20 rounded-full" />
            <div className="w-3/4 h-0.5 bg-indigo-500/20 rounded-full" />
            <div className="w-5/6 h-0.5 bg-indigo-500/20 rounded-full" />
          </div>
          
          {/* Neon laser scan line */}
          <div className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_6px_#6366f1] animate-[scan_2.8s_infinite] opacity-80" />
        </div>
        
        {/* Extracted fields panel */}
        <div className="flex-1 flex flex-col gap-1 justify-center">
          <div className="bg-slate-50 p-1 rounded border border-slate-150 flex items-center justify-between">
            <span className="text-[5.5px] text-slate-500 font-bold uppercase">NAME</span>
            <span className="text-[7.5px] text-slate-800 font-bold leading-none">Jonathan D.</span>
          </div>
          
          <div className="bg-slate-50 p-1 rounded border border-slate-150 flex items-center justify-between">
            <span className="text-[5.5px] text-slate-500 font-bold uppercase">SKILLS</span>
            <span className="text-[7.5px] text-indigo-600 font-bold leading-none">React, Go, AWS</span>
          </div>
          
          <div className="bg-slate-50 p-1 rounded border border-slate-150 flex items-center justify-between">
            <span className="text-[5.5px] text-slate-500 font-bold uppercase">EXP</span>
            <span className="text-[7.5px] text-emerald-705 font-bold leading-none">5+ Years</span>
          </div>
        </div>
      </div>
      
      {/* Progress parsing status */}
      <div className="text-[6px] text-slate-500 text-center border-t border-slate-100 pt-1">
        Parsed from <strong className="text-slate-700 font-mono">resume-doc.pdf</strong>
      </div>
    </div>
  </div>
);

const CandidateInsightsVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-purple-500/5 rounded-full blur-2xl -bottom-10 -left-10 group-hover:bg-purple-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between">
      {/* Header */}
      <div className="flex justify-between items-center">
        <span className="text-[9px] font-bold text-slate-800">Insight Skill Vector</span>
        <span className="text-[6.5px] text-purple-650 bg-purple-50 border border-purple-100 px-2 rounded-full font-bold">Metrics</span>
      </div>
      
      {/* Radar style spiderweb visualization */}
      <div className="flex-1 flex gap-2.5 items-center justify-center py-1">
        {/* Stylized Radar Web Graphic */}
        <div className="w-12 h-12 relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full border border-slate-200" />
          <div className="absolute w-8 h-8 rounded-full border border-slate-200" />
          <div className="absolute w-4 h-4 rounded-full border border-slate-200" />
          {/* Radar axis lines */}
          <div className="absolute w-full h-px bg-slate-100" />
          <div className="absolute w-px h-full bg-slate-100" />
          
          {/* Interactive candidate fit polygon */}
          <svg className="absolute w-full h-full" viewBox="0 0 64 64">
            <polygon points="32,10 52,22 46,46 18,38 12,24" fill="rgba(139, 92, 246, 0.15)" stroke="#8B5CF6" strokeWidth="1" />
            <circle cx="32" cy="10" r="1.5" fill="#8B5CF6" />
            <circle cx="52" cy="22" r="1.5" fill="#8B5CF6" />
            <circle cx="46" cy="46" r="1.5" fill="#8B5CF6" />
            <circle cx="18" cy="38" r="1.5" fill="#8B5CF6" />
            <circle cx="12" cy="24" r="1.5" fill="#8B5CF6" />
          </svg>
        </div>
        
        {/* Score metrics list */}
        <div className="flex-1 flex flex-col gap-1 justify-center">
          <div className="flex justify-between text-[6.5px] font-semibold text-slate-500 leading-none">
            <span>Communication</span>
            <span className="text-slate-800">9/10</span>
          </div>
          
          <div className="flex justify-between text-[6.5px] font-semibold text-slate-500 leading-none">
            <span>Tech Depth</span>
            <span className="text-slate-800">9.5/10</span>
          </div>
          
          <div className="flex justify-between text-[6.5px] font-semibold text-slate-500 leading-none">
            <span>Leadership</span>
            <span className="text-slate-800">8.5/10</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Insights rating */}
      <div className="bg-slate-50 p-1 rounded border border-slate-150 flex justify-between items-center text-[6.5px] text-slate-500">
        <span>Session: <strong className="text-slate-700">22m</strong></span>
        <span className="text-purple-650 font-bold uppercase tracking-wide">Elite Fit Rank</span>
      </div>
    </div>
  </div>
);

const EmailNotificationsVisual = () => (
  <div className="w-full h-full bg-slate-50/60 flex items-center justify-center p-4 relative overflow-hidden group">
    {/* Background Glow */}
    <div className="absolute w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -top-10 -left-10 group-hover:bg-indigo-500/10 transition-all duration-700" />
    
    <div className="w-11/12 h-5/6 bg-white border border-slate-200/80 rounded-xl overflow-hidden flex flex-col shadow-md p-2.5 justify-between animate-pulse-slow">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
        <span className="text-[9px] font-bold text-slate-800">Alerts System</span>
        <span className="text-[6.5px] text-indigo-600 bg-indigo-50 px-1.5 rounded font-bold font-mono">EMAIL</span>
      </div>
      
      {/* Email Inbox floating popup visual */}
      <div className="flex-1 flex items-center justify-center py-1.5">
        {/* Floating email card */}
        <div className="w-11/12 bg-white rounded border border-indigo-100 p-2 flex flex-col gap-1 shadow-md animate-[float_4s_infinite]">
          {/* Subject Line */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-1">
            <span className="text-[7.5px] font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
              <span>📬 AI Shortlist Ready!</span>
            </span>
            <span className="text-[5.5px] text-slate-400 font-mono">Just Now</span>
          </div>
          
          {/* Email brief description */}
          <p className="text-[6.5px] text-slate-500 leading-relaxed">
            3 candidates finished screening. High-quality shortlist is ready to review.
          </p>
          
          {/* Call-to-action button */}
          <div className="h-3.5 bg-indigo-600 hover:bg-indigo-700 rounded flex items-center justify-center font-bold text-[6.5px] text-white cursor-pointer select-none">
            Review Shortlist →
          </div>
        </div>
      </div>
      
      {/* Bottom notifications channels indicators */}
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

const FeatureVisual = ({ id }: { id: number }) => {
  switch (id) {
    case 1:
      return <BrandBrandingVisual />;
    case 2:
      return <AIHumanVisual />;
    case 3:
      return <AutopilotVisual />;
    case 4:
      return <SmartScoringVisual />;
    case 5:
      return <DiscrepancyVisual />;
    case 6:
      return <AntiCheatVisual />;
    case 7:
      return <CVParsingVisual />;
    case 8:
      return <CandidateInsightsVisual />;
    case 9:
      return <EmailNotificationsVisual />;
    default:
      return null;
  }
};

const slides = [
  {
    id: 1,
    image: "/landing/images/white-label-branding.png",
    title: "Your Brand, Your Interview",
    description:
      "Custom branding per job. Your logo, colours, and company name throughout the interview.",
  },
  {
    id: 2,
    image: "/landing/images/ai-interview.png",
    title: "AI That Feels Human",
    description:
      "Natural conversations that dig deeper with follow-up questions tailored to each response.",
  },
  {
    id: 3,
    image: "/landing/images/interviews-autopilot.png",
    title: "Interviews on Autopilot",
    description:
      "Candidates complete interviews on their schedule. No calls, no scheduling, no no-shows.",
  },
  {
    id: 4,
    image: "/landing/images/smart-scoring.png",
    title: "Smart Scoring System",
    description:
      "Dual-agent AI consensus ensures accurate, unbiased match scores for fair, reliable rankings.",
  },
  {
    id: 5,
    image: "/landing/images/discrepancy-detection.png",
    title: "Discrepancy Detection",
    description:
      "AI flags mismatches between CV claims and interview answers to catch embellishments.",
  },
  {
    id: 6,
    image: "/landing/images/anti-cheat.png",
    title: "Anti-Cheat Protection",
    description:
      "Optional timed questions and follow-up questions ensure authentic candidate responses.",
  },
  {
    id: 7,
    image: "/landing/images/cv-parsing.png",
    title: "CV Parsing",
    description:
      "Automatically extract and analyze key information from candidate CVs to save time.",
  },
  {
    id: 8,
    image: "/landing/images/candidate-insights.png",
    title: "Candidate Insights",
    description:
      "Deep analysis of candidate responses with detailed scoring breakdowns.",
  },
  {
    id: 9,
    image: "/landing/images/email-notifications.png",
    title: "Email Notifications",
    description:
      "Automatic email updates when candidates complete interviews or when shortlists are ready.",
  },
];

export const ProductShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    if (trackRef.current) {
      trackRef.current.style.cursor = "grabbing";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    setTranslateX(deltaX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (trackRef.current) {
      trackRef.current.style.cursor = "grab";
    }

    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    setTranslateX(0);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (track) {
      const slideWidth = 33.333;
      track.style.transform = `translateX(calc(-${currentIndex * slideWidth}% + ${translateX}px))`;
    }
  }, [currentIndex, translateX]);

  return (
    <section className="product-showcase py-20 bg-white">
      {/* CSS Animation Keyframes */}
      <style>{`
        @keyframes scan {
          0% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(68px); opacity: 1; }
          100% { transform: translateY(0px); opacity: 0.6; }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.25; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.04); }
        }
        @keyframes wave {
          0%, 100% { height: 4px; }
          50% { height: 14px; }
        }
      `}</style>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="carousel-header text-center mb-16">
          <p
            className="carousel-headline-small"
            style={{
              color: "#1F2937",
              fontSize: "24px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              margin: "0px 0px 8px",
              fontWeight: "400",
            }}
          >
            <span className="hw" style={{ fontWeight: "600" }}>
              Powerful
            </span>{" "}
            Features.
          </p>
          <h2
            className="carousel-headline"
            style={{
              color: "#1F2937",
              fontSize: "40px",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: "bold",
              margin: 0,
            }}
          >
            Everything you need to screen candidates efficiently.
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="showcase-carousel overflow-hidden"
          style={{ cursor: "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            ref={trackRef}
            className="carousel-track flex transition-transform duration-500 ease-out"
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="carousel-slide flex-shrink-0 px-3"
                style={{ width: "33.333%" }}
              >
                <div className="media-card bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="media-card-image h-56 w-full relative overflow-hidden bg-slate-50/50 border-b border-slate-100">
                    <FeatureVisual id={slide.id} />
                  </div>
                  <div className="media-card-content p-6">
                    <h3
                      className="media-card-title"
                      style={{
                        fontSize: "20px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: "bold",
                        color: "#1F2937",
                        marginBottom: "12px",
                      }}
                    >
                      {slide.title}
                    </h3>
                    <p
                      className="media-card-description"
                      style={{
                        fontSize: "14px",
                        fontFamily: "'Inter', sans-serif",
                        color: "#4B5563",
                        lineHeight: "1.6",
                      }}
                    >
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="carousel-nav flex items-center justify-center gap-4 mt-8">
          <button
            className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={prevSlide}
            aria-label="Previous slide"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div className="carousel-dots flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot rounded-full transition-all ${
                  currentIndex === index
                    ? "w-6 bg-indigo-600"
                    : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                }`}
                style={{ height: "8px" }}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            className="carousel-btn w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            onClick={nextSlide}
            aria-label="Next slide"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
