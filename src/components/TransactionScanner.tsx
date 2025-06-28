import React, { useState } from 'react';
import { ExternalLink, Search, CheckCircle, Copy, Zap, Clock, Shield } from 'lucide-react';

interface Transaction {
  signature: string;
  timestamp: number;
  clicks: number;
  status: 'confirmed' | 'pending' | 'failed';
  explorerUrl: string;
}

interface TransactionScannerProps {
  userAddress?: string;
  recentTransactions?: Transaction[];
}

export const TransactionScanner: React.FC<TransactionScannerProps> = ({
  userAddress,
  recentTransactions = []
}) => {
  const [searchSignature, setSearchSignature] = useState('');
  const [copiedSignature, setCopiedSignature] = useState<string | null>(null);

  const handleCopySignature = async (signature: string) => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopiedSignature(signature);
      setTimeout(() => setCopiedSignature(null), 2000);
    } catch (error) {
      console.error('Failed to copy signature:', error);
    }
  };

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 8)}...${signature.slice(-8)}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Only show confirmed transactions
  const confirmedTransactions = recentTransactions.filter(tx => tx.status === 'confirmed');

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 md:p-6 border border-white/10">
      <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
        <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
        <h3 className="text-lg md:text-xl font-bold text-white">Your Blockchain Records</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-400">MAINNET</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchSignature}
            onChange={(e) => setSearchSignature(e.target.value)}
            placeholder="Enter transaction signature to view on Solana Explorer..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 text-sm md:text-base"
          />
          <button
            onClick={() => {
              if (searchSignature.trim()) {
                window.open(`https://explorer.solana.com/tx/${searchSignature.trim()}?cluster=mainnet`, '_blank');
              }
            }}
            disabled={!searchSignature.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-purple-400 hover:text-purple-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            title="View on Solana Explorer"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mb-4 md:mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        <a
          href="https://explorer.solana.com/?cluster=mainnet"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 group"
        >
          <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-purple-400 group-hover:text-purple-300 flex-shrink-0" />
          <div>
            <div className="text-white font-medium text-sm">Solana Explorer</div>
            <div className="text-slate-400 text-xs">View all mainnet transactions</div>
          </div>
        </a>

        {userAddress && (
          <a
            href={`https://explorer.solana.com/address/${userAddress}?cluster=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-gradient-to-r from-green-500/10 to-purple-500/10 rounded-lg p-3 border border-green-500/20 hover:border-green-500/40 transition-all duration-200 group"
          >
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5 text-green-400 group-hover:text-green-300 flex-shrink-0" />
            <div>
              <div className="text-white font-medium text-sm">Your Wallet</div>
              <div className="text-slate-400 text-xs">View your transaction history</div>
            </div>
          </a>
        )}
      </div>

      {/* Confirmed Transactions */}
      {confirmedTransactions.length > 0 && (
        <div>
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            Permanent Blockchain Records
            <span className="text-xs text-slate-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-500/30">
              {confirmedTransactions.length} confirmed
            </span>
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {confirmedTransactions.map((tx) => (
              <div
                key={tx.signature}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-3">
                    <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">
                          {formatSignature(tx.signature)}
                        </span>
                        <button
                          onClick={() => handleCopySignature(tx.signature)}
                          className="text-slate-400 hover:text-white transition-colors"
                          title="Copy signature"
                        >
                          {copiedSignature === tx.signature ? (
                            <CheckCircle className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-slate-400 text-xs flex items-center gap-2">
                        <Zap className="w-3 h-3" />
                        <span>{tx.clicks} clicks stored via memo program</span>
                        <Clock className="w-3 h-3 ml-2" />
                        <span>{formatTimestamp(tx.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded border border-green-500/30">
                      📝 MEMO
                    </span>
                    <a
                      href={tx.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 transition-colors"
                      title="View on Solana Explorer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmedTransactions.length === 0 && (
        <div className="text-center py-6 md:py-8">
          <Shield className="w-10 h-10 md:w-12 md:h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 mb-2 text-sm md:text-base">No blockchain records yet</p>
          <p className="text-slate-500 text-xs md:text-sm">
            Submit some clicks to see your permanent blockchain transactions here
          </p>
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/10">
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-semibold text-sm mb-1">Permanent Blockchain Storage</h4>
              <p className="text-slate-300 text-xs leading-relaxed">
                Every click submission creates a permanent, immutable record on Solana MAINNET blockchain using the memo program. 
                Your clicks are cryptographically verified and will exist forever on-chain, independent of this application.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-slate-400 mt-3">
          <span>All transactions permanently stored on Solana MAINNET using memo program</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span>Live blockchain data</span>
          </div>
        </div>
      </div>
    </div>
  );
};