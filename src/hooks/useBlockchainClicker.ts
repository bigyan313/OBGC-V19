import { useState, useEffect, useCallback } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { 
  PublicKey, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  Connection,
} from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { HELIUS_CONFIG, HELIUS_RPC_ENDPOINTS, heliusApi } from '../config/helius';
import { Web3Obgc, IDL } from '../types/anchor';

interface LeaderboardEntry {
  address: string;
  clicks: number;
  rank: number;
}

interface Transaction {
  signature: string;
  timestamp: number;
  clicks: number;
  status: 'confirmed' | 'pending' | 'failed';
}

interface BlockchainClickerData {
  totalClicks: number;
  userClicks: number;
  pendingClicks: number;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  uniqueWallets: number;
  isLoading: boolean;
  lastUpdate: number;
  recentTransactions: Transaction[];
}

// Your deployed Program ID on MAINNET - THE ONLY PROGRAM WE USE
const PROGRAM_ID = new PublicKey('Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t');

// Storage keys for pending clicks only (everything else comes from Anchor program)
const PENDING_CLICKS_KEY = 'solana_pending_clicks';
const TRANSACTIONS_KEY = 'solana_recent_transactions';

export const useBlockchainClicker = () => {
  const { publicKey, connected, sendTransaction, wallet } = useWallet();
  const { connection: defaultConnection } = useConnection();
  
  const [data, setData] = useState<BlockchainClickerData>({
    totalClicks: 0,
    userClicks: 0,
    pendingClicks: 0,
    leaderboard: [],
    uniqueWallets: 0,
    isLoading: true,
    lastUpdate: 0,
    recentTransactions: [],
  });
  
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isUIFrozen, setIsUIFrozen] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string>('');
  const [endpointHealth, setEndpointHealth] = useState<{ [key: string]: boolean }>({});
  const [priorityFee, setPriorityFee] = useState<number>(5000);
  const [program, setProgram] = useState<Program<Web3Obgc> | null>(null);
  const [isProgramInitialized, setIsProgramInitialized] = useState(true);
  const [notificationCallback, setNotificationCallback] = useState<{
    showSuccess?: (title: string, message: string, options?: any) => void;
    showError?: (title: string, message: string, options?: any) => void;
    showWarning?: (title: string, message: string, options?: any) => void;
  }>({});

  // Set notification callbacks
  const setNotifications = useCallback((callbacks: typeof notificationCallback) => {
    setNotificationCallback(callbacks);
  }, []);

  // Get the best working connection
  const getWorkingConnection = useCallback(async (): Promise<{ connection: Connection; endpoint: string }> => {
    console.log('🔍 Finding working MAINNET RPC endpoint for 100% Web3...');
    
    for (const endpoint of HELIUS_RPC_ENDPOINTS) {
      try {
        const isHelius = endpoint.includes('helius-rpc.com');
        console.log(`🧪 Testing MAINNET endpoint: ${isHelius ? 'Helius (Premium)' : endpoint}`);
        
        const connection = new Connection(endpoint, {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 15000,
        });
        
        await Promise.race([
          connection.getSlot('confirmed'),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        
        console.log(`✅ Successfully connected to MAINNET: ${isHelius ? 'Helius (Premium)' : endpoint}`);
        setCurrentEndpoint(endpoint);
        setEndpointHealth(prev => ({ ...prev, [endpoint]: true }));
        
        // Get priority fees
        try {
          const recommendedFee = await heliusApi.getPriorityFees(connection);
          setPriorityFee(recommendedFee);
          console.log(`💰 MAINNET recommended priority fee: ${recommendedFee} microlamports`);
        } catch (error) {
          console.warn('Failed to get MAINNET priority fees, using default:', error);
          setPriorityFee(5000);
        }
        
        return { connection, endpoint };
      } catch (error: any) {
        console.warn(`❌ MAINNET endpoint ${endpoint} failed:`, error.message);
        setEndpointHealth(prev => ({ ...prev, [endpoint]: false }));
        continue;
      }
    }

    console.warn('🚨 All MAINNET connections failed, using default as last resort');
    setCurrentEndpoint('default (degraded)');
    return { connection: defaultConnection, endpoint: 'default-fallback' };
  }, [defaultConnection]);

  // Get Program Derived Addresses
  const getPDAs = useCallback((userPublicKey?: PublicKey) => {
    const [globalStatePDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('global_state')],
      PROGRAM_ID
    );

    let userStatePDA = null;
    if (userPublicKey) {
      [userStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from('user_state'), userPublicKey.toBuffer()],
        PROGRAM_ID
      );
    }

    return { globalStatePDA, userStatePDA };
  }, []);

  // Initialize Anchor program
  const initializeProgram = useCallback(async () => {
    try {
      const { connection } = await getWorkingConnection();
      
      // Create a read-only provider for fetching data
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: PublicKey.default,
          signTransaction: async () => { throw new Error('Read-only provider'); },
          signAllTransactions: async () => { throw new Error('Read-only provider'); },
        } as any,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );
      
      const programInstance = new Program<Web3Obgc>(IDL, PROGRAM_ID, provider);
      setProgram(programInstance);
      
      console.log('✅ Anchor program initialized for 100% Web3 reading');
      console.log(`📍 MAINNET Program ID: ${PROGRAM_ID.toString()}`);
      
      // Check if program is initialized
      await checkProgramInitialization(programInstance);
      
    } catch (error) {
      console.error('❌ Failed to initialize Anchor program on MAINNET:', error);
      setProgram(null);
      console.log('🔄 Will retry program initialization...');
    }
  }, [getWorkingConnection]);

  // Check if program is initialized by trying to fetch global state
  const checkProgramInitialization = useCallback(async (programInstance: Program<Web3Obgc>) => {
    try {
      const { globalStatePDA } = getPDAs();
      
      // Try to fetch the global state account
      const globalState = await programInstance.account.globalState.fetch(globalStatePDA);
      console.log('✅ Program is initialized and working! Global state:', {
        totalClicks: globalState.totalClicks.toString(),
        totalUsers: globalState.totalUsers.toString(),
        authority: globalState.authority.toString()
      });
      
      setIsProgramInitialized(true);
      return true;
    } catch (error: any) {
      // If account doesn't exist, program needs initialization
      if (error.message?.includes('Account does not exist') || 
          error.message?.includes('Invalid account discriminator') ||
          error.code === 'AccountNotFound') {
        console.log('⚠️ Program global state not found - needs initialization');
        setIsProgramInitialized(false);
        return false;
      }
      
      // Other errors might be network issues - don't change state
      console.warn('⚠️ Error checking program initialization (network issue?):', error.message);
      return isProgramInitialized;
    }
  }, [getPDAs, isProgramInitialized]);

  // Initialize the program's global state (only when wallet is connected)
  const initializeProgramState = useCallback(async () => {
    if (!wallet || !connected || !publicKey) {
      notificationCallback.showError?.(
        'Wallet Required',
        'Please connect your Phantom wallet to initialize the program.'
      );
      return false;
    }

    try {
      console.log('🚀 Initializing MAINNET program state...');
      
      const { connection } = await getWorkingConnection();
      
      // Create provider with connected wallet
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );
      
      const programInstance = new Program<Web3Obgc>(IDL, PROGRAM_ID, provider);
      const { globalStatePDA } = getPDAs();
      
      // Check if already initialized
      try {
        await programInstance.account.globalState.fetch(globalStatePDA);
        console.log('✅ Program already initialized');
        setIsProgramInitialized(true);
        
        notificationCallback.showSuccess?.(
          'Program Already Initialized! ✅',
          'The Anchor program is already initialized on Solana MAINNET. You can start clicking now!',
          { duration: 5000 }
        );
        
        return true;
      } catch (error) {
        // Program not initialized, proceed with initialization
        console.log('📝 Program not initialized, proceeding...');
      }
      
      const tx = await programInstance.methods
        .initialize()
        .accounts({
          globalState: globalStatePDA,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('✅ MAINNET program initialized with transaction:', tx);
      setIsProgramInitialized(true);
      
      notificationCallback.showSuccess?.(
        'MAINNET Program Initialized! 🎉',
        'The Anchor program has been successfully initialized on Solana MAINNET. Now everyone can start clicking!',
        {
          duration: 8000,
          link: {
            label: 'View on Solana Explorer',
            url: `https://explorer.solana.com/tx/${tx}?cluster=mainnet`
          }
        }
      );
      
      // Refresh the program instance to use the connected wallet
      await initializeProgram();
      
      return true;
    } catch (error: any) {
      console.error('❌ Failed to initialize MAINNET program:', error);
      
      // Check if it's already initialized error
      if (error.message?.includes('already in use') || 
          error.message?.includes('custom program error: 0x0')) {
        console.log('✅ Program was already initialized by another user');
        setIsProgramInitialized(true);
        
        notificationCallback.showSuccess?.(
          'Program Already Initialized! ✅',
          'The Anchor program was already initialized by another user. You can start clicking now!',
          { duration: 5000 }
        );
        
        return true;
      }
      
      notificationCallback.showError?.(
        'MAINNET Initialization Failed',
        `Failed to initialize the program on MAINNET: ${error.message || 'Unknown error'}`
      );
      
      return false;
    }
  }, [wallet, connected, publicKey, notificationCallback, getPDAs, getWorkingConnection, initializeProgram]);

  // Get pending clicks for current user
  const getPendingClicks = useCallback(() => {
    if (!publicKey) return 0;
    try {
      const stored = localStorage.getItem(PENDING_CLICKS_KEY);
      const pendingData = stored ? JSON.parse(stored) : {};
      const userPending = pendingData[publicKey.toString()] || 0;
      return userPending;
    } catch (error) {
      console.error('Failed to load pending clicks:', error);
      return 0;
    }
  }, [publicKey]);

  // Store pending clicks
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

  // Get recent transactions
  const getRecentTransactions = useCallback((): Transaction[] => {
    if (!publicKey) return [];
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const transactionData = stored ? JSON.parse(stored) : {};
      return transactionData[publicKey.toString()] || [];
    } catch (error) {
      console.error('Failed to load transactions:', error);
      return [];
    }
  }, [publicKey]);

  // Store transaction
  const storeTransaction = useCallback((transaction: Transaction) => {
    if (!publicKey) return;
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY);
      const transactionData = stored ? JSON.parse(stored) : {};
      const userTransactions = transactionData[publicKey.toString()] || [];
      
      userTransactions.unshift(transaction);
      transactionData[publicKey.toString()] = userTransactions.slice(0, 10);
      
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactionData));
    } catch (error) {
      console.error('Failed to store transaction:', error);
    }
  }, [publicKey]);

  // Read ALL data from blockchain - TRUE WEB3
  const readBlockchainData = useCallback(async () => {
    try {
      console.log('🔄 Reading 100% Web3 data from MAINNET Anchor program...');
      setData(prev => ({ ...prev, isLoading: true }));

      if (!program) {
        console.log('⚠️ Program not initialized, showing empty state');
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          totalClicks: 0,
          uniqueWallets: 0,
          leaderboard: []
        }));
        return;
      }

      const { globalStatePDA } = getPDAs();
      
      // Read global state from Anchor program
      let totalClicks = 0;
      let totalUsers = 0;
      
      try {
        const globalState = await program.account.globalState.fetch(globalStatePDA);
        totalClicks = globalState.totalClicks.toNumber();
        totalUsers = globalState.totalUsers.toNumber();
        
        console.log(`📊 Global state from Anchor program: ${totalClicks} clicks, ${totalUsers} users`);
        
        // If we successfully read data, program is initialized
        if (!isProgramInitialized) {
          setIsProgramInitialized(true);
        }
      } catch (error: any) {
        console.log('⚠️ Global state not found (program not initialized)');
        
        // Check if it's an account not found error
        if (error.message?.includes('Account does not exist') || 
            error.message?.includes('Invalid account discriminator') ||
            error.code === 'AccountNotFound') {
          setIsProgramInitialized(false);
        }
        
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          totalClicks: 0,
          uniqueWallets: 0,
          leaderboard: []
        }));
        return;
      }

      // Get all user states to build leaderboard - TRUE WEB3 APPROACH
      const leaderboard: LeaderboardEntry[] = [];
      let userClicks = 0;
      let userRank: number | undefined;

      try {
        // Get all user state accounts from the program
        const userAccounts = await program.account.userState.all();
        
        console.log(`👥 Found ${userAccounts.length} user accounts in Anchor program`);
        
        // Build leaderboard from on-chain data
        const userClickData = userAccounts.map(account => ({
          address: account.account.user.toString(),
          clicks: account.account.userClicks.toNumber(),
        }));

        // Sort and create leaderboard
        userClickData.sort((a, b) => b.clicks - a.clicks);
        
        userClickData.slice(0, 10).forEach((user, index) => {
          leaderboard.push({
            address: user.address,
            clicks: user.clicks,
            rank: index + 1
          });
        });

        // Find current user's data and rank
        if (connected && publicKey) {
          const userIndex = userClickData.findIndex(user => user.address === publicKey.toString());
          if (userIndex >= 0) {
            userClicks = userClickData[userIndex].clicks;
            userRank = userIndex + 1;
            console.log(`🎯 User rank from blockchain: #${userRank} with ${userClicks} clicks`);
          }
        }

      } catch (error) {
        console.warn('Failed to fetch user accounts:', error);
      }

      // Get user-specific data
      const pendingClicks = connected ? getPendingClicks() : 0;
      const recentTransactions = connected ? getRecentTransactions() : [];

      // Update state with 100% blockchain data
      setData(prev => ({
        ...prev,
        totalClicks,
        userClicks,
        pendingClicks,
        leaderboard,
        userRank,
        uniqueWallets: totalUsers,
        isLoading: false,
        lastUpdate: Date.now(),
        recentTransactions,
      }));

      console.log('✅ 100% Web3 data updated from MAINNET Anchor program');

    } catch (error) {
      console.error('❌ Error reading MAINNET Anchor program data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [program, connected, publicKey, getPDAs, getPendingClicks, getRecentTransactions, isProgramInitialized]);

  // Check wallet balance
  const checkWalletBalance = useCallback(async (walletAddress: PublicKey): Promise<boolean> => {
    try {
      const { connection } = await getWorkingConnection();
      const balance = await connection.getBalance(walletAddress, 'confirmed');
      const minimumBalance = 0.001 * LAMPORTS_PER_SOL;
      return balance >= minimumBalance;
    } catch (error) {
      console.warn('MAINNET balance check failed:', error);
      return true;
    }
  }, [getWorkingConnection]);

  // Submit batch using ONLY Anchor program - NO MEMO PROGRAM
  const submitBatchToBlockchain = useCallback(async () => {
    if (!publicKey || !sendTransaction || !wallet || isSubmittingBatch) return false;

    const pendingClicks = getPendingClicks();
    if (pendingClicks === 0) {
      notificationCallback.showError?.('No Pending Clicks', 'You need to click first before submitting to the MAINNET blockchain!');
      return false;
    }

    try {
      setIsSubmittingBatch(true);
      console.log(`🚀 Submitting ${pendingClicks} clicks to MAINNET Anchor program ONLY...`);

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
      
      // Create provider with connected wallet
      const provider = new AnchorProvider(
        connection,
        wallet.adapter as any,
        { 
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      );
      
      const programInstance = new Program<Web3Obgc>(IDL, PROGRAM_ID, provider);
      const { globalStatePDA, userStatePDA } = getPDAs(publicKey);

      if (!userStatePDA) {
        throw new Error('Failed to derive user state PDA');
      }

      // Check if user account exists, create if not
      let userAccountExists = false;
      try {
        await programInstance.account.userState.fetch(userStatePDA);
        userAccountExists = true;
        console.log('✅ User account exists');
      } catch (error) {
        console.log('📝 Creating new user account...');
        
        // Create user account first
        const createUserTx = await programInstance.methods
          .createUser()
          .accounts({
            userState: userStatePDA,
            globalState: globalStatePDA,
            user: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
        
        console.log('✅ User account created:', createUserTx);
        userAccountExists = true;
      }

      if (!userAccountExists) {
        throw new Error('Failed to create user account');
      }

      // Submit clicks to Anchor program ONLY - NO MEMO PROGRAM
      console.log(`📤 Submitting ${pendingClicks} clicks to Anchor program ONLY...`);
      
      const tx = await programInstance.methods
        .submitClicks(new BN(pendingClicks))
        .accounts({
          userState: userStatePDA,
          globalState: globalStatePDA,
          user: publicKey,
        })
        .rpc();

      console.log(`✅ MAINNET Anchor program transaction: ${tx}`);
      console.log(`🔗 Using MAINNET endpoint: ${endpoint}`);
      console.log('⚓ SUCCESS: Used ONLY Anchor program - no memo program needed!');

      // Store transaction
      const newTransaction: Transaction = {
        signature: tx,
        timestamp: Date.now(),
        clicks: pendingClicks,
        status: 'confirmed'
      };
      storeTransaction(newTransaction);

      // Clear pending clicks
      storePendingClicks(0);

      // Update local state immediately
      setData(prev => ({
        ...prev,
        totalClicks: prev.totalClicks + pendingClicks,
        userClicks: prev.userClicks + pendingClicks,
        pendingClicks: 0,
        recentTransactions: [newTransaction, ...prev.recentTransactions.slice(0, 9)]
      }));

      // Enhanced success notification
      const endpointName = endpoint.includes('helius-rpc.com') ? 'Helius (Premium)' :
                          endpoint.includes('api.mainnet-beta.solana.com') ? 'Solana Labs (Official)' :
                          'Fallback';

      notificationCallback.showSuccess?.(
        '🎉 100% Web3 Anchor Transaction Successful!',
        `Successfully submitted ${pendingClicks} clicks to your Anchor program on Solana MAINNET using ${endpointName}. This is TRUE Web3 - all data is now permanently stored on-chain in your smart contract! No memo program needed - pure Anchor power! ⚓`,
        {
          duration: 10000,
          link: {
            label: 'View on Solana Explorer',
            url: `https://explorer.solana.com/tx/${tx}?cluster=mainnet`
          }
        }
      );

      // Refresh blockchain data
      setTimeout(() => {
        readBlockchainData();
      }, 2000);

      return true;

    } catch (error: any) {
      console.error('❌ MAINNET Anchor program transaction failed:', error);
      
      if (error.message?.includes('insufficient funds')) {
        notificationCallback.showError?.(
          'Insufficient Balance',
          'You need at least 0.001 SOL in your wallet for MAINNET transaction fees.'
        );
      } else if (error.message?.includes('User rejected')) {
        notificationCallback.showWarning?.(
          'Transaction Cancelled',
          'The MAINNET transaction was cancelled by the user.'
        );
      } else {
        notificationCallback.showError?.(
          'MAINNET Anchor Transaction Failed',
          `Failed to submit to MAINNET Anchor program: ${error.message || 'Unknown error occurred'}`
        );
      }
      
      return false;
    } finally {
      setIsSubmittingBatch(false);
    }
  }, [publicKey, sendTransaction, wallet, getPendingClicks, storePendingClicks, storeTransaction, readBlockchainData, isSubmittingBatch, checkWalletBalance, getWorkingConnection, getPDAs, notificationCallback]);

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

  // Handle captcha success
  const handleCaptchaSuccess = useCallback(() => {
    setShowCaptcha(false);
    setIsUIFrozen(false);
  }, []);

  // Handle captcha close
  const handleCaptchaClose = useCallback(() => {
    setShowCaptcha(false);
    setIsUIFrozen(false);
  }, []);

  // Refresh data
  const refreshData = useCallback(async () => {
    console.log('🔄 Refreshing 100% Web3 data from MAINNET Anchor program...');
    await readBlockchainData();
  }, [readBlockchainData]);

  // Initialize program on mount
  useEffect(() => {
    console.log('🚀 Initializing 100% Web3 Anchor program...');
    initializeProgram();
  }, [initializeProgram]);

  // Load data when program is ready
  useEffect(() => {
    if (program) {
      console.log('🚀 Initial 100% Web3 data load from Anchor program...');
      readBlockchainData();
    }
  }, [program, readBlockchainData]);

  // Set up polling for blockchain data
  useEffect(() => {
    if (!program) return;

    console.log('⏰ Setting up 100% Web3 data polling from Anchor program...');
    const interval = setInterval(() => {
      readBlockchainData().catch(error => {
        console.warn('Web3 polling error (will retry):', error);
      });
    }, 30000); // Poll every 30 seconds

    return () => {
      console.log('🛑 Stopping Web3 data polling...');
      clearInterval(interval);
    };
  }, [program, readBlockchainData]);

  // Update user state when wallet changes
  useEffect(() => {
    if (!connected || !publicKey) {
      setData(prev => ({
        ...prev,
        userClicks: 0,
        pendingClicks: 0,
        recentTransactions: [],
        userRank: undefined,
      }));
      setIsUIFrozen(false);
      setShowCaptcha(false);
    } else {
      const pending = getPendingClicks();
      const transactions = getRecentTransactions();
      setData(prev => ({ 
        ...prev, 
        pendingClicks: pending,
        recentTransactions: transactions
      }));
      // Re-read data from blockchain
      if (program) {
        readBlockchainData();
      }
    }
  }, [connected, publicKey, program, getPendingClicks, getRecentTransactions, readBlockchainData]);

  return {
    ...data,
    addClick,
    submitBatch: submitBatchToBlockchain,
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
    isProgramInitialized,
    initializeProgramState,
  };
};