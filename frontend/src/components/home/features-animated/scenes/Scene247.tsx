export function Scene247() {
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
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#6366f1", fontWeight: 700, textAlign: "center" }}>ðŸ‡¬ðŸ‡§ London</div>
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
        <div style={{ marginTop: "8px", fontSize: "9px", color: "#6366f1", fontWeight: 700, textAlign: "center" }}>ðŸ‡ºðŸ‡¸ New York</div>
      </div>
    </div>
  );
}
