import React, { useState, useCallback, useEffect } from 'react';
import { MousePointer, Zap, TrendingUp, Users, Target, Info, RefreshCw, AlertCircle, Upload, Clock, Star, Menu, X, Database, Globe, Shield, Coins } from 'lucide-react';
import { WalletContextProvider } from './components/WalletProvider';
import { WalletButton } from './components/WalletButton';
import { Leaderboard } from './components/Leaderboard';
import { CaptchaModal } from './components/CaptchaModal';
import { AboutUs } from './components/AboutUs';
import { TransactionScanner } from './components/TransactionScanner';
import { ElegantPopup } from './components/ElegantPopup';
import { BondingCurveChart } from './components/BondingCurveChart';
import { TokenRequirementDisplay } from './components/TokenRequirementDisplay';
import { NotificationSystem, useNotifications } from './components/NotificationSystem';
import { useHybridClicker } from './hooks/useHybridClicker';
import { isSupabaseConfigured } from './lib/supabase';
import { playClickSound, playSubmitSound, playSuccessSound } from './utils/sounds';
import { getRequiredTokens, checkTokenBalance } from './utils/bondingCurve';

function AppContent() {
  const { 
    totalClicks, 
    userClicks, 
    pendingClicks,
    leaderboard, 
    userRank, 
    uniqueWallets,
    addClick,
    submitBatch,
    isConnected,
    showCaptcha,
    isUIFrozen,
    handleCaptchaSuccess,
    handleCaptchaClose,
    isSubmittingBatch,
    isLoading,
    lastUpdate,
    refreshData,
    currentEndpoint,
    endpointHealth,
    priorityFee,
    recentTransactions,
    setNotifications,
    isSupabaseConnected,
    checkSupabaseConnection,
    blockchainClicks,
    databaseClicks,
    userAddress,
    userTokenBalance,
    isLoadingTokenBalance
  } = useHybridClicker();
  
  const {
    notifications,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  } = useNotifications();
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'clicker' | 'about' | 'transactions' | 'tokens'>('clicker');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [elegantPopup, setElegantPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'success' | 'info' | 'warning' | 'error';
    link?: { label: string; url: string };
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const targetClicks = 1000000000; // 1 billion
  const progress = totalClicks > 0 ? (totalClicks / targetClicks) * 100 : 0;
  const isSupabaseConfiguredProp = isSupabaseConfigured();
  const isUsingHelius = currentEndpoint?.includes('helius-rpc.com');

  // Check token requirements
  const requiredTokens = getRequiredTokens(totalClicks);
  const { hasEnoughTokens } = checkTokenBalance(userTokenBalance, totalClicks);

  // Set up notification callbacks
  useEffect(() => {
    setNotifications({
      showSuccess,
      showError,
      showWarning,
      showInfo
    });
  }, [setNotifications, showSuccess, showError, showWarning, showInfo]);

  // Format number with commas and abbreviations
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Show elegant popup
  const showElegantPopup = useCallback((
    title: string, 
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error' = 'success',
    link?: { label: string; url: string }
  ) => {
    setElegantPopup({
      isOpen: true,
      title,
      message,
      type,
      link
    });
  }, []);

  // Handle click button - ONLY allow mouse clicks, prevent keyboard events
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Only allow actual mouse clicks (not keyboard events)
    if (event.detail === 0) {
      // This is a keyboard event (Enter/Space), ignore it
      return;
    }

    if (!isConnected) {
      showWarning(
        'Wallet Not Connected',
        'Please connect your Phantom wallet to participate!'
      );
      return;
    }

    if (!isSupabaseConnected) {
      showError(
        'Database Not Connected',
        'Unable to connect to database. Please check your configuration.'
      );
      return;
    }

    // Check token requirements
    if (!hasEnoughTokens) {
      showWarning(
        'Insufficient OBGC Tokens',
        `You need ${requiredTokens.toLocaleString()} OBGC tokens to participate. You currently have ${userTokenBalance.toLocaleString()} tokens. Check the Tokens tab for more information.`
      );
      return;
    }

    if (isUIFrozen) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Play click sound
    playClickSound();

    // Add ripple effect
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    // Add particle effect
    const newParticles = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      x: x + (Math.random() - 0.5) * 100,
      y: y + (Math.random() - 0.5) * 100,
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Add click locally
    addClick();
    setIsAnimating(true);

    // Clean up ripples and particles
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    setTimeout(() => {
      setParticles(prev => prev.filter(particle => !newParticles.some(p => p.id === particle.id)));
    }, 1000);

    setTimeout(() => setIsAnimating(false), 150);
  }, [isConnected, isSupabaseConnected, addClick, isUIFrozen, hasEnoughTokens, requiredTokens, userTokenBalance, showWarning, showError]);

  // Handle keyboard events on the click button - prevent all keyboard activation
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Prevent Enter, Space, and any other key from triggering the button
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // Handle submit to blockchain (automatic)
  const handleSubmitBatch = useCallback(async () => {
    if (!isConnected) {
      showWarning(
        'Wallet Not Connected',
        'Please connect your Phantom wallet first!'
      );
      return;
    }

    if (pendingClicks === 0) {
      showInfo(
        'No Pending Clicks',
        'You need to click first before submitting!'
      );
      return;
    }

    if (isSubmittingBatch) return;
    
    // Play submit sound
    playSubmitSound();
    
    const feeEstimate = priorityFee ? (priorityFee / 1000000 * 0.000005).toFixed(8) : '0.000005';
    
    const success = await submitBatch();
    if (success) {
      // Play success sound
      playSuccessSound();
      
      // Show elegant popup instead of notification
      showElegantPopup(
        '🎉 Clicks Stored Successfully!',
        `Your ${pendingClicks} clicks have been permanently stored on Solana MAINNET using the memo program and synced to the global database. You're now part of the 1 billion click challenge!`,
        'success',
        {
          label: 'View on Solana Explorer',
          url: `https://explorer.solana.com/address/${userAddress}?cluster=mainnet`
        }
      );
    }
  }, [isConnected, pendingClicks, isSubmittingBatch, submitBatch, priorityFee, isUsingHelius, showWarning, showInfo, showElegantPopup, userAddress]);

  // Handle Supabase setup
  const handleSupabaseSetup = useCallback(async () => {
    if (!isSupabaseConfiguredProp) {
      showInfo(
        'Database Setup Required',
        'Please configure your database credentials.',
        {
          duration: 0,
          link: {
            label: 'Setup Guide',
            url: 'https://supabase.com/docs/guides/getting-started'
          }
        }
      );
      return;
    }

    showInfo(
      'Testing Connection',
      'Checking database connection...'
    );

    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      showSuccess(
        'Connected! 🎉',
        'Successfully connected to database.',
        { duration: 5000 }
      );
    } else {
      showError(
        'Connection Failed',
        'Unable to connect to database.'
      );
    }
  }, [isSupabaseConfiguredProp, checkSupabaseConnection, showInfo, showSuccess, showError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />

      {/* Elegant Popup */}
      <ElegantPopup
        isOpen={elegantPopup.isOpen}
        onClose={() => setElegantPopup(prev => ({ ...prev, isOpen: false }))}
        title={elegantPopup.title}
        message={elegantPopup.message}
        type={elegantPopup.type}
        link={elegantPopup.link}
      />

      {/* Frozen UI Overlay */}
      {isUIFrozen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center mx-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white font-semibold">Security Check Required</p>
          </div>
        </div>
      )}

      {/* Captcha Modal */}
      <CaptchaModal
        isOpen={showCaptcha}
        onSuccess={handleCaptchaSuccess}
        onClose={handleCaptchaClose}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-80 md:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 md:w-[600px] md:h-[600px] bg-gradient-conic from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-2xl animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Minimal Header */}
        <header className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <img 
                  src="/Gemini_Generated_Image_r2y8vxr2y8vxr2y8.png" 
                  alt="1 Billion Global Click Challenge" 
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-yellow-400/50 shadow-lg"
                />
                <div className="absolute -inset-1 bg-yellow-400/20 rounded-full blur-lg"></div>
              </div>
              <div>
                <h1 className="text-lg md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-white bg-clip-text text-transparent">
                  1 Billion Global Click Challenge
                </h1>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {isUsingHelius && (
                    <>
                      <Star className="w-2 h-2 md:w-3 md:h-3 text-purple-400" />
                      <span className="text-xs text-purple-300 font-semibold">HELIUS</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <WalletButton />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('clicker')}
                  className={`md:hidden p-2 rounded-xl border transition-colors ${
                    activeTab === 'clicker' 
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <MousePointer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`md:hidden p-2 rounded-xl border transition-colors ${
                    activeTab === 'tokens' 
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`md:hidden p-2 rounded-xl border transition-colors ${
                    activeTab === 'transactions' 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`md:hidden p-2 rounded-xl border transition-colors ${
                    activeTab === 'about' 
                      ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('clicker')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                    activeTab === 'clicker' 
                      ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <MousePointer className="w-4 h-4" />
                  Clicker
                </button>
                <button
                  onClick={() => setActiveTab('tokens')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                    activeTab === 'tokens' 
                      ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Coins className="w-4 h-4" />
                  Tokens
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                    activeTab === 'transactions' 
                      ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Blockchain
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors ${
                    activeTab === 'about' 
                      ? 'bg-orange-500/20 border-orange-500/30 text-orange-400' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Info className="w-4 h-4" />
                  About
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        {activeTab === 'clicker' ? (
          <>
            {/* Connection Notices */}
            {!isSupabaseConnected && (
              <div className="px-4 md:px-6 mb-4">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl p-3 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Database connection required for global statistics</p>
                      </div>
                      <button
                        onClick={handleSupabaseSetup}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isConnected && isSupabaseConnected && (
              <div className="px-4 md:px-6 mb-4">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-3 border border-green-500/20">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-white font-semibold text-sm">Connect wallet to participate and store clicks on blockchain</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Token Requirement Notice */}
            {isConnected && !hasEnoughTokens && (
              <div className="px-4 md:px-6 mb-4">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-3 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <Coins className="w-4 h-4 md:w-5 md:h-5 text-purple-400 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          You need {requiredTokens.toLocaleString()} OBGC tokens to participate
                        </p>
                        <p className="text-purple-300 text-xs">
                          Current balance: {isLoadingTokenBalance ? 'Loading...' : userTokenBalance.toLocaleString()} OBGC
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('tokens')}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded-lg text-xs transition-colors"
                      >
                        View Tokens
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Challenge Area */}
            <div className="flex-1 px-4 md:px-6">
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Click Area - Takes 2 columns on desktop */}
                <div className="lg:col-span-2">
                  <div className="text-center">
                    {/* Click Counter */}
                    <div className="mb-8 md:mb-12">
                      <div className={`text-4xl md:text-6xl lg:text-8xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-white bg-clip-text text-transparent transition-all duration-150 ${isAnimating ? 'scale-110' : 'scale-100'}`}>
                        {isLoading ? '...' : totalClicks === 0 ? '0' : formatNumber(totalClicks)}
                      </div>
                      <div className="text-base md:text-lg lg:text-xl bg-gradient-to-r from-purple-300 via-blue-300 to-white bg-clip-text text-transparent mt-2">
                        {isLoading ? 'Loading...' : `${totalClicks.toLocaleString()} clicks`}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-8 md:mb-12">
                      <div className="bg-slate-800/50 rounded-full h-2 md:h-3 overflow-hidden border border-slate-700/50">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-white transition-all duration-1000 ease-out relative"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        >
                          {progress > 0 && (
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-slate-500 text-xs md:text-sm">0</span>
                        <span className="text-slate-400 text-xs md:text-sm font-semibold">
                          {progress.toFixed(6)}%
                        </span>
                        <span className="text-slate-500 text-xs md:text-sm">1B</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
                      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
                        <div className="flex flex-col items-center">
                          <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mb-1" />
                          <p className="text-white font-bold text-sm md:text-base">
                            {isLoading ? '...' : uniqueWallets}
                          </p>
                          <p className="text-slate-400 text-xs">Users</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
                        <div className="flex flex-col items-center">
                          <Target className="w-4 h-4 md:w-5 md:h-5 text-green-400 mb-1" />
                          <p className="text-white font-bold text-sm md:text-base">
                            {isLoading ? '...' : isConnected ? formatNumber(databaseClicks) : '0'}
                          </p>
                          <p className="text-slate-400 text-xs">Your Total</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
                        <div className="flex flex-col items-center">
                          <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-400 mb-1" />
                          <p className="text-white font-bold text-sm md:text-base">
                            {isLoading ? '...' : isConnected ? formatNumber(blockchainClicks) : '0'}
                          </p>
                          <p className="text-slate-400 text-xs">On-Chain</p>
                        </div>
                      </div>
                      <div className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
                        <div className="flex flex-col items-center">
                          <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-400 mb-1" />
                          <p className="text-white font-bold text-sm md:text-base">
                            {isLoading ? '...' : isConnected ? formatNumber(pendingClicks) : '0'}
                          </p>
                          <p className="text-slate-400 text-xs">Pending</p>
                        </div>
                      </div>
                    </div>

                    {/* Click Buttons */}
                    <div className="space-y-4">
                      {/* Main Click Button */}
                      <div className="relative">
                        <button
                          onClick={handleClick}
                          onKeyDown={handleKeyDown}
                          disabled={!isConnected || !isSupabaseConnected || !hasEnoughTokens || isUIFrozen || isLoading}
                          className={`group relative w-full ${
                            isConnected && isSupabaseConnected && hasEnoughTokens && !isUIFrozen && !isLoading
                              ? 'bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 hover:from-green-400 hover:via-blue-400 hover:to-purple-400 cursor-pointer' 
                              : 'bg-gray-600 cursor-not-allowed opacity-50'
                          } text-white font-bold py-4 md:py-6 px-8 md:px-12 rounded-full text-lg md:text-xl lg:text-2xl transform transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-green-500/25 border-2 border-white/20 overflow-hidden focus:outline-none focus:ring-0`}
                          tabIndex={-1}
                        >
                          {/* Button ripples */}
                          {ripples.map(ripple => (
                            <div
                              key={ripple.id}
                              className="absolute rounded-full bg-white/30 pointer-events-none animate-ping"
                              style={{
                                left: ripple.x,
                                top: ripple.y,
                                width: '10px',
                                height: '10px',
                                transform: 'translate(-50%, -50%)'
                              }}
                            />
                          ))}
                          
                          {/* Button particles */}
                          {particles.map(particle => (
                            <div
                              key={particle.id}
                              className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none animate-bounce"
                              style={{
                                left: particle.x,
                                top: particle.y,
                                transform: 'translate(-50%, -50%)',
                                animationDuration: '1s'
                              }}
                            />
                          ))}

                          <div className="flex items-center justify-center gap-3 relative z-10">
                            <MousePointer className="w-5 h-5 md:w-6 md:h-6" />
                            <span>
                              {!isConnected 
                                ? 'CONNECT WALLET' 
                                : !isSupabaseConnected
                                  ? 'DATABASE DISCONNECTED'
                                  : !hasEnoughTokens
                                    ? 'NEED OBGC TOKENS'
                                    : isLoading
                                      ? 'LOADING...'
                                      : isUIFrozen 
                                        ? 'SECURITY CHECK...' 
                                        : 'CLICK NOW!'
                              }
                            </span>
                            <Zap className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
                          </div>

                          {/* Button glow effect */}
                          {isConnected && isSupabaseConnected && hasEnoughTokens && !isUIFrozen && !isLoading && (
                            <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                          )}
                        </button>
                      </div>

                      {/* Submit Button */}
                      {isConnected && isSupabaseConnected && pendingClicks > 0 && (
                        <div className="relative">
                          <button
                            onClick={handleSubmitBatch}
                            disabled={isSubmittingBatch || pendingClicks === 0}
                            className={`group relative w-full ${
                              !isSubmittingBatch && pendingClicks > 0
                                ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 hover:from-purple-400 hover:via-blue-400 hover:to-indigo-400 cursor-pointer' 
                                : 'bg-gray-600 cursor-not-allowed opacity-50'
                            } text-white font-bold py-3 md:py-4 px-4 md:px-6 rounded-full text-sm md:text-base transform transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xl hover:shadow-purple-500/25 border-2 border-white/20`}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isSubmittingBatch ? (
                                <>
                                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                  <span className="text-xs md:text-sm">STORING...</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-4 h-4" />
                                  <span className="text-xs md:text-sm">STORE {pendingClicks} CLICKS</span>
                                  {isUsingHelius && <Star className="w-2 h-2" />}
                                </>
                              )}
                            </div>

                            {/* Button glow effect */}
                            {!isSubmittingBatch && pendingClicks > 0 && (
                              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Sidebar - Leaderboard */}
                <div className="lg:col-span-1">
                  <Leaderboard 
                    leaderboard={leaderboard}
                    currentUserRank={userRank}
                    currentUserClicks={userClicks}
                    isLoading={isLoading}
                  />
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'tokens' ? (
          <div className="flex-1 px-4 md:px-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Token Requirements */}
              <TokenRequirementDisplay
                globalClickCount={totalClicks}
                userTokenBalance={userTokenBalance}
              />
              
              {/* Bonding Curve Chart */}
              <BondingCurveChart
                currentClickCount={totalClicks}
              />
            </div>
          </div>
        ) : activeTab === 'transactions' ? (
          <div className="flex-1 px-4 md:px-6">
            <div className="max-w-4xl mx-auto">
              <TransactionScanner 
                userAddress={userAddress}
                recentTransactions={recentTransactions}
              />
            </div>
          </div>
        ) : (
          <AboutUs />
        )}

        {/* Minimal Footer */}
        <footer className="mt-6 md:mt-8 p-4 md:p-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-slate-400 text-xs md:text-sm">
                  Join the challenge to reach 1 billion clicks together!
                </div>
              </div>
              
              <button
                onClick={refreshData}
                className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <WalletContextProvider>
      <AppContent />
    </WalletContextProvider>
  );
}

export default App;