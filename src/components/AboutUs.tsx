import React from 'react';
import { Shield, Database, Wallet, Code, Users, Lock, Eye, Zap, Link, DollarSign, CheckCircle, ExternalLink, Globe, Server, Cloud } from 'lucide-react';

export const AboutUs: React.FC = () => {
  return (
    <div className="flex-1 px-4 md:px-6">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Project Overview */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            <h2 className="text-xl md:text-3xl font-bold text-white">About 1B Global Clicks</h2>
          </div>
          
          <div className="space-y-4 md:space-y-6 text-slate-300 leading-relaxed">
            <p className="text-base md:text-lg">
              Welcome to <span className="text-blue-400 font-semibold">1B Global Clicks</span> - a revolutionary 
              <span className="text-green-400 font-bold"> hybrid application</span> that combines the best of both worlds: 
              <span className="text-purple-400 font-bold"> Supabase database for global statistics</span> and 
              <span className="text-blue-400 font-bold"> Solana blockchain for permanent record keeping</span>.
            </p>
            
            <p className="text-sm md:text-base">
              Our innovative hybrid approach uses Supabase PostgreSQL database for fast, real-time global statistics 
              and leaderboards that all users can see instantly, while using the Solana memo program to store 
              permanent, immutable records of user participation on the blockchain.
            </p>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-green-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">✅ HYBRID APPROACH BENEFITS</h3>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-green-200">
                <li>• <strong>Database:</strong> Free, instant global statistics and real-time leaderboards</li>
                <li>• <strong>Blockchain:</strong> Permanent, immutable record keeping using Solana memo program</li>
                <li>• <strong>Best of Both:</strong> Fast UI updates + permanent blockchain records</li>
                <li>• <strong>Simplified:</strong> No custom smart contracts - uses standard memo program</li>
                <li>• <strong>Global Access:</strong> Worldwide visibility with enterprise-grade reliability</li>
                <li>• <strong>Future-Proof:</strong> Your blockchain records exist forever, independent of this app</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-purple-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 md:mb-3">🚀 Dual Storage System</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                <div className="bg-black/20 rounded-lg p-3 border border-green-500/30">
                  <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Supabase Database (Primary)
                  </h4>
                  <ul className="space-y-1 text-green-200">
                    <li>• Real-time global statistics</li>
                    <li>• Instant leaderboard updates</li>
                    <li>• Free for all users</li>
                    <li>• Fast worldwide access</li>
                    <li>• Enterprise-grade reliability</li>
                  </ul>
                </div>
                
                <div className="bg-black/20 rounded-lg p-3 border border-purple-500/30">
                  <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Solana Memo Program
                  </h4>
                  <ul className="space-y-1 text-purple-200">
                    <li>• Permanent, immutable records</li>
                    <li>• Standard Solana memo program</li>
                    <li>• Cryptographically verified</li>
                    <li>• Exists forever on MAINNET</li>
                    <li>• Small network fees only</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hybrid Architecture Explanation */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Globe className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Simplified Blockchain Integration</h2>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-blue-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                Primary: Supabase Database Storage
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-2 text-sm md:text-base">🌐 Global Statistics</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-green-200">
                      <li>• Real-time click counting for all users</li>
                      <li>• Live leaderboard updates worldwide</li>
                      <li>• Instant visibility of your contributions</li>
                      <li>• Fast, responsive user interface</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2 text-sm md:text-base">⚡ Performance</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-blue-200">
                      <li>• Lightning-fast data retrieval</li>
                      <li>• Global CDN distribution</li>
                      <li>• Optimized for real-time applications</li>
                      <li>• 99.9% uptime reliability</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-emerald-500/30">
                    <h4 className="font-semibold text-emerald-400 mb-2 text-sm md:text-base">💰 Cost Efficiency</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-emerald-200">
                      <li>• Completely free for all users</li>
                      <li>• No transaction fees for database</li>
                      <li>• Unlimited clicks and submissions</li>
                      <li>• Enterprise-grade infrastructure</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-cyan-500/30">
                    <h4 className="font-semibold text-cyan-400 mb-2 text-sm md:text-base">🔒 Security</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-cyan-200">
                      <li>• Row-level security policies</li>
                      <li>• Encrypted data transmission</li>
                      <li>• SOC 2 Type II compliance</li>
                      <li>• Regular security audits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-purple-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                Solana Memo Program Integration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-purple-500/30">
                    <h4 className="font-semibold text-purple-400 mb-2 text-sm md:text-base">📝 Memo Program</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-purple-200">
                      <li>• Standard Solana memo program</li>
                      <li>• No custom smart contracts needed</li>
                      <li>• Always available and reliable</li>
                      <li>• Stores arbitrary data on-chain</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-indigo-500/30">
                    <h4 className="font-semibold text-indigo-400 mb-2 text-sm md:text-base">🔗 Permanent Records</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-indigo-200">
                      <li>• Your clicks stored forever on-chain</li>
                      <li>• Independent of this application</li>
                      <li>• Publicly verifiable on blockchain</li>
                      <li>• True ownership of your data</li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2 text-sm md:text-base">💎 Value Proposition</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-blue-200">
                      <li>• Proof of participation forever</li>
                      <li>• Historical record of your clicks</li>
                      <li>• Blockchain-verified achievements</li>
                      <li>• Future-proof data storage</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-yellow-500/30">
                    <h4 className="font-semibold text-yellow-400 mb-2 text-sm md:text-base">💰 Minimal Cost</h4>
                    <ul className="space-y-1 text-xs md:text-sm text-yellow-200">
                      <li>• Only standard Solana network fees</li>
                      <li>• ≈0.000005 SOL per transaction</li>
                      <li>• No additional application fees</li>
                      <li>• Simple and cost-effective</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">How the Simplified System Works</h2>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold text-lg">1</span>
                  </div>
                  <h3 className="font-semibold text-green-400 mb-2">Click Locally</h3>
                  <p className="text-xs md:text-sm text-green-200">
                    Click as much as you want for free. All clicks are stored locally until you're ready to submit.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-lg">2</span>
                  </div>
                  <h3 className="font-semibold text-blue-400 mb-2">Store on Blockchain</h3>
                  <p className="text-xs md:text-sm text-blue-200">
                    Submit your clicks to Solana MAINNET using the memo program for permanent storage.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-lg p-4 border border-purple-500/20">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold text-lg">3</span>
                  </div>
                  <h3 className="font-semibold text-purple-400 mb-2">Update Database</h3>
                  <p className="text-xs md:text-sm text-purple-200">
                    Automatically sync your blockchain transaction to the database for global leaderboards.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 md:p-6 border border-yellow-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                Why This Simplified Approach is Better
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm text-slate-300">
                <div>
                  <h4 className="font-semibold text-yellow-400 mb-2">🚀 Simplified & Reliable</h4>
                  <ul className="space-y-1 text-yellow-200">
                    <li>• No custom smart contracts to maintain</li>
                    <li>• Uses standard Solana memo program</li>
                    <li>• Always available and working</li>
                    <li>• No initialization required</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-400 mb-2">🔮 Future-Proof Design</h4>
                  <ul className="space-y-1 text-orange-200">
                    <li>• Database for speed and accessibility</li>
                    <li>• Blockchain for permanence and ownership</li>
                    <li>• Automatic synchronization</li>
                    <li>• Scalable to millions of users</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Transparency & Privacy */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-8 border border-white/10">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Data Transparency & Privacy</h2>
          </div>
          
          <div className="space-y-4 md:space-y-6">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-cyan-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">🔍 What Data We Store</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm text-slate-300">
                <div>
                  <h4 className="font-semibold text-cyan-400 mb-2">In Supabase Database:</h4>
                  <ul className="space-y-1">
                    <li>• Your public wallet address (for identification)</li>
                    <li>• Total click count per wallet (publicly visible)</li>
                    <li>• Click batch timestamps (for transparency)</li>
                    <li>• Global statistics (total clicks, total users)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-purple-400 mb-2">On Solana Blockchain (Memo):</h4>
                  <ul className="space-y-1">
                    <li>• Your public wallet address (permanent)</li>
                    <li>• Click counts in JSON format</li>
                    <li>• Transaction timestamps (immutable)</li>
                    <li>• Application identifier and version</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg md:rounded-xl p-3 md:p-6 border border-green-500/20">
              <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4">✅ What We DON'T Store</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm text-slate-300">
                <ul className="space-y-2">
                  <li>• ❌ Private keys or seed phrases</li>
                  <li>• ❌ Wallet balances or holdings</li>
                  <li>• ❌ Personal information or emails</li>
                  <li>• ❌ IP addresses or location data</li>
                </ul>
                <ul className="space-y-2">
                  <li>• ❌ Browser fingerprints or tracking</li>
                  <li>• ❌ Third-party analytics or cookies</li>
                  <li>• ❌ Any sensitive personal data</li>
                  <li>• ❌ Financial or payment information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Note */}
        <div className="bg-gradient-to-r from-blue-500/10 to-green-500/10 backdrop-blur-lg rounded-xl md:rounded-2xl p-4 md:p-8 border border-blue-500/20">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <Code className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
            <h2 className="text-xl md:text-2xl font-bold text-white">Developer Note</h2>
          </div>
          
          <div className="space-y-3 md:space-y-4 text-slate-300 leading-relaxed">
            <ul className="space-y-1 md:space-y-2 ml-4 md:ml-6 list-disc text-xs md:text-sm">
              <li>Simplified hybrid architecture using Supabase database + Solana memo program</li>
              <li>Real-time global data synchronization with permanent blockchain records</li>
              <li>Cost-efficient community engagement with automatic blockchain storage</li>
              <li>No custom smart contracts - uses standard Solana memo program</li>
              <li>Transparent, secure data handling with enterprise-grade reliability</li>
              <li>Modern web development showcasing simplified blockchain integration</li>
            </ul>
            
            <div className="bg-black/20 rounded-lg p-3 md:p-4 border border-blue-500/30 mt-4 md:mt-6">
              <p className="text-center text-blue-300 font-medium text-xs md:text-sm">
                🌍 <strong>For the Global Community:</strong> This is a real experiment in simplified blockchain integration - 
                combining the speed and accessibility of modern databases with the permanence of blockchain technology using 
                standard Solana programs. Every click is instantly visible worldwide AND automatically stored forever on-chain! 
                Free participation with automatic blockchain features. Let's make history together! 🎯🌐✅
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-3 md:p-4 border border-green-500/30 mt-3 md:mt-4">
              <p className="text-center text-green-300 font-medium text-xs md:text-sm">
                ✅ <strong>SIMPLIFIED BENEFITS:</strong> Get the best of both worlds - instant global visibility through our database 
                AND automatic permanent blockchain records using the standard memo program. Free for everyone with automatic 
                blockchain features for permanent proof of participation!
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-3 md:p-4 border border-blue-500/30 mt-3 md:mt-4">
              <p className="text-center text-blue-300 font-medium text-xs md:text-sm">
                🗄️ <strong>POWERED BY SUPABASE + SOLANA MEMO:</strong> Built with Supabase for reliable, scalable global database storage 
                and Solana MAINNET memo program for permanent blockchain records. PostgreSQL database with real-time updates + 
                standard memo program for immutable storage.
                <br />
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline text-xs mt-2 mr-4"
                >
                  Learn about Supabase <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://docs.solana.com/developing/runtime-facilities/programs#memo-program"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 underline text-xs mt-2"
                >
                  Learn about Memo Program <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg p-3 md:p-4 border border-green-500/30 mt-3 md:mt-4">
              <p className="text-center text-green-300 font-medium text-xs md:text-sm">
                🚀 <strong>SIMPLIFIED BLOCKCHAIN DESIGN:</strong> This application demonstrates the future of web3 - 
                combining traditional database speed with blockchain permanence using standard programs. Users get instant gratification 
                AND automatic permanent, immutable records. The best of web2 UX with web3 ownership using proven infrastructure!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};