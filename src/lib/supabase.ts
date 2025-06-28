import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We don't need auth sessions for this app
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types
export interface User {
  id: string;
  wallet_address: string;
  total_clicks: number;
  last_click_timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface ClickBatch {
  id: string;
  user_id: string;
  wallet_address: string;
  clicks_count: number;
  transaction_signature?: string;
  created_at: string;
}

export interface GlobalStats {
  id: string;
  total_clicks: number;
  total_users: number;
  last_updated: string;
}

export interface LeaderboardEntry {
  address: string;
  clicks: number;
  rank: number;
}

// Database functions
export const db = {
  // Add clicks for a user
  async addUserClicks(
    walletAddress: string, 
    clicksCount: number, 
    transactionSignature?: string
  ) {
    const { data, error } = await supabase.rpc('add_user_clicks', {
      p_wallet_address: walletAddress,
      p_clicks_count: clicksCount,
      p_transaction_signature: transactionSignature || null,
    });

    if (error) {
      console.error('Error adding user clicks:', error);
      throw error;
    }

    return data;
  },

  // Get global statistics
  async getGlobalStats(): Promise<GlobalStats | null> {
    const { data, error } = await supabase
      .from('global_stats')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching global stats:', error);
      return null;
    }

    return data;
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase.rpc('get_leaderboard', {
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  },

  // Get user data
  async getUser(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // User not found
        return null;
      }
      console.error('Error fetching user:', error);
      throw error;
    }

    return data;
  },

  // Get user rank
  async getUserRank(walletAddress: string) {
    const { data, error } = await supabase.rpc('get_user_rank', {
      p_wallet_address: walletAddress,
    });

    if (error) {
      console.error('Error fetching user rank:', error);
      return { rank: null, clicks: 0 };
    }

    return data || { rank: null, clicks: 0 };
  },

  // Get user's recent click batches
  async getUserClickBatches(walletAddress: string, limit: number = 10): Promise<ClickBatch[]> {
    const { data, error } = await supabase
      .from('click_batches')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user click batches:', error);
      return [];
    }

    return data || [];
  },

  // Get all recent click batches (for transparency)
  async getRecentClickBatches(limit: number = 50): Promise<ClickBatch[]> {
    const { data, error } = await supabase
      .from('click_batches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent click batches:', error);
      return [];
    }

    return data || [];
  },

  // Subscribe to real-time updates
  subscribeToGlobalStats(callback: (stats: GlobalStats) => void) {
    return supabase
      .channel('global_stats_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'global_stats',
        },
        (payload) => {
          callback(payload.new as GlobalStats);
        }
      )
      .subscribe();
  },

  // Subscribe to leaderboard updates
  subscribeToLeaderboard(callback: () => void) {
    return supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => {
          callback();
        }
      )
      .subscribe();
  },
};

// Utility function to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'your-supabase-url-here' && 
    supabaseAnonKey !== 'your-supabase-anon-key-here'
  );
};

// Test connection function
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('global_stats')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return false;
  }
};