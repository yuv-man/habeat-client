const CircularProgress = ({ progress, value, label, color, size = 80, icon, isChanged }: { 
    progress: number; 
    value: string; 
    label: string; 
    color: string; 
    size?: number;
    icon?: string;
    isChanged?: number;
  }) => {
    const radius = (size - 8) / 2;
    const startAngle = 140; // Start angle in degrees (startAngle + 180)
    const endAngle = 400; // End angle in degrees (endAngle + 180)
    const totalAngle = endAngle - startAngle; // Total arc angle
    
    // Convert angles to radians and calculate arc length
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate progress within the arc
    const progressAngle = startAngle + (progress / 100) * totalAngle;
    const progressRad = (progressAngle * Math.PI) / 180;
    
    // Create SVG path for the arc
    const createArcPath = (startAngleRad: number, endAngleRad: number) => {
      const x1 = size / 2 + radius * Math.cos(startAngleRad);
      const y1 = size / 2 + radius * Math.sin(startAngleRad);
      const x2 = size / 2 + radius * Math.cos(endAngleRad);
      const y2 = size / 2 + radius * Math.sin(endAngleRad);
      
      const largeArcFlag = Math.abs(endAngleRad - startAngleRad) > Math.PI ? 1 : 0;
      
      return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
    };

    return (
      <div className="text-center">
        <div className="relative inline-block">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background arc */}
            <path
              d={createArcPath(startRad, endRad)}
              stroke="#e5e7eb"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d={createArcPath(startRad, progressRad)}
              stroke={color}
              strokeWidth="8"
              fill="transparent"
              strokeLinecap="round"
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {icon && <img src={icon} alt="icon" className="w-8 h-8"/>}
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  export default CircularProgress;