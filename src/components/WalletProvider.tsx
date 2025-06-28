import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { HELIUS_CONFIG, RELIABLE_RPC_ENDPOINTS, HELIUS_CONNECTION_CONFIG } from '../config/helius';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  // Use mainnet for production
  const network = WalletAdapterNetwork.Mainnet;
  
  const endpoint = useMemo(() => {
    // Only use Helius if API key is properly configured
    if (HELIUS_CONFIG.apiKey && HELIUS_CONFIG.apiKey.trim() !== '' && HELIUS_CONFIG.rpcUrl) {
      console.log('🚀 Using Helius RPC as primary endpoint');
      return HELIUS_CONFIG.rpcUrl;
    }
    
    // Use the most reliable public endpoint as default
    console.log('⚠️ No Helius API key found, using reliable public endpoint');
    return RELIABLE_RPC_ENDPOINTS[0]; // Official Solana Labs endpoint
  }, [network]);

  // Only include Phantom wallet - no other wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider 
      endpoint={endpoint}
      config={{
        ...HELIUS_CONNECTION_CONFIG,
        // Override with Helius-specific settings if using Helius
        ...(endpoint.includes('helius') ? {
          wsEndpoint: HELIUS_CONFIG.wsUrl,
        } : {}),
      }}
    >
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false} // Disable auto-connect to prevent unwanted wallet detection
        onError={(error, adapter) => {
          console.warn('Wallet error:', error, 'Adapter:', adapter?.name);
          
          // Only handle Phantom wallet errors
          if (adapter?.name === 'Phantom') {
            // Dispatch custom event for error handling
            const errorEvent = new CustomEvent('wallet-error', {
              detail: { error, adapter }
            });
            window.dispatchEvent(errorEvent);
          }
        }}
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};