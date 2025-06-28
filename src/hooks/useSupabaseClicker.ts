import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { db, LeaderboardEntry, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

interface Transaction {
  signature: string;
  timestamp: number;
  clicks: number;
  status: 'confirmed' | 'pending' | 'failed';
}

interface SupabaseClickerData {
  totalClicks: number;
  userClicks: number;
  pendingClicks: number;
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  uniqueWallets: number;
  isLoading: boolean;
  lastUpdate: number;
  recentTransactions: Transaction[];
  isSupabaseConnected: boolean;
}

// Storage keys for pending clicks only (everything else from Supabase)
const PENDING_CLICKS_KEY = 'supabase_pending_clicks';
const TRANSACTIONS_KEY = 'supabase_recent_transactions';

export const useSupabaseClicker = () => {
  const { publicKey, connected } = useWallet();
  
  const [data, setData] = useState<SupabaseClickerData>({
    totalClicks: 0,
    userClicks: 0,
    pendingClicks: 0,
    leaderboard: [],
    uniqueWallets: 0,
    isLoading: true,
    lastUpdate: 0,
    recentTransactions: [],
    isSupabaseConnected: false,
  });
  
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isUIFrozen, setIsUIFrozen] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [notificationCallback, setNotificationCallback] = useState<{
    showSuccess?: (title: string, message: string, options?: any) => void;
    showError?: (title: string, message: string, options?: any) => void;
    showWarning?: (title: string, message: string, options?: any) => void;
  }>({});

  // Set notification callbacks
  const setNotifications = useCallback((callbacks: typeof notificationCallback) => {
    setNotificationCallback(callbacks);
  }, []);

  // Get pending clicks for current user
  const getPendingClicks = useCallback(() => {
    if (!publicKey) return 0;
    try {
      const stored = localStorage.getItem(PENDING_CLICKS_KEY);
      const pendingData = stored ? JSON.parse(stored) : {};
      return pendingData[publicKey.toString()] || 0;
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

  // Test Supabase connection
  const checkSupabaseConnection = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase not configured');
      setData(prev => ({ ...prev, isSupabaseConnected: false }));
      return false;
    }

    try {
      const isConnected = await testSupabaseConnection();
      setData(prev => ({ ...prev, isSupabaseConnected: isConnected }));
      
      if (isConnected) {
        console.log('✅ Supabase connection established');
      } else {
        console.error('❌ Supabase connection failed');
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ Supabase connection error:', error);
      setData(prev => ({ ...prev, isSupabaseConnected: false }));
      return false;
    }
  }, []);

  // Read data from Supabase
  const readSupabaseData = useCallback(async () => {
    try {
      console.log('🔄 Reading data from Supabase database...');
      setData(prev => ({ ...prev, isLoading: true }));

      // Check connection first
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        setData(prev => ({ 
          ...prev, 
          isLoading: false,
          totalClicks: 0,
          uniqueWallets: 0,
          leaderboard: []
        }));
        return;
      }

      // Get global stats
      const globalStats = await db.getGlobalStats();
      const totalClicks = globalStats?.total_clicks || 0;
      const uniqueWallets = globalStats?.total_users || 0;

      // Get leaderboard
      const leaderboard = await db.getLeaderboard(10);

      // Get user-specific data
      let userClicks = 0;
      let userRank: number | undefined;

      if (connected && publicKey) {
        try {
          const user = await db.getUser(publicKey.toString());
          userClicks = user?.total_clicks || 0;

          const rankData = await db.getUserRank(publicKey.toString());
          userRank = rankData.rank || undefined;
        } catch (error) {
          console.warn('Failed to fetch user data:', error);
        }
      }

      const pendingClicks = connected ? getPendingClicks() : 0;
      const recentTransactions = connected ? getRecentTransactions() : [];

      // Update state
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
        isSupabaseConnected: true,
      }));

      console.log('✅ Supabase data updated successfully');
      console.log(`📊 Global: ${totalClicks} clicks, ${uniqueWallets} users`);
      if (connected && publicKey) {
        console.log(`👤 User: ${userClicks} clicks, rank #${userRank || 'unranked'}`);
      }

    } catch (error) {
      console.error('❌ Error reading Supabase data:', error);
      setData(prev => ({ ...prev, isLoading: false, isSupabaseConnected: false }));
    }
  }, [connected, publicKey, getPendingClicks, getRecentTransactions, checkSupabaseConnection]);

  // Submit batch to Supabase
  const submitBatchToSupabase = useCallback(async () => {
    if (!publicKey || isSubmittingBatch) return false;

    const pendingClicks = getPendingClicks();
    if (pendingClicks === 0) {
      notificationCallback.showError?.('No Pending Clicks', 'You need to click first before submitting to the database!');
      return false;
    }

    try {
      setIsSubmittingBatch(true);
      console.log(`🚀 Submitting ${pendingClicks} clicks to Supabase database...`);

      // Check Supabase connection
      const isConnected = await checkSupabaseConnection();
      if (!isConnected) {
        notificationCallback.showError?.(
          'Database Connection Failed',
          'Unable to connect to Supabase database. Please check your configuration.'
        );
        return false;
      }

      // Submit to Supabase
      const result = await db.addUserClicks(
        publicKey.toString(),
        pendingClicks
      );

      console.log('✅ Supabase submission successful:', result);

      // Store transaction record
      const newTransaction: Transaction = {
        signature: `supabase-${Date.now()}`,
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

      notificationCallback.showSuccess?.(
        'Database Submission Successful! 🎉',
        `Successfully submitted ${pendingClicks} clicks to Supabase database. Your clicks are now stored globally and will be visible to all users worldwide!`,
        { duration: 8000 }
      );

      // Refresh data from database
      setTimeout(() => {
        readSupabaseData();
      }, 1000);

      return true;

    } catch (error: any) {
      console.error('❌ Supabase submission failed:', error);
      
      notificationCallback.showError?.(
        'Database Submission Failed',
        `Failed to submit clicks to database: ${error.message || 'Unknown error occurred'}`
      );
      
      return false;
    } finally {
      setIsSubmittingBatch(false);
    }
  }, [publicKey, getPendingClicks, storePendingClicks, storeTransaction, readSupabaseData, isSubmittingBatch, checkSupabaseConnection, notificationCallback]);

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
    console.log('🔄 Refreshing Supabase data...');
    await readSupabaseData();
  }, [readSupabaseData]);

  // Initialize and load data
  useEffect(() => {
    console.log('🚀 Initializing Supabase clicker...');
    readSupabaseData();
  }, [readSupabaseData]);

  // Set up polling for database data
  useEffect(() => {
    console.log('⏰ Setting up Supabase data polling...');
    const interval = setInterval(() => {
      readSupabaseData().catch(error => {
        console.warn('Supabase polling error (will retry):', error);
      });
    }, 30000); // Poll every 30 seconds

    return () => {
      console.log('🛑 Stopping Supabase data polling...');
      clearInterval(interval);
    };
  }, [readSupabaseData]);

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
      // Re-read data from database
      readSupabaseData();
    }
  }, [connected, publicKey, getPendingClicks, getRecentTransactions, readSupabaseData]);

  return {
    ...data,
    addClick,
    submitBatch: submitBatchToSupabase,
    isConnected: connected,
    userAddress: publicKey?.toString(),
    showCaptcha,
    isUIFrozen,
    handleCaptchaSuccess,
    handleCaptchaClose,
    isSubmittingBatch,
    refreshData,
    setNotifications,
    checkSupabaseConnection,
  };
};