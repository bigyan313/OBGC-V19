import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut, Shield, AlertCircle, CheckCircle, Smartphone } from 'lucide-react';
import { WalletPermissionModal } from './WalletPermissionModal';

// Mobile detection utility
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Check if Phantom app is installed on mobile
const isPhantomMobileInstalled = () => {
  if (!isMobile()) return false;
  
  // Check if we're in the Phantom in-app browser
  return !!(window as any).phantom?.solana?.isPhantom;
};

// Get Phantom mobile deep link
const getPhantomMobileDeepLink = () => {
  const currentUrl = encodeURIComponent(window.location.href);
  return `phantom://browse/${currentUrl}?ref=${encodeURIComponent(window.location.origin)}`;
};

export const WalletButton: React.FC = () => {
  const { connected, disconnect, publicKey, connect, wallet, connecting } = useWallet();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
  const [showMobileInstructions, setShowMobileInstructions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // Monitor wallet connection state
  useEffect(() => {
    if (connecting) {
      setIsConnecting(true);
    } else {
      setIsConnecting(false);
    }
  }, [connecting]);

  // Monitor wallet connection errors
  useEffect(() => {
    const handleWalletError = (event: any) => {
      console.error('Wallet error:', event);
      if (event.error && event.error.message && event.error.message.includes('User rejected')) {
        setShowRejectionMessage(true);
        setIsConnecting(false);
        // Hide the message after 3 seconds
        setTimeout(() => {
          setShowRejectionMessage(false);
        }, 3000);
      }
    };

    // Listen for wallet adapter errors
    window.addEventListener('wallet-error', handleWalletError);
    
    return () => {
      window.removeEventListener('wallet-error', handleWalletError);
    };
  }, []);

  const handleConnectClick = () => {
    const mobile = isMobile();
    const phantomMobileInstalled = isPhantomMobileInstalled();
    
    console.log('Mobile:', mobile, 'Phantom installed:', phantomMobileInstalled);
    
    // Desktop flow
    if (!mobile) {
      // Check if Phantom is installed on desktop
      if (typeof window !== 'undefined' && !window.phantom?.solana) {
        const shouldInstall = window.confirm(
          'Phantom wallet is required to participate in clicking. Would you like to install Phantom wallet?'
        );
        
        if (shouldInstall) {
          window.open('https://phantom.app/', '_blank');
        }
        return;
      }
      
      setShowPermissionModal(true);
      return;
    }
    
    // Mobile flow
    if (phantomMobileInstalled) {
      // We're already in Phantom mobile app
      setShowPermissionModal(true);
    } else {
      // Show mobile instructions
      setShowMobileInstructions(true);
    }
  };

  const handleMobileConnect = () => {
    const deepLink = getPhantomMobileDeepLink();
    
    // Try to open Phantom app
    window.location.href = deepLink;
    
    // Fallback: if app doesn't open in 2 seconds, redirect to app store
    setTimeout(() => {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const storeUrl = isIOS 
        ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
        : 'https://play.google.com/store/apps/details?id=app.phantom';
      
      if (confirm('Phantom app not found. Would you like to download it?')) {
        window.open(storeUrl, '_blank');
      }
    }, 2000);
    
    setShowMobileInstructions(false);
  };

  const handlePermissionAccept = async () => {
    setShowPermissionModal(false);
    setIsConnecting(true);
    
    try {
      if (wallet && wallet.adapter.name === 'Phantom') {
        await connect();
      } else {
        // Check if Phantom is available
        if (typeof window !== 'undefined' && window.phantom?.solana) {
          // Trigger the wallet modal to show Phantom
          const walletButton = document.querySelector('.wallet-adapter-button') as HTMLButtonElement;
          if (walletButton) {
            walletButton.click();
          }
        } else {
          throw new Error('Phantom wallet not detected');
        }
      }
    } catch (error: any) {
      console.error('Phantom wallet connection failed:', error);
      setIsConnecting(false);
      
      // Check if user rejected the request
      if (error.message && (error.message.includes('User rejected') || error.message.includes('rejected'))) {
        setShowRejectionMessage(true);
        setTimeout(() => {
          setShowRejectionMessage(false);
        }, 3000);
      } else if (error.message && error.message.includes('not detected')) {
        alert('Phantom wallet not detected. Please install Phantom wallet from https://phantom.app/');
      } else {
        // Show generic error
        alert('Failed to connect to Phantom wallet. Please make sure Phantom is installed and try again.');
      }
    }
  };

  const handlePermissionDecline = () => {
    setShowPermissionModal(false);
    setShowMobileInstructions(false);
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (connected && publicKey) {
    return (
      <>
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 border border-white/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-white font-medium text-sm">
                {formatAddress(publicKey.toString())}
              </span>
              <div className="flex items-center gap-1 text-xs text-purple-300">
                <Wallet className="w-3 h-3" />
                <span>Phantom</span>
                {isMobile() && <Smartphone className="w-3 h-3" />}
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 p-2 rounded-xl border border-red-500/30 transition-all duration-200"
            title="Disconnect Phantom Wallet"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={handleConnectClick}
          disabled={isConnecting}
          className={`${
            isConnecting 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 hover:scale-105'
          } text-white font-bold py-2 px-6 rounded-xl text-sm transform transition-all duration-200 shadow-lg hover:shadow-purple-500/25 border-2 border-white/20 flex items-center gap-2`}
        >
          {isConnecting ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Phantom</span>
              {isMobile() && <Smartphone className="w-3 h-3" />}
            </>
          )}
        </button>

        {/* Rejection message */}
        {showRejectionMessage && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-orange-500/90 backdrop-blur-lg text-white text-xs px-3 py-2 rounded-lg border border-orange-400/30 flex items-center gap-2 animate-fade-in z-50">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>Phantom wallet connection was cancelled</span>
          </div>
        )}
      </div>

      {/* Hidden WalletMultiButton for fallback connection - only shows Phantom */}
      <div className="hidden">
        <WalletMultiButton />
      </div>

      {/* Mobile Instructions Modal */}
      {showMobileInstructions && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/20 max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-8 h-8 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Mobile Wallet Connection</h2>
              </div>
              
              <div className="space-y-4 text-slate-300">
                <p className="text-sm">
                  To connect your Phantom wallet on mobile, you have two options:
                </p>
                
                <div className="space-y-3">
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                    <h3 className="font-semibold text-blue-400 mb-2">Option 1: Open in Phantom App</h3>
                    <p className="text-xs text-blue-200 mb-3">
                      Open this website directly in the Phantom mobile app browser for seamless connection.
                    </p>
                    <button
                      onClick={handleMobileConnect}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Open in Phantom App
                    </button>
                  </div>
                  
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <h3 className="font-semibold text-purple-400 mb-2">Option 2: Use WalletConnect</h3>
                    <p className="text-xs text-purple-200 mb-3">
                      If you have Phantom installed, try connecting through the wallet adapter.
                    </p>
                    <button
                      onClick={handlePermissionAccept}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      Try WalletConnect
                    </button>
                  </div>
                </div>
                
                <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-orange-200">
                      <p className="font-semibold mb-1">Don't have Phantom?</p>
                      <p>Download the Phantom app from your device's app store first.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePermissionDecline}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                    const storeUrl = isIOS 
                      ? 'https://apps.apple.com/app/phantom-solana-wallet/id1598432977'
                      : 'https://play.google.com/store/apps/details?id=app.phantom';
                    window.open(storeUrl, '_blank');
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Download Phantom
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <WalletPermissionModal
        isOpen={showPermissionModal}
        onAccept={handlePermissionAccept}
        onDecline={handlePermissionDecline}
      />
    </>
  );
};