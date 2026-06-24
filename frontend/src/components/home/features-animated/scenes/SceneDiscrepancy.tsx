export function SceneDiscrepancy() {
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
