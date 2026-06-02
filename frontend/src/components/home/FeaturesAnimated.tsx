"use client";

import { useState } from "react";

// ─── Feature Pills Data ────────────────────────────────────────────────────────
const morePills = [
  { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "Anti-Cheat Protection", desc: "Blocks copy/paste and tracks tab switches during interviews to ensure honest responses." },
  { icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, label: "Optional Timed Questions", desc: "Set time limits per question to keep interviews focused and moving." },
  { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, label: "Optional Follow-up Questions", desc: "AI automatically probes deeper when candidate answers are vague or incomplete." },
  { icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></>, label: "White-Label Branding", desc: "Use your own logo, colours, and AI assistant name so candidates see your brand." },
  { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>, label: "CV Parsing", desc: "Automatically extracts skills, experience, and education from uploaded CVs." },
  { icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, label: "Candidate Insights", desc: "AI-generated summary of candidate strengths, weaknesses, and overall fit." },
  { icon: <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>, label: "Scoring Breakdown", desc: "See exactly how the match score was calculated across each competency." },
  { icon: <><line x1="12" y1="3" x2="12" y2="21" /><path d="M5 8l7-2 7 2" /><circle cx="5" cy="12" r="3" /><circle cx="19" cy="12" r="3" /></>, label: "Bias-Free Scoring", desc: "Candidates are scored purely on merit. Age, gender, ethnicity don't influence scores." },
  { icon: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>, label: "Email Notifications", desc: "Get notified instantly when candidates complete their interviews." },
  { icon: <><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" /><line x1="12" y1="22" x2="12" y2="11" /><line x1="3" y1="7" x2="12" y2="11" /><line x1="21" y1="7" x2="12" y2="11" /></>, label: "Manual & Auto Top-up", desc: "Add credits manually or set automatic top-up when your balance runs low." },
  { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></>, label: "Custom CSV Export", desc: "Export candidate data to CSV with your choice of fields and filters." },
  { icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></>, label: "Candidate Report PDF", desc: "Download a formatted PDF report for any candidate to share with your team." },
  { icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>, label: "Custom Interviewer Name", desc: "Replace the default AI name with your own brand name for a seamless experience." },
  { icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></>, label: "Deep Analysis", desc: "Premium AI deep-dive analysis using advanced models for detailed candidate evaluation." },
  { icon: <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>, label: "Tailored Interview Questions", desc: "AI generates interview questions specific to your job description and requirements." },
  { icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>, label: "Candidate Red Flags", desc: "AI highlights potential concerns, inconsistencies, or red flags in candidate responses." },
  { icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="13" y2="13" /></>, label: "Interview Transcript", desc: "Full conversation record of each AI interview for review and compliance." },
  { icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>, label: "GDPR Delete Data Button", desc: "One-click deletion of all candidate data for GDPR compliance requests." },
];

// ─── Scene Components ──────────────────────────────────────────────────────────

function SceneTwoStage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
      <style>{`
        @keyframes cvFloat {
          0%,100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-6px) rotate(2deg); }
        }
        @keyframes typingBounce {
          0%,80%,100% { transform: translateY(0); opacity:.4; }
          40% { transform: translateY(-5px); opacity:1; }
        }
        @keyframes pipelinePulse {
          0%,100% { opacity:.3; }
          50% { opacity:1; }
        }
        @keyframes filterGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50% { box-shadow: 0 0 16px 4px rgba(99,102,241,0.25); }
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "center" }}>
        {/* CV Pile */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ position: "relative", width: "54px", height: "68px" }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{
                position: "absolute",
                width: "44px", height: "56px",
                background: i === 0 ? "#fff" : `hsl(220,20%,${96 - i * 3}%)`,
                border: "1px solid #e2e8f0",
                borderRadius: "4px",
                top: `${i * 3}px`, left: `${i * 2}px`,
                boxShadow: "0 1px 3px rgba(0,0,0,.08)",
                animation: `cvFloat ${1.2 + i * 0.2}s ease-in-out infinite`,
              }}>
                {i === 0 && (
                  <div style={{ padding: "6px 5px", display: "flex", flexDirection: "column", gap: "3px" }}>
                    {[70,55,80,50].map((w, j) => (
                      <div key={j} style={{ height: "3px", width: `${w}%`, background: "#cbd5e1", borderRadius: "2px" }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>50 CVs</div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>received</div>
        </div>

        {/* Arrow line */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <div style={{ width: "24px", height: "2px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: "2px", animation: "pipelinePulse 1.5s infinite" }} />
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ fill: "#6366f1" }}><polygon points="0,0 8,4 0,8" /></svg>
        </div>

        {/* Filter Gate */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{
            width: "52px", height: "52px",
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "filterGlow 2s ease-in-out infinite",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>CV Screen</div>
          <div style={{ fontSize: "10px", color: "#6366f1", fontWeight: 600 }}>8 pass</div>
        </div>

        {/* Arrow line */}
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <div style={{ width: "24px", height: "2px", background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", borderRadius: "2px", animation: "pipelinePulse 1.5s infinite 0.3s" }} />
          <svg width="8" height="8" viewBox="0 0 8 8" style={{ fill: "#8b5cf6" }}><polygon points="0,0 8,4 0,8" /></svg>
        </div>

        {/* Interview Box */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "60px", height: "52px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", padding: "8px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {[{w:"70%",c:"#e0e7ff"},{w:"50%",c:"#ede9fe"},{w:"65%",c:"#e0e7ff"},{w:"45%",c:"#ede9fe"}].map((l,i) => (
                <div key={i} style={{ height: "4px", width: l.w, background: l.c, borderRadius: "2px" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "3px", marginTop: "5px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6366f1", animation: `typingBounce 1.2s infinite ${i * 0.2}s` }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>Interview</div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>8 candidates</div>
        </div>
      </div>
    </div>
  );
}

function Scene247() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", width: "100%" }}>
      <style>{`
        @keyframes clockMinute { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes clockHour { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes statusBlink { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes chatSlide { 0% { opacity:0; transform:translateX(-8px); } 100% { opacity:1; transform:translateX(0); } }
      `}</style>

      {/* Left Device */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "12px", width: "90px", padding: "10px", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>9:42 AM</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "statusBlink 2s infinite" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {[{w:"80%",align:"flex-start",c:"#e0e7ff"},{w:"60%",align:"flex-end",c:"#ede9fe"},{w:"75%",align:"flex-start",c:"#e0e7ff"}].map((l,i) => (
            <div key={i} style={{ display: "flex", justifyContent: l.align }}>
              <div style={{ height: "5px", width: l.w, background: l.c, borderRadius: "3px", animation: `chatSlide 0.5s ease ${i*0.15}s both` }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#6366f1", animation: `typingBounce 1.2s infinite ${i*0.2}s` }} />
            ))}
          </div>
        </div>
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#6366f1", fontWeight: 700, textAlign: "center" }}>🇬🇧 London</div>
      </div>

      {/* Clock Hub */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "50%",
          border: "3px solid #6366f1",
          background: "linear-gradient(135deg,#e0e7ff,#ede9fe)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          boxShadow: "0 0 20px rgba(99,102,241,0.2)",
        }}>
          <div style={{ position: "absolute", width: "2px", height: "18px", background: "#4f46e5", borderRadius: "2px", bottom: "50%", left: "50%", transformOrigin: "bottom", transform: "translateX(-50%)", animation: "clockHour 43200s linear infinite" }} />
          <div style={{ position: "absolute", width: "1.5px", height: "22px", background: "#7c3aed", borderRadius: "2px", bottom: "50%", left: "50%", transformOrigin: "bottom", transform: "translateX(-50%) rotate(90deg)", animation: "clockMinute 3600s linear infinite" }} />
          <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4f46e5", zIndex: 2 }} />
        </div>
        <span style={{ fontSize: "13px", fontWeight: 800, color: "#4f46e5", letterSpacing: "-0.5px" }}>24/7</span>
      </div>

      {/* Right Device */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "12px", width: "90px", padding: "10px", boxShadow: "0 4px 16px rgba(0,0,0,.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 600 }}>7:42 PM</span>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", animation: "statusBlink 2s infinite 0.5s" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {[{w:"70%",align:"flex-start",c:"#e0e7ff"},{w:"55%",align:"flex-end",c:"#ede9fe"},{w:"80%",align:"flex-start",c:"#e0e7ff"}].map((l,i) => (
            <div key={i} style={{ display: "flex", justifyContent: l.align }}>
              <div style={{ height: "5px", width: l.w, background: l.c, borderRadius: "3px" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "3px", marginTop: "2px" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#8b5cf6", animation: `typingBounce 1.2s infinite ${i*0.2+0.4}s` }} />
            ))}
          </div>
        </div>
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#6366f1", fontWeight: 700, textAlign: "center" }}>🇺🇸 New York</div>
      </div>
    </div>
  );
}

function SceneSmartScoring() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", width: "100%" }}>
      <style>{`
        @keyframes convoDot { 0%,100%{opacity:.2;transform:scale(1);} 50%{opacity:1;transform:scale(1.3);} }
        @keyframes scoreCount { 0%{opacity:0;transform:scale(.7);} 100%{opacity:1;transform:scale(1);} }
      `}</style>

      {/* Interview Doc */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <div style={{ width: "48px", height: "60px", background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "8px", padding: "8px", display: "flex", flexDirection: "column", gap: "4px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
          {[80,60,90,50,70,55].map((w,i) => (
            <div key={i} style={{ height: "3px", width: `${w}%`, background: "#e2e8f0", borderRadius: "2px" }} />
          ))}
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Interview</div>
      </div>

      <div style={{ width: "20px", height: "2px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)", borderRadius: "2px" }} />

      {/* AI Agents */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[{label:"Agent 1",score:"84",delay:0},{label:"Agent 2",score:"88",delay:0.3}].map((a,i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg,#e0e7ff,#ede9fe)", border: "1.5px solid #c7d2fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                <path d="M12 5v14M9 9h6M8 13h8" />
              </svg>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "9px", color: "#94a3b8", fontWeight: 600 }}>{a.label}</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "#4f46e5", lineHeight: 1 }}>{a.score}<span style={{ fontSize: "10px" }}>%</span></span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ width: "20px", height: "2px", background: "linear-gradient(90deg,#8b5cf6,#a78bfa)", borderRadius: "2px" }} />

      {/* Final Score */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <div style={{
          width: "64px", height: "64px", borderRadius: "16px",
          background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(99,102,241,0.35)",
          animation: "scoreCount 0.6s ease both",
        }}>
          <span style={{ fontSize: "22px", fontWeight: 900, color: "#fff", lineHeight: 1 }}>86</span>
          <span style={{ fontSize: "10px", color: "#c7d2fe", fontWeight: 600 }}>%</span>
        </div>
        <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>Match Score</div>
      </div>
    </div>
  );
}

function SceneDiscrepancy() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", position: "relative", width: "100%" }}>
      <style>{`
        @keyframes alertPulse { 0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(239,68,68,0.4);} 50%{transform:scale(1.08);box-shadow:0 0 0 8px rgba(239,68,68,0);} }
      `}</style>

      {/* CV Claims Panel */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", width: "90px", padding: "10px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", textAlign: "center" }}>CV Claims</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[true,true,false,true,true].map((ok,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", background: !ok ? "#fef2f2" : "transparent", borderRadius: "4px", padding: "2px 4px" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: ok ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ok
                  ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                }
              </div>
              <div style={{ height: "3px", flex: 1, background: ok ? "#e2e8f0" : "#fca5a5", borderRadius: "2px" }} />
            </div>
          ))}
        </div>
      </div>

      {/* Alert Badge */}
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: "#ef4444",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        animation: "alertPulse 2s ease-in-out infinite",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      {/* Interview Panel */}
      <div style={{ background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", width: "90px", padding: "10px", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
        <div style={{ fontSize: "9px", fontWeight: 700, color: "#1e293b", marginBottom: "8px", textAlign: "center" }}>Interview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {[true,false,true,true,false].map((ok,i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px", background: !ok ? "#fef2f2" : "transparent", borderRadius: "4px", padding: "2px 4px" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: ok ? "#dcfce7" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {ok
                  ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                }
              </div>
              <div style={{ height: "3px", flex: 1, background: ok ? "#e2e8f0" : "#fca5a5", borderRadius: "2px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scenes Config ─────────────────────────────────────────────────────────────
const scenes = [
  {
    visual: <SceneTwoStage />,
    title: "Two-Stage Screening",
    desc: "Quick CV filter first, deep interviews only for promising candidates. Save credits and time by eliminating poor fits early in the process.",
  },
  {
    visual: <Scene247 />,
    title: "24/7 AI Interviews",
    desc: "Candidates interview on their schedule — no diary juggling or timezone coordination. Multiple interviews run in parallel, anywhere in the world, 24/7.",
  },
  {
    visual: <SceneSmartScoring />,
    title: "Smart Scoring",
    desc: "Dual-agent AI consensus ensures accurate, unbiased match scores. Two AI reviewers independently evaluate each candidate, then reconcile for fair, reliable rankings.",
  },
  {
    visual: <SceneDiscrepancy />,
    title: "Discrepancy Detection",
    desc: "AI flags mismatches between CV claims and interview answers. Catch embellishments automatically before they become costly hiring mistakes.",
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────
export function FeaturesAnimated() {
  const [activeScene, setActiveScene] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [openPill, setOpenPill] = useState<number | null>(null);

  const prev = () => setActiveScene(s => (s === 0 ? scenes.length - 1 : s - 1));
  const next = () => setActiveScene(s => (s === scenes.length - 1 ? 0 : s + 1));

  return (
    <section id="features" style={{ background: "#f8fafc", padding: "80px 0", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @keyframes typingBounce { 0%,80%,100%{transform:translateY(0);opacity:.4;} 40%{transform:translateY(-5px);opacity:1;} }
        .feat-scene-card { transition: box-shadow 0.2s; }
        .feat-scene-card:hover { box-shadow: 0 8px 32px rgba(99,102,241,0.12) !important; }
        .feat-pill-item { transition: background 0.2s, box-shadow 0.2s; cursor: pointer; }
        .feat-pill-item:hover { background: #e0e7ff !important; }
        .more-toggle-btn { transition: background 0.2s; }
        .more-toggle-btn:hover { background: #e0e7ff !important; }
        .nav-dot-btn { transition: background 0.15s, transform 0.15s; }
        .nav-dot-btn:hover { transform: scale(1.2); }
        .nav-arrow-btn { transition: background 0.15s; }
        .nav-arrow-btn:hover { background: #e0e7ff !important; }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px" }}>

        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ fontSize: "14px", fontWeight: 700, color: "#6366f1", marginBottom: "8px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ✦ Powerful Features
          </p>
          <h2 style={{ fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.15, margin: 0 }}>
            Everything you need to screen<br />candidates efficiently.
          </h2>
        </div>

        {/* Carousel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

          {/* Desktop: 2-column grid */}
          <div className="feat-scene-card" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
            background: "#fff",
            border: "1.5px solid #e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 4px 24px rgba(0,0,0,.06)",
          }}>
            {/* Visual */}
            <div style={{
              background: "linear-gradient(135deg,#f0f4ff 0%,#f5f0ff 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              minHeight: "260px",
              padding: "40px 24px",
              borderRight: "1.5px solid #e2e8f0",
            }}>
              {scenes[activeScene].visual}
            </div>

            {/* Content */}
            <div style={{ padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px" }}>
              {/* Scene tabs */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                {scenes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveScene(i)}
                    style={{
                      fontSize: "12px", fontWeight: 600,
                      padding: "4px 12px", borderRadius: "20px",
                      border: i === activeScene ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                      background: i === activeScene ? "#6366f1" : "#fff",
                      color: i === activeScene ? "#fff" : "#64748b",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  {scenes[activeScene].title}
                </h3>
              </div>

              <p style={{ fontSize: "15px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                {scenes[activeScene].desc}
              </p>

              {/* Nav arrows */}
              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button onClick={prev} className="nav-arrow-btn" aria-label="Previous" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <button onClick={next} className="nav-arrow-btn" aria-label="Next" style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
                  {scenes.map((_, i) => (
                    <button key={i} onClick={() => setActiveScene(i)} className="nav-dot-btn" style={{ width: i === activeScene ? "20px" : "8px", height: "8px", borderRadius: "4px", border: "none", background: i === activeScene ? "#6366f1" : "#e2e8f0", cursor: "pointer", transition: "all 0.2s", padding: 0 }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Features Toggle */}
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>
          <button
            onClick={() => setShowMore(s => !s)}
            className="more-toggle-btn"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 24px", borderRadius: "24px",
              border: "1.5px solid #e2e8f0", background: "#fff",
              fontSize: "14px", fontWeight: 600, color: "#475569",
              cursor: "pointer",
            }}
          >
            <span>{showMore ? "Hide features" : "See more features"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: showMore ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {/* Pills Grid */}
          {showMore && (
            <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center" }}>
              {morePills.map((pill, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    className="feat-pill-item"
                    onClick={() => setOpenPill(openPill === i ? null : i)}
                    style={{
                      display: "flex", alignItems: "center", gap: "8px",
                      padding: "8px 16px", borderRadius: "24px",
                      border: openPill === i ? "1.5px solid #6366f1" : "1.5px solid #e2e8f0",
                      background: openPill === i ? "#e0e7ff" : "#fff",
                      fontSize: "13px", fontWeight: 600,
                      color: openPill === i ? "#4f46e5" : "#374151",
                      cursor: "pointer",
                      boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {pill.icon}
                    </svg>
                    {pill.label}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: openPill === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", marginLeft: "2px" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>
                  {openPill === i && (
                    <div style={{
                      marginTop: "6px",
                      padding: "10px 14px",
                      background: "#f0f4ff",
                      border: "1.5px solid #c7d2fe",
                      borderRadius: "12px",
                      fontSize: "12px", color: "#475569", lineHeight: 1.6,
                      maxWidth: "260px",
                    }}>
                      {pill.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
