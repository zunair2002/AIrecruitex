export const ShowcaseStyles = () => (
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
);
