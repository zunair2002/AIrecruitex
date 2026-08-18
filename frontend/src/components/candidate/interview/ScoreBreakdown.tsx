type ScoreBarProps = {
  label: string;
  score: number;
  gradient: string;
};

export function ScoreBar({ label, score, gradient }: ScoreBarProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{score}%</p>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500`}
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
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
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
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-4xl font-bold text-gray-900">{score}%</p>
        <p className="text-xs text-gray-500 font-medium mt-1">Final Score</p>
      </div>
    </div>
  );
}
