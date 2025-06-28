import React from 'react';
import { Coins, TrendingDown, Target, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  getRequiredTokens, 
  getNextMilestone, 
  formatTokenCount, 
  getProgressToNextMilestone,
  checkTokenBalance 
} from '../utils/bondingCurve';

interface TokenRequirementDisplayProps {
  globalClickCount: number;
  userTokenBalance?: number; // Optional - can be fetched from wallet/API
  className?: string;
}

export const TokenRequirementDisplay: React.FC<TokenRequirementDisplayProps> = ({
  globalClickCount,
  userTokenBalance = 0, // Default to 0 if not provided
  className = ''
}) => {
  const requiredTokens = getRequiredTokens(globalClickCount);
  const { nextMilestone, clicksUntilNext, currentRequirement } = getNextMilestone(globalClickCount);
  const progressToNext = getProgressToNextMilestone(globalClickCount);
  const { hasEnoughTokens, shortfall } = checkTokenBalance(userTokenBalance, globalClickCount);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Requirement Card */}
      <div className={`bg-gradient-to-r ${
        hasEnoughTokens 
          ? 'from-green-500/10 to-emerald-500/10 border-green-500/30' 
          : 'from-red-500/10 to-orange-500/10 border-red-500/30'
      } backdrop-blur-lg rounded-xl p-4 border`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              hasEnoughTokens ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <Coins className={`w-5 h-5 ${
                hasEnoughTokens ? 'text-green-400' : 'text-red-400'
              }`} />
            </div>
            <div>
              <h3 className="text-white font-semibold">Required OBGC Tokens</h3>
              <p className="text-slate-400 text-sm">To participate in clicking</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              hasEnoughTokens ? 'text-green-400' : 'text-red-400'
            }`}>
              {formatTokenCount(requiredTokens)}
            </div>
            <div className="text-xs text-slate-400">
              {requiredTokens.toLocaleString()} tokens
            </div>
          </div>
        </div>
        
        {/* User Balance Status */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Your Balance:</span>
              <span className="text-white font-semibold">
                {formatTokenCount(userTokenBalance)}
              </span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              hasEnoughTokens
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {hasEnoughTokens ? '✅ Eligible' : `❌ Need ${formatTokenCount(shortfall)} more`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Next Milestone Card */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-lg rounded-xl p-4 border border-blue-500/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingDown className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Next Reduction</h3>
              <p className="text-slate-400 text-sm">
                At {nextMilestone.label} clicks
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-400 text-sm">Progress to next tier</span>
                <span className="text-blue-400 text-sm font-semibold">
                  {progressToNext.toFixed(1)}%
                </span>
              </div>
              <div className="bg-slate-800/50 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progressToNext}%` }}
                />
              </div>
            </div>
            
            {/* Milestone Info */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">
                  {formatTokenCount(nextMilestone.requiredTokens)} OBGC
                </div>
                <div className="text-slate-400 text-xs">
                  New requirement
                </div>
              </div>
              <div className="text-right">
                <div className="text-blue-400 font-semibold">
                  {formatTokenCount(clicksUntilNext)}
                </div>
                <div className="text-slate-400 text-xs">
                  clicks remaining
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Token Info */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl p-4 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">OBGC Token Info</h3>
            <p className="text-slate-400 text-sm">One Billion Global Clicks</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Contract Address:</span>
            <span className="text-purple-400 font-mono text-xs">
              HNnmV7LMStogJC4PoTj6doSHZtWdCeExMSzBAukEpump
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Network:</span>
            <span className="text-white">Solana</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Purpose:</span>
            <span className="text-white">Participation Token</span>
          </div>
        </div>
        
        {!hasEnoughTokens && (
          <div className="mt-4 p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-200">
                <p className="font-semibold mb-1">How to get OBGC tokens:</p>
                <ul className="space-y-1">
                  <li>• Purchase on DEX platforms</li>
                  <li>• Participate in community events</li>
                  <li>• Check official channels for airdrops</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};