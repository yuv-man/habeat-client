import { ReactNode } from "react";

interface ProgressBarProps {
  icon: ReactNode;
  label: string;
  current: number;
  goal: number;
  color: string;
  unit: string;
  dashboard?: boolean;
}

const ProgressBar = ({ icon, label, current, goal, color, unit, dashboard }: ProgressBarProps) => {
  const progress = (current / goal) * 100;
  const remaining = goal - current;

  return (
    <div className="w-full mb-4">
      <div className="flex items-center justify-between flex-row"> 
        <div className="flex items-center justify-center flex-row gap-1">
          {icon}
          <span className="text-sm font-semibold">{label}</span>
        </div>
        {dashboard && (
          <div className="flex items-center justify-center flex-row gap-1">
            <div className="text-lg font-bold" style={{ color }}>{remaining}</div>
            <div className="text-sm text-gray-600">{unit} left</div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-1 flex items-center">
          <div 
            className="h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: color
            }}
          ></div>
        </div>
      </div>
      {!dashboard && (
        <div className="text-sm mt-2 opacity-90 flex flex-row items-center justify-between">
        <div>{Math.round(progress)}% Complete</div>
        <div className="font-semibold">{current} of {goal} {unit}</div>
      </div>
      )}
    </div>
  );
};

export default ProgressBar;
