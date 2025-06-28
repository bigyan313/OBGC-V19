import React, { useState } from 'react';
import { Shield, Eye, Lock, AlertTriangle, CheckCircle, X, Wallet, Database, Zap, DollarSign } from 'lucide-react';

interface WalletPermissionModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const WalletPermissionModal: React.FC<WalletPermissionModalProps> = ({
  isOpen,
  onAccept,
  onDecline
}) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadPrivacy, setHasReadPrivacy] = useState(false);

  const canProceed = hasReadTerms && hasReadPrivacy;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-white/10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-400" />
              <h2 className="text-2xl font-bold text-white">Phantom Wallet Permissions</h2>
            </div>
            <button
              onClick={onDecline}
              className="text-slate-400 hover:text-white transition-colors p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-slate-300 mt-2">
            Review Phantom wallet permissions and mainnet blockchain transaction costs for this application
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Phantom Wallet Requirement */}
          <div className="bg-purple-500/20 rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-8 h-8 text-purple-400" />
              <h3 className="text-2xl font-bold text-purple-400">👻 PHANTOM WALLET REQUIRED</h3>
            </div>
            
            <div className="space-y-3 text-purple-200">
              <p className="font-bold text-lg">
                This application only supports Phantom wallet for Solana mainnet!
              </p>
              <ul className="space-y-2 text-sm">
                <li>• Phantom is the most trusted Solana wallet</li>
                <li>• Optimized for Solana mainnet blockchain transactions</li>
                <li>• Secure and user-friendly interface</li>
                <li>• No other wallets (MetaMask, etc.) are supported</li>
                <li>• Download from official site: phantom.app</li>
              </ul>
            </div>
          </div>

          {/* IMPORTANT WARNING */}
          <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-green-400">✅ NETWORK FEES ONLY</h3>
            </div>
            
            <div className="space-y-3 text-green-200">
              <p className="font-bold text-lg">
                This application uses SOLANA MAINNET with standard network fees only!
              </p>
              <ul className="space-y-2 text-sm">
                <li>• No additional click fees - only standard Solana network fees</li>
                <li>• Each batch submission costs approximately 0.000005 SOL</li>
                <li>• Transaction fees are standard mainnet network costs</li>
                <li>• All transactions are permanent and cannot be reversed</li>
                <li>• Click locally for free, submit batches when ready</li>
              </ul>
            </div>
          </div>

          {/* Transaction Costs */}
          <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">💰 NETWORK TRANSACTION COSTS</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Network:</span>
                <span className="text-blue-400 font-bold">Solana Mainnet</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Wallet Required:</span>
                <span className="text-purple-400 font-bold">Phantom Only</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Cost per Batch:</span>
                <span className="text-blue-400 font-bold">≈0.000005 SOL (network fees)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Click Fees:</span>
                <span className="text-green-400 font-bold">FREE (no additional fees)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Local Clicking:</span>
                <span className="text-green-400 font-bold">FREE (unlimited)</span>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-green-500/20 rounded-lg border border-green-500/30">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-200 text-sm font-semibold mb-2">
                    <strong>COST EFFICIENT:</strong> Only standard Solana network fees apply!
                  </p>
                  <ul className="text-green-200 text-sm space-y-1">
                    <li>• Click as much as you want locally for free</li>
                    <li>• Only pay network fees when submitting batches</li>
                    <li>• No per-click charges or additional fees</li>
                    <li>• Standard Solana mainnet transaction costs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Operations */}
          <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">Phantom Wallet Operations Required</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Transaction Signing with Phantom</h4>
                  <p className="text-slate-300 text-sm">
                    Each batch submission creates a mainnet transaction that requires your Phantom wallet signature
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Database className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Permanent Storage</h4>
                  <p className="text-slate-300 text-sm">
                    Click data is permanently stored on Solana mainnet blockchain forever
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Batch Processing</h4>
                  <p className="text-slate-300 text-sm">
                    Click locally for free, then submit batches to blockchain when ready
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We Access */}
          <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Phantom Wallet Data We Access</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Public Wallet Address</h4>
                  <p className="text-slate-300 text-sm">
                    Used for mainnet transactions and leaderboard display (permanently visible on blockchain)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Transaction Signing Capability</h4>
                  <p className="text-slate-300 text-sm">
                    Required to create and sign REAL mainnet blockchain transactions
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">Connection Status</h4>
                  <p className="text-slate-300 text-sm">
                    To enable/disable clicking functionality based on Phantom wallet connection
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What We DON'T Access */}
          <div className="bg-gray-500/10 rounded-xl p-6 border border-gray-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-gray-400" />
              <h3 className="text-xl font-bold text-white">What We Will NEVER Access</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Private keys or seed phrases</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Wallet balances or holdings</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Other transaction history</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Personal information</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Access to other tokens/NFTs</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Ability to transfer your funds</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Email or contact details</span>
                </div>
                <div className="flex items-center gap-2">
                  <X className="w-4 h-4 text-red-400" />
                  <span className="text-slate-300 text-sm">Location or IP address</span>
                </div>
              </div>
            </div>
          </div>

          {/* Blockchain Transparency */}
          <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-start gap-3">
              <Database className="w-6 h-6 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Mainnet Blockchain Data Storage</h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li>• All click data is permanently stored on Solana MAINNET blockchain (public and immutable)</li>
                  <li>• Your Phantom wallet address and click count will be visible on blockchain explorers forever</li>
                  <li>• Data cannot be deleted or modified once recorded on mainnet blockchain</li>
                  <li>• No personal information is stored - only public wallet addresses and click counts</li>
                  <li>• All transactions are cryptographically signed by Phantom and verifiable on mainnet</li>
                  <li>• Data exists independently of this website on the decentralized mainnet blockchain</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="blockchain-consent"
                checked={hasReadTerms}
                onChange={(e) => setHasReadTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="blockchain-consent" className="text-slate-300 text-sm">
                I understand that <strong className="text-green-400">each batch submission creates a MAINNET blockchain transaction</strong> that 
                requires my <strong className="text-purple-400">Phantom wallet signature</strong> and uses <strong className="text-green-400">only standard network fees (≈0.000005 SOL)</strong>. I consent to these network transactions and costs.
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="data-consent"
                checked={hasReadPrivacy}
                onChange={(e) => setHasReadPrivacy(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="data-consent" className="text-slate-300 text-sm">
                I acknowledge that <strong className="text-white">my Phantom wallet address and click data will be permanently stored</strong> on 
                Solana MAINNET blockchain and will be publicly visible and verifiable by anyone forever, and that <strong className="text-green-400">only standard network fees apply</strong>.
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onDecline}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAccept}
              disabled={!canProceed}
              className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all duration-200 ${
                canProceed
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                <span>Connect Phantom Wallet</span>
              </div>
            </button>
          </div>

          {/* Footer Note */}
          <div className="text-center pt-4 border-t border-white/10">
            <p className="text-purple-400 text-xs font-semibold">
              👻 PHANTOM WALLET ONLY: This application exclusively supports Phantom wallet for Solana MAINNET. 
              No other wallets are supported. Download from phantom.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};