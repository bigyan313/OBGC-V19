import React from 'react';
import { Trophy, Medal, Award, Crown, Loader } from 'lucide-react';

interface LeaderboardEntry {
  address: string;
  clicks: number;
  rank: number;
}

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserRank?: number;
  currentUserClicks?: number;
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ 
  leaderboard, 
  currentUserRank, 
  currentUserClicks,
  isLoading = false
}) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-4 h-4 md:w-5 md:h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-4 h-4 md:w-5 md:h-5 text-amber-600" />;
      default:
        return <Award className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'from-gray-300/20 to-gray-500/20 border-gray-300/30';
      case 3:
        return 'from-amber-600/20 to-amber-800/20 border-amber-600/30';
      default:
        return 'from-blue-400/10 to-purple-400/10 border-white/10';
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
        <h3 className="text-lg md:text-xl font-bold text-white">Top 10 Clickers</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">Live</span>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 md:p-4 border border-white/10 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-5 h-5 md:w-6 md:h-6 bg-slate-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="w-16 md:w-20 h-3 md:h-4 bg-slate-600 rounded"></div>
                    <div className="w-12 md:w-16 h-2 md:h-3 bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="w-10 md:w-12 h-5 md:h-6 bg-slate-600 rounded"></div>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mt-4">
            <Loader className="w-4 h-4 animate-spin" />
            <span>Loading blockchain data...</span>
          </div>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-6 md:py-8">
          <Trophy className="w-10 h-10 md:w-12 md:h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm md:text-base">No clickers yet!</p>
          <p className="text-slate-500 text-xs md:text-sm mt-2">Be the first to click and claim the top spot</p>
        </div>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.address}
              className={`bg-gradient-to-r ${getRankColor(entry.rank)} rounded-xl p-3 md:p-4 border transition-all duration-200 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1 md:gap-2">
                    {getRankIcon(entry.rank)}
                    <span className="text-white font-bold text-sm md:text-lg">#{entry.rank}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">
                      {formatAddress(entry.address)}
                    </p>
                    <p className="text-slate-400 text-xs md:text-sm">
                      {entry.clicks.toLocaleString()} clicks
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatNumber(entry.clicks)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentUserRank && currentUserRank > 10 && !isLoading && (
        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/10">
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-3 md:p-4 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium text-sm md:text-base">Your Rank</p>
                  <p className="text-slate-400 text-xs md:text-sm">
                    {currentUserClicks?.toLocaleString()} clicks
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg md:text-xl font-bold text-purple-400">#{currentUserRank}</p>
                <p className="text-base md:text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {formatNumber(currentUserClicks || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="mt-3 md:mt-4 text-center">
          <p className="text-slate-500 text-xs">
            Data refreshes every 10 seconds from Solana blockchain
          </p>
        </div>
      )}
    </div>
  );
};