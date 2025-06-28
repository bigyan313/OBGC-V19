import React from 'react';
import { BONDING_CURVE_POINTS, formatTokenCount } from '../utils/bondingCurve';

interface BondingCurveChartProps {
  currentClickCount: number;
  className?: string;
}

export const BondingCurveChart: React.FC<BondingCurveChartProps> = ({
  currentClickCount,
  className = ''
}) => {
  const maxClicks = 1000000000; // 1B
  const maxTokens = 500000; // 500K
  
  // Calculate positions for the chart
  const getXPosition = (clicks: number) => (clicks / maxClicks) * 100;
  const getYPosition = (tokens: number) => 100 - (tokens / maxTokens) * 100;
  
  // Generate path for the step chart
  const generatePath = () => {
    let path = '';
    
    for (let i = 0; i < BONDING_CURVE_POINTS.length; i++) {
      const point = BONDING_CURVE_POINTS[i];
      const x = getXPosition(point.clickCount);
      const y = getYPosition(point.requiredTokens);
      
      if (i === 0) {
        path += `M 0 ${y}`;
      }
      
      // Draw horizontal line to the point
      path += ` L ${x} ${y}`;
      
      // If not the last point, draw vertical line to next level
      if (i < BONDING_CURVE_POINTS.length - 1) {
        const nextPoint = BONDING_CURVE_POINTS[i + 1];
        const nextY = getYPosition(nextPoint.requiredTokens);
        path += ` L ${x} ${nextY}`;
      }
    }
    
    return path;
  };
  
  // Current position indicator
  const currentX = getXPosition(Math.min(currentClickCount, maxClicks));
  
  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          $OBGC Token Requirements
        </h3>
        <p className="text-slate-400 text-sm">
          Token requirements decrease as global clicks increase
        </p>
      </div>
      
      {/* Chart Container */}
      <div className="relative h-48 bg-black/20 rounded-lg border border-white/10 overflow-hidden">
        {/* SVG Chart */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Bonding curve */}
          <path
            d={generatePath()}
            fill="none"
            stroke="url(#bondingGradient)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Fill area under curve */}
          <path
            d={`${generatePath()} L 100 100 L 0 100 Z`}
            fill="url(#bondingFill)"
            opacity="0.3"
          />
          
          {/* Current position indicator */}
          <line
            x1={currentX}
            y1="0"
            x2={currentX}
            y2="100"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4,4"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Milestone points */}
          {BONDING_CURVE_POINTS.map((point, index) => (
            <circle
              key={index}
              cx={getXPosition(point.clickCount)}
              cy={getYPosition(point.requiredTokens)}
              r="2"
              fill={currentClickCount >= point.clickCount ? "#10b981" : "#8b5cf6"}
              stroke="white"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          
          {/* Gradients */}
          <defs>
            <linearGradient id="bondingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="bondingFill" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Y-axis labels (Token amounts) */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-2 -ml-12">
          <span className="text-xs text-slate-400">{formatTokenCount(maxTokens)}</span>
          <span className="text-xs text-slate-400">{formatTokenCount(maxTokens * 0.75)}</span>
          <span className="text-xs text-slate-400">{formatTokenCount(maxTokens * 0.5)}</span>
          <span className="text-xs text-slate-400">{formatTokenCount(maxTokens * 0.25)}</span>
          <span className="text-xs text-slate-400">0</span>
        </div>
        
        {/* Current position label */}
        {currentClickCount > 0 && (
          <div 
            className="absolute top-0 transform -translate-x-1/2 -translate-y-full mb-2"
            style={{ left: `${currentX}%` }}
          >
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-2 py-1">
              <span className="text-xs text-green-400 font-semibold">Current</span>
            </div>
          </div>
        )}
      </div>
      
      {/* X-axis labels (Click milestones) */}
      <div className="flex justify-between mt-2 px-2">
        {BONDING_CURVE_POINTS.map((point, index) => (
          <div key={index} className="text-center">
            <div className={`text-xs font-semibold ${
              currentClickCount >= point.clickCount ? 'text-green-400' : 'text-slate-400'
            }`}>
              {point.label}
            </div>
            <div className={`text-xs ${
              currentClickCount >= point.clickCount ? 'text-green-300' : 'text-slate-500'
            }`}>
              {formatTokenCount(point.requiredTokens)}
            </div>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-gradient-to-r from-purple-400 to-green-400"></div>
          <span className="text-slate-400">Token Requirements</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-400 opacity-60" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #10b981 2px, #10b981 4px)' }}></div>
          <span className="text-slate-400">Current Progress</span>
        </div>
      </div>
    </div>
  );
};