import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, LogOut, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { WalletPermissionModal } from './WalletPermissionModal';

export const WalletButton: React.FC = () => {
  const { connected, disconnect, publicKey, connect, wallet, connecting } = useWallet();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showRejectionMessage, setShowRejectionMessage] = useState(false);
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
    // Check if Phantom is installed
    if (typeof window !== 'undefined' && !window.phantom?.solana) {
      // Phantom not detected, show installation prompt
      const shouldInstall = window.confirm(
        'Phantom wallet is required to participate in clicking. Would you like to install Phantom wallet?'
      );
      
      if (shouldInstall) {
        window.open('https://phantom.app/', '_blank');
      }
      return;
    }

    setShowPermissionModal(true);
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

      <WalletPermissionModal
        isOpen={showPermissionModal}
        onAccept={handlePermissionAccept}
        onDecline={handlePermissionDecline}
      />
    </>
  );
};