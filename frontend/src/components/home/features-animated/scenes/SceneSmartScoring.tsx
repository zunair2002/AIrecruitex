export function SceneSmartScoring() {
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
