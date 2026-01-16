
interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  label,
  className = '',
}: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold text-gray-700">{label}</span>
          <span className="text-sm font-bold bg-gradient-to-r from-rose to-light-pink bg-clip-text text-transparent">
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className="w-full bg-white/60 rounded-full h-5 md:h-4 overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-rose to-light-pink h-full rounded-full transition-all duration-700 ease-out shadow-sm relative overflow-hidden"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full progress-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

