export function SceneTwoStage() {
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
