type ScoreBarProps = {
  label: string;
  score: number;
  gradient: string;
};

export function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div className="bg-white rounded border border-[#f1f1f5] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-[#44464f]">{label}</p>
        <p className="text-2xl font-bold text-[#292b35]">{score}%</p>
      </div>
      <div className="h-3 bg-[#f3f3f6] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

type FinalScoreRingProps = {
  score: number;
};

export function FinalScoreRing({ score }: FinalScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF5A1F" />
            <stop offset="100%" stopColor="#E04A15" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-[#292b35]">{score}%</p>
        <p className="text-xs text-[#898b96] font-medium mt-1">Final Score</p>
      </div>
    </div>
  );
}
