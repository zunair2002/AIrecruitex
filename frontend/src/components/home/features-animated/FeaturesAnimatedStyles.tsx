export const FeaturesAnimatedStyles = () => (
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
);
