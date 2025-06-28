import React, { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Wifi, WifiOff, AlertCircle, CheckCircle, RefreshCw, Activity, Zap, Star, Key, ExternalLink } from 'lucide-react';
import { HELIUS_CONFIG, isHeliusConfigured } from '../config/helius';

interface ConnectionStatusProps {
  currentEndpoint?: string;
  onRefresh?: () => void;
  endpointHealth?: { [key: string]: boolean };
  priorityFee?: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  currentEndpoint, 
  onRefresh,
  endpointHealth = {},
  priorityFee = 5000
}) => {
  const { connection } = useConnection();
  const [status, setStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [latency, setLatency] = useState<number>(0);

  const checkConnection = async () => {
    try {
      setStatus('connecting');
      const startTime = Date.now();
      await connection.getLatestBlockhash('confirmed');
      const endTime = Date.now();
      setLatency(endTime - startTime);
      setStatus('connected');
      setLastCheck(Date.now());
    } catch (error) {
      console.warn('Connection check failed:', error);
      setStatus('error');
      setLatency(0);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await checkConnection();
    if (onRefresh) {
      onRefresh();
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [connection]);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-400" />;
      case 'connecting':
        return <RefreshCw className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected to Solana Mainnet';
      case 'connecting':
        return 'Connecting to Solana Mainnet...';
      case 'error':
        return 'Connection issues - trying fallback endpoints';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'from-green-500/10 to-blue-500/10 border-green-500/20';
      case 'connecting':
        return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
      case 'error':
        return 'from-red-500/10 to-orange-500/10 border-red-500/20';
    }
  };

  const formatLastCheck = () => {
    if (!lastCheck) return 'Never';
    const seconds = Math.floor((Date.now() - lastCheck) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getEndpointName = (endpoint: string) => {
    if (!endpoint) return 'Unknown';
    if (endpoint.includes('helius-rpc.com')) return 'Helius (Premium)';
    if (endpoint.includes('api.mainnet-beta.solana.com')) return 'Solana Labs (Official)';
    if (endpoint.includes('solana-api.projectserum.com')) return 'Project Serum';
    if (endpoint.includes('rpc.ankr.com')) return 'Ankr';
    if (endpoint.includes('extrnode.com')) return 'ExtrNode';
    if (endpoint.includes('metaplex.solana.com')) return 'Metaplex';
    if (endpoint.includes('phantom.tech')) return 'Phantom';
    if (endpoint.includes('default')) return 'Default (Fallback)';
    return 'Custom';
  };

  const getLatencyColor = () => {
    if (latency === 0) return 'text-slate-400';
    if (latency < 300) return 'text-green-400';
    if (latency < 800) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLatencyIcon = () => {
    if (latency === 0) return <Activity className="w-2 h-2 md:w-3 md:h-3 text-slate-400" />;
    if (latency < 300) return <Zap className="w-2 h-2 md:w-3 md:h-3 text-green-400" />;
    if (latency < 800) return <Activity className="w-2 h-2 md:w-3 md:h-3 text-yellow-400" />;
    return <Wifi className="w-2 h-2 md:w-3 md:h-3 text-red-400" />;
  };

  const isUsingHelius = currentEndpoint?.includes('helius-rpc.com');
  const healthyEndpoints = Object.values(endpointHealth).filter(Boolean).length;
  const totalEndpoints = Object.keys(endpointHealth).length;
  const hasHeliusApiKey = isHeliusConfigured();

  return (
    <div className={`bg-gradient-to-r ${getStatusColor()} backdrop-blur-lg rounded-xl p-3 md:p-4 border`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          {getStatusIcon()}
          <div>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
              <span className="text-white font-semibold text-xs md:text-sm">
                {getStatusText()}
              </span>
              {isUsingHelius && (
                <div className="flex items-center gap-1 bg-purple-500/20 px-1 md:px-2 py-1 rounded-full border border-purple-500/30">
                  <Star className="w-2 h-2 md:w-3 md:h-3 text-purple-400" />
                  <span className="text-xs text-purple-300 font-semibold">HELIUS</span>
                </div>
              )}
            </div>
            {currentEndpoint && status === 'connected' && (
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1 md:gap-2 flex-wrap">
                <span>Using: {getEndpointName(currentEndpoint)}</span>
                {latency > 0 && (
                  <div className="flex items-center gap-1">
                    {getLatencyIcon()}
                    <span className={getLatencyColor()}>{latency}ms</span>
                  </div>
                )}
                {priorityFee && priorityFee > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">•</span>
                    <span className="text-blue-300">{priorityFee}μL fee</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          {totalEndpoints > 0 && (
            <div className="text-right">
              <div className="text-xs text-slate-400">Endpoints</div>
              <div className="text-xs text-slate-300">
                {healthyEndpoints}/{totalEndpoints} healthy
              </div>
            </div>
          )}
          
          <div className="text-right">
            <div className="text-xs text-slate-400">Last check</div>
            <div className="text-xs text-slate-300">{formatLastCheck()}</div>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 p-1"
            title="Refresh connection and test endpoints"
          >
            <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {status === 'error' && (
        <div className="mt-3 p-2 md:p-3 bg-red-500/20 rounded-lg border border-red-500/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs md:text-sm text-red-200">
              <p className="font-semibold mb-1">RPC Connection Issues Detected</p>
              <ul className="text-xs space-y-1">
                <li>• App is automatically trying Helius and fallback endpoints</li>
                <li>• Transactions may take longer than usual</li>
                <li>• Click refresh to test connection manually</li>
                {!hasHeliusApiKey && <li>• Consider adding a Helius API key for better reliability</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {status === 'connected' && (
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-green-300">
            ✅ All systems operational - ready for blockchain transactions
          </div>
          {isUsingHelius && (
            <div className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded flex items-center gap-1">
              <Star className="w-2 h-2 md:w-3 md:h-3" />
              <span className="hidden md:inline">Premium RPC Active</span>
              <span className="md:hidden">Premium</span>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Endpoint Health Status */}
      {Object.keys(endpointHealth).length > 0 && (
        <div className="mt-3 p-2 md:p-3 bg-white/5 rounded-lg border border-white/10">
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2 flex-wrap">
            <span>RPC Endpoint Status:</span>
            {hasHeliusApiKey && (
              <div className="flex items-center gap-1 text-purple-300">
                <Star className="w-2 h-2 md:w-3 md:h-3" />
                <span>Helius Enabled</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2 text-xs">
            {Object.entries(endpointHealth).slice(0, 6).map(([endpoint, isHealthy]) => {
              const isHelius = endpoint.includes('helius-rpc.com');
              return (
                <div key={endpoint} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className={`${isHealthy ? 'text-green-300' : 'text-red-300'} ${isHelius ? 'font-semibold' : ''} truncate`}>
                    {getEndpointName(endpoint)}
                    {isHelius && <Star className="w-2 h-2 md:w-3 md:h-3 inline ml-1" />}
                  </span>
                </div>
              );
            })}
          </div>
          
          {!hasHeliusApiKey && (
            <div className="mt-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
              <div className="text-xs text-blue-300 flex items-start gap-2">
                <Key className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">💡 Improve Performance with Helius RPC</div>
                  <div className="mb-2">
                    Get a free API key from Helius for premium RPC performance and reliability:
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a 
                      href="https://helius.xyz" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
                    >
                      Get Free API Key <ExternalLink className="w-2 h-2" />
                    </a>
                    <span className="text-slate-400">•</span>
                    <span>Add to .env file as VITE_HELIUS_API_KEY</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};