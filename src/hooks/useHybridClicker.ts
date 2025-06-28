import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  Connection,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import { HELIUS_CONFIG, HELIUS_RPC_ENDPOINTS, heliusApi } from '../config/helius';
import { db, LeaderboardEntry, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import { fetchTokenBalanceWithDecimals } from '../utils/tokenBalance';

interface TransactionRecord {
  signature: string;
  timestamp: number;
  clicks: number;
  status: 'confirmed' | 'pending' | 'failed';
  explorerUrl: string;
}

interface HybridClickerData {
  totalClicks: number;
  userClicks: number;
  pendingClicks: number;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  uniqueWallets: number;
  isLoading: boolean;
  lastUpdate: number;
  recentTransactions: TransactionRecord[];
  isSupabaseConnected: boolean;
  blockchainClicks: number;
  databaseClicks: number;
}

// Solana Memo Program ID (official program for storing arbitrary data)
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// Storage keys
const PENDING_CLICKS_KEY = 'hybrid_pending_clicks';
const TRANSACTIONS_KEY = 'hybrid_recent_transactions';
const BLOCKCHAIN_CLICKS_KEY = 'blockchain_clicks_cache';
const TOKEN_BALANCE_CACHE_KEY = 'obgc_token_balance_cache';

export const useHybridClicker = () => {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const { connection: defaultConnection } = useConnection();
  
  const [data, setData] = useState<HybridClickerData>({
    totalClicks: 0,
    userClicks: 0,
    pendingClicks: 0,
    leaderboard: [],
    uniqueWallets: 0,
    isLoading: true,
    lastUpdate: 0,
    recentTransactions: [],
    isSupabaseConnected: false,
    blockchainClicks: 0,
    databaseClicks: 0,
  });
  
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isUIFrozen, setIsUIFrozen] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string>('');
  const [endpointHealth, setEndpointHealth] = useState<{ [key: string]: boolean }>({});
  const [priorityFee, setPriorityFee] = useState<number>(5000);
  const [lastDataFetch, setLastDataFetch] = useState<number>(0);
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);
  const [isLoadingTokenBalance, setIsLoadingTokenBalance] = useState(false);
  const [lastTokenBalanceFetch, setLastTokenBalanceFetch] = useState<number>(0);
  const [notificationCallback, setNotificationCallback] = useState<{
    showSuccess?: (title: string, message: string, options?: any) => void;
    showError?: (title: string, message: string, options?: any) => void;
    showWarning?: (title: string, message: string, options?: any) => void;
    showInfo?: (title: string, message: string, options?: any) => void;
  }>({});

  // Set notification callbacks
  const setNotifications = useCallback((callbacks: typeof notificationCallback) => {
    setNotificationCallback(callbacks);
  }, []);

  // Get the best working connection with minimal requests
  const getWorkingConnection = useCallback(async (): Promise<{ connection: Connection; endpoint: string }> => {
    // Try to reuse the default connection first
    try {
      setCurrentEndpoint('default');
      return { connection: defaultConnection, endpoint: 'default' };
    } catch (error) {
      console.warn('Default connection failed, trying alternatives...');
    }

    // Only try alternative endpoints if default fails
    for (const endpoint of HELIUS_RPC_ENDPOINTS.slice(0, 3)) { // Limit to first 3 endpoints
      try {
        const connection = new Connection(endpoint, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 10000, // Reduced timeout
        });
        
        setCurrentEndpoint(endpoint);
        setEndpointHealth(prev => ({ ...prev, [endpoint]: true }));
        
        // Only get priority fees occasionally
        if (Math.random() < 0.1) { // 10% chance to update priority fees
          try {
            const recommendedFee = await heliusApi.getPriorityFees(connection);
            setPriorityFee(recommendedFee);
          } catch (error) {
            setPriorityFee(5000);
          }
        }
        
        return { connection, endpoint };
      } catch (error: any) {
        setEndpointHealth(prev => ({ ...prev, [endpoint]: false }));
        continue;
      }
    }

    setCurrentEndpoint('default (degraded)');
    return { connection: defaultConnection, endpoint: 'default-fallback' };
  }, [defaultConnection]);

  // Cache token balance
  const getCachedTokenBalance = useCallback(() => {
    if (!publicKey) return { balance: 0, timestamp: 0 };
    
    try {
      const cached = localStorage.getItem(TOKEN_BALANCE_CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        const userCache = data[publicKey.toString()];
        if (userCache) {
          return userCache;
        }
      }
    } catch (error) {
      console.warn('Failed to get cached token balance:', error);
    }
    
    return { balance: 0, timestamp: 0 };
  }, [publicKey]);

  const setCachedTokenBalance = useCallback((balance: number) => {
    if (!publicKey) return;
    
    try {
      const cached = localStorage.getItem(TOKEN_BALANCE_CACHE_KEY);
      const data = cached ? JSON.parse(cached) : {};
      
      data[publicKey.toString()] = {
        balance,
        timestamp: Date.now()
      };
      
      localStorage.setItem(TOKEN_BALANCE_CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to cache token balance:', error);
    }
  }, [publicKey]);

  // Fetch OBGC token balance
  const fetchUserTokenBalance = useCallback(async () => {
    if (!publicKey || !connected) {
      setUserTokenBalance(0);
      return;
    }

    const now = Date.now();
    const CACHE_DURATION = 30000; // 30 seconds cache

    // Check cache first
    const cached = getCachedTokenBalance();
    if (cached.balance > 0 && (now - cached.timestamp) < CACHE_DURATION) {
      setUserTokenBalance(cached.balance);
      return;
    }

    // Rate limit token balance fetching
    if (now - lastTokenBalanceFetch < 10000) { // 10 seconds minimum between fetches
      return;
    }

    try {
      setIsLoadingTokenBalance(true);
      setLastTokenBalanceFetch(now);
      
      const { connection } = await getWorkingConnection();
      const { balance } = await fetchTokenBalanceWithDecimals(connection, publicKey.toString());
      
      setUserTokenBalance(balance);
      setCachedTokenBalance(balance);
      
      console.log(`✅ OBGC token balance updated: ${balance}`);
      
    } catch (error) {
      console.error('❌ Failed to fetch OBGC token balance:', error);
      
      // Use cached balance if available, otherwise set to 0
      const cached = getCachedTokenBalance();
      setUserTokenBalance(cached.balance || 0);
      
      // Only show error notification if it's a critical error and user has no cached balance
      if (!cached.balance) {
        notificationCallback.showWarning?.(
          'Token Balance Error',
          'Unable to fetch OBGC token balance. Please check your connection and try again.'
        );
      }
    } finally {
      setIsLoadingTokenBalance(false);
    }
  }, [publicKey, connected, getWorkingConnection, getCachedTokenBalance, setCachedTokenBalance, lastTokenBalanceFetch, notificationCallback]);

  // Storage functions
  const getPendingClicks = useCallback(() => {
    if (!publicKey) return 0;
    try {
      const stored = localStorage.getItem(PENDING_CLICKS_KEY);
      const pendingData = stored ? JSON.parse(stored) : {};
      return pendingData[publicKey.toString()] || 0;
    } catch (error) {
      return 0;
    }
  }, [publicKey]);

  const storePendingClicks = useCallback((clicks: number) => {
    if (!publicKey) return;
    try {
      const stored = localStorage.getItem(PENDING_CLICKS_KEY);
      const pendingData = stored ? JSON.parse(stored) : {};
      pendingData[publicKey.toString()] = clicks;
      localStorage.setItem(PENDING_CLICKS_KEY, JSON.stringify(pendingData));
    } catch (error) {
      console.error('Failed to store pending clicks:', error);
    }
  }, [publicKey]);

  const getRecentTransactions = useCallback((): TransactionRecord[] => {
    if (!publicKey) return [];
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const transactionData = stored ? JSON.parse(stored) : {};
      return transactionData[publicKey.toString()] || [];
    } catch (error) {
      return [];
    }
  }, [publicKey]);

  const storeTransaction = useCallback((transaction: TransactionRecord) => {
    if (!publicKey) return;
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const transactionData = stored ? JSON.parse(stored) : {};
      const userTransactions = transactionData[publicKey.toString()] || [];
      
      userTransactions.unshift(transaction);
      transactionData[publicKey.toString()] = userTransactions.slice(0, 20);
      
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactionData));
    } catch (error) {
      console.error('Failed to store transaction:', error);
    }
  }, [publicKey]);

  const getBlockchainClicks = useCallback(() => {
    if (!publicKey) return 0;
    try {
      const stored = localStorage.getItem(BLOCKCHAIN_CLICKS_KEY);
      const blockchainData = stored ? JSON.parse(stored) : {};
      return blockchainData[publicKey.toString()] || 0;
    } catch (error) {
      return 0;
    }
  }, [publicKey]);

  const storeBlockchainClicks = useCallback((clicks: number) => {
    if (!publicKey) return;
    try {
      const stored = localStorage.getItem(BLOCKCHAIN_CLICKS_KEY);
      const blockchainData = stored ? JSON.parse(stored) : {};
      blockchainData[publicKey.toString()] = clicks;
      localStorage.setItem(BLOCKCHAIN_CLICKS_KEY, JSON.stringify(blockchainData));
    } catch (error) {
      console.error('Failed to store blockchain clicks:', error);
    }
  }, [publicKey]);

  // Test Supabase connection (cached)
  const checkSupabaseConnection = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setData(prev => ({ ...prev, isSupabaseConnected: false }));
      return false;
    }

    try {
      const isConnected = await testSupabaseConnection();
      setData(prev => ({ ...prev, isSupabaseConnected: isConnected }));
      return isConnected;
    } catch (error) {
      setData(prev => ({ ...prev, isSupabaseConnected: false }));
      return false;
    }
  }, []);

  // Read all data (with rate limiting)
  const readHybridData = useCallback(async () => {
    const now = Date.now();
    
    // Rate limit data fetching to once every 10 seconds
    if (now - lastDataFetch < 10000) {
      console.log('⏸️ Skipping data fetch due to rate limiting');
      return;
    }
    
    try {
      console.log('🔄 Reading hybrid data (rate limited)...');
      setData(prev => ({ ...prev, isLoading: true }));
      setLastDataFetch(now);

      // Check Supabase connection (cached)
      const isSupabaseConnected = await checkSupabaseConnection();
      
      let totalClicks = 0;
      let uniqueWallets = 0;
      let leaderboard: LeaderboardEntry[] = [];
      let userClicks = 0;
      let userRank: number | undefined;
      let databaseClicks = 0;

      // Get data from Supabase (only if connected)
      if (isSupabaseConnected) {
        try {
          const globalStats = await db.getGlobalStats();
          totalClicks = globalStats?.total_clicks || 0;
          uniqueWallets = globalStats?.total_users || 0;

          leaderboard = await db.getLeaderboard(10);

          if (connected && publicKey) {
            const user = await db.getUser(publicKey.toString());
            databaseClicks = user?.total_clicks || 0;

            const rankData = await db.getUserRank(publicKey.toString());
            userRank = rankData.rank || undefined;
          }
        } catch (error) {
          console.warn('Failed to fetch Supabase data:', error);
        }
      }

      // Get blockchain clicks from cache
      let blockchainClicks = 0;
      if (connected && publicKey) {
        blockchainClicks = getBlockchainClicks();
      }

      userClicks = databaseClicks;

      const pendingClicks = connected ? getPendingClicks() : 0;
      const recentTransactions = connected ? getRecentTransactions() : [];

      setData(prev => ({
        ...prev,
        totalClicks,
        userClicks,
        pendingClicks,
        leaderboard,
        userRank,
        uniqueWallets,
        isLoading: false,
        lastUpdate: Date.now(),
        recentTransactions,
        isSupabaseConnected,
        blockchainClicks,
        databaseClicks,
      }));

      console.log('✅ Hybrid data updated successfully (rate limited)');

    } catch (error) {
      console.error('❌ Error reading hybrid data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [connected, publicKey, checkSupabaseConnection, getBlockchainClicks, getPendingClicks, getRecentTransactions, lastDataFetch]);

  // Check wallet balance
  const checkWalletBalance = useCallback(async (walletAddress: PublicKey): Promise<boolean> => {
    try {
      const { connection } = await getWorkingConnection();
      const balance = await connection.getBalance(walletAddress, 'confirmed');
      const minimumBalance = 0.001 * LAMPORTS_PER_SOL;
      return balance >= minimumBalance;
    } catch (error) {
      console.warn('Balance check failed:', error);
      return true;
    }
  }, [getWorkingConnection]);

  // Submit to blockchain using memo program and then to database
  const submitBatch = useCallback(async () => {
    if (!publicKey || !sendTransaction || !wallet || isSubmittingBatch) return false;

    const pendingClicks = getPendingClicks();
    if (pendingClicks === 0) {
      notificationCallback.showError?.('No Pending Clicks', 'You need to click first before submitting!');
      return false;
    }

    try {
      setIsSubmittingBatch(true);
      console.log(`🚀 Submitting ${pendingClicks} clicks to Solana MAINNET using memo program...`);

      // Check wallet balance
      const hasBalance = await checkWalletBalance(publicKey);
      if (!hasBalance) {
        notificationCallback.showError?.(
          'Insufficient Balance',
          'You need at least 0.001 SOL in your wallet for MAINNET transaction fees.'
        );
        return false;
      }

      const { connection, endpoint } = await getWorkingConnection();
      
      // Create memo instruction with click data
      const memoData = JSON.stringify({
        app: '1B-Global-Clicks',
        wallet: publicKey.toString(),
        clicks: pendingClicks,
        timestamp: Date.now(),
        version: '1.0'
      });

      const transaction = new Transaction();

      // Add priority fee instruction
      if (priorityFee > 0) {
        const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: priorityFee,
        });
        transaction.add(priorityFeeInstruction);
      }

      // Add memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoData, 'utf8'),
      });
      transaction.add(memoInstruction);

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send transaction
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log(`✅ Memo transaction submitted: ${signature}`);

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }

      console.log(`✅ Transaction confirmed on MAINNET: ${signature}`);

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=mainnet`;
      const newTransaction: TransactionRecord = {
        signature,
        timestamp: Date.now(),
        clicks: pendingClicks,
        status: 'confirmed',
        explorerUrl
      };
      storeTransaction(newTransaction);

      // Update blockchain clicks cache
      const newBlockchainClicks = data.blockchainClicks + pendingClicks;
      storeBlockchainClicks(newBlockchainClicks);

      // Now submit to Supabase database for global stats
      const isSupabaseConnected = await checkSupabaseConnection();
      if (isSupabaseConnected) {
        try {
          await db.addUserClicks(
            publicKey.toString(),
            pendingClicks,
            signature // Include blockchain transaction signature
          );
          console.log('✅ Also stored in Supabase database for global stats');
        } catch (error) {
          console.warn('⚠️ Failed to store in Supabase (blockchain storage successful):', error);
        }
      }

      // Clear pending clicks
      storePendingClicks(0);

      setData(prev => ({
        ...prev,
        blockchainClicks: newBlockchainClicks,
        databaseClicks: prev.databaseClicks + pendingClicks,
        userClicks: prev.userClicks + pendingClicks,
        totalClicks: prev.totalClicks + pendingClicks,
        pendingClicks: 0,
        recentTransactions: [newTransaction, ...prev.recentTransactions.slice(0, 19)]
      }));

      const endpointName = endpoint.includes('helius-rpc.com') ? 'Helius (Premium)' :
                          endpoint.includes('api.mainnet-beta.solana.com') ? 'Solana Labs (Official)' :
                          'Fallback';

      notificationCallback.showSuccess?.(
        '📝 Clicks Stored on Solana MAINNET! 🎉',
        `Successfully stored ${pendingClicks} clicks on Solana MAINNET using memo program via ${endpointName}. Your clicks are now permanently recorded on-chain and visible in global stats! Transaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`,
        {
          duration: 10000,
          link: {
            label: 'View on Solana Explorer',
            url: explorerUrl
          }
        }
      );

      // Refresh data after a delay
      setTimeout(() => {
        readHybridData();
      }, 5000);

      return true;

    } catch (error: any) {
      console.error('❌ Blockchain submission failed:', error);
      
      if (error.message?.includes('insufficient funds')) {
        notificationCallback.showError?.(
          'Insufficient Balance',
          'You need at least 0.001 SOL in your wallet for MAINNET transaction fees.'
        );
      } else if (error.message?.includes('User rejected')) {
        notificationCallback.showWarning?.(
          'Transaction Cancelled',
          'The blockchain transaction was cancelled by the user.'
        );
      } else {
        notificationCallback.showError?.(
          'Blockchain Submission Failed',
          `Failed to submit to blockchain: ${error.message || 'Unknown error occurred'}`
        );
      }
      
      return false;
    } finally {
      setIsSubmittingBatch(false);
    }
  }, [publicKey, sendTransaction, wallet, getPendingClicks, storePendingClicks, storeTransaction, storeBlockchainClicks, data.blockchainClicks, isSubmittingBatch, checkWalletBalance, getWorkingConnection, checkSupabaseConnection, readHybridData, notificationCallback, priorityFee]);

  // Add click locally
  const addClick = useCallback(() => {
    if (!connected || !publicKey || isUIFrozen) return;

    const currentPending = getPendingClicks();
    const newPendingCount = currentPending + 1;

    // Check if user needs captcha
    const totalUserClicks = data.userClicks + newPendingCount;
    if (totalUserClicks > 0 && totalUserClicks % 1000 === 0) {
      setIsUIFrozen(true);
      setShowCaptcha(true);
      storePendingClicks(newPendingCount);
      setData(prev => ({ ...prev, pendingClicks: newPendingCount }));
      return;
    }

    storePendingClicks(newPendingCount);
    setData(prev => ({ ...prev, pendingClicks: newPendingCount }));
  }, [connected, publicKey, isUIFrozen, data.userClicks, getPendingClicks, storePendingClicks]);

  // Handle captcha
  const handleCaptchaSuccess = useCallback(() => {
    setShowCaptcha(false);
    setIsUIFrozen(false);
  }, []);

  const handleCaptchaClose = useCallback(() => {
    setShowCaptcha(false);
    setIsUIFrozen(false);
  }, []);

  // Refresh data (with rate limiting)
  const refreshData = useCallback(async () => {
    console.log('🔄 Manual refresh requested...');
    setLastDataFetch(0); // Reset rate limit for manual refresh
    await readHybridData();
    
    // Also refresh token balance
    if (connected && publicKey) {
      setLastTokenBalanceFetch(0); // Reset rate limit for manual refresh
      await fetchUserTokenBalance();
    }
  }, [readHybridData, connected, publicKey, fetchUserTokenBalance]);

  // Initialize (only once)
  useEffect(() => {
    console.log('🚀 Initializing simplified Solana memo + Supabase hybrid system...');
    readHybridData();
  }, []); // Empty dependency array to run only once

  // Set up polling with much longer intervals
  useEffect(() => {
    const interval = setInterval(() => {
      readHybridData().catch(error => {
        console.warn('Hybrid polling error (will retry):', error);
      });
    }, 60000); // Increased to 60 seconds to reduce requests

    return () => clearInterval(interval);
  }, [readHybridData]);

  // Fetch token balance when wallet connects or changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTokenBalance();
      
      // Set up token balance polling (less frequent)
      const tokenInterval = setInterval(() => {
        fetchUserTokenBalance().catch(error => {
          console.warn('Token balance polling error (will retry):', error);
        });
      }, 120000); // Every 2 minutes
      
      return () => clearInterval(tokenInterval);
    } else {
      setUserTokenBalance(0);
    }
  }, [connected, publicKey, fetchUserTokenBalance]);

  // Update user state when wallet changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setData(prev => ({
        ...prev,
        userClicks: 0,
        pendingClicks: 0,
        recentTransactions: [],
        userRank: undefined,
        blockchainClicks: 0,
        databaseClicks: 0,
      }));
      setUserTokenBalance(0);
      setIsUIFrozen(false);
      setShowCaptcha(false);
    } else {
      const pending = getPendingClicks();
      const transactions = getRecentTransactions();
      const blockchainClicks = getBlockchainClicks();
      setData(prev => ({ 
        ...prev, 
        pendingClicks: pending,
        recentTransactions: transactions,
        blockchainClicks,
      }));
      // Only refresh data if it's been a while
      if (Date.now() - lastDataFetch > 30000) {
        readHybridData();
      }
    }
  }, [connected, publicKey, getPendingClicks, getRecentTransactions, getBlockchainClicks, lastDataFetch, readHybridData]);

  return {
    ...data,
    addClick,
    submitBatch, // Now uses memo program + database storage
    isConnected: connected,
    userAddress: publicKey?.toString(),
    showCaptcha,
    isUIFrozen,
    handleCaptchaSuccess,
    handleCaptchaClose,
    isSubmittingBatch,
    refreshData,
    currentEndpoint,
    endpointHealth,
    priorityFee,
    setNotifications,
    checkSupabaseConnection,
    isProgramInitialized: true, // Always true since we don't need custom program
    initializeProgramState: async () => true, // No-op since memo program is always available
    userTokenBalance,
    isLoadingTokenBalance,
  };
};