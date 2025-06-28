// Helius RPC Configuration
export const HELIUS_CONFIG = {
  apiKey: import.meta.env.VITE_HELIUS_API_KEY || '',
  
  // RPC Endpoints - only use Helius if API key exists and is valid
  rpcUrl: import.meta.env.VITE_HELIUS_API_KEY && import.meta.env.VITE_HELIUS_API_KEY.trim() !== '' && import.meta.env.VITE_HELIUS_API_KEY !== 'your-helius-api-key-here'
    ? (import.meta.env.VITE_HELIUS_RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`)
    : '',
  wsUrl: import.meta.env.VITE_HELIUS_API_KEY && import.meta.env.VITE_HELIUS_API_KEY.trim() !== '' && import.meta.env.VITE_HELIUS_API_KEY !== 'your-helius-api-key-here'
    ? (import.meta.env.VITE_HELIUS_WS_URL || `wss://mainnet.helius-rpc.com/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`)
    : '',
  eclipseUrl: import.meta.env.VITE_HELIUS_ECLIPSE_URL || 'https://eclipse.helius-rpc.com/',
  
  // Enhanced API Endpoints
  parseTransactionUrl: import.meta.env.VITE_HELIUS_API_KEY && import.meta.env.VITE_HELIUS_API_KEY.trim() !== '' && import.meta.env.VITE_HELIUS_API_KEY !== 'your-helius-api-key-here'
    ? (import.meta.env.VITE_HELIUS_PARSE_TX_URL || `https://api.helius.xyz/v0/transactions/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`)
    : '',
  parseHistoryUrl: import.meta.env.VITE_HELIUS_API_KEY && import.meta.env.VITE_HELIUS_API_KEY.trim() !== '' && import.meta.env.VITE_HELIUS_API_KEY !== 'your-helius-api-key-here'
    ? (import.meta.env.VITE_HELIUS_PARSE_HISTORY_URL || `https://api.helius.xyz/v0/addresses/{address}/transactions/?api-key=${import.meta.env.VITE_HELIUS_API_KEY}`)
    : '',
  
  // Connection Configuration
  commitment: 'confirmed' as const,
  confirmTransactionInitialTimeout: 60000,
  
  // Rate Limiting
  maxRequestsPerSecond: 100, // Helius free tier limit
  
  // Features
  features: {
    enhancedTransactions: true,
    webhooks: true,
    nftApi: true,
    dasApi: true, // Digital Asset Standard API
    priorityFees: true,
  }
};

// Check if Helius API key is properly configured
export const isHeliusConfigured = (): boolean => {
  const apiKey = HELIUS_CONFIG.apiKey;
  return !!(apiKey && 
           apiKey.trim() !== '' && 
           apiKey !== 'your-helius-api-key-here' && 
           apiKey.length > 10); // Basic validation
};

// Reliable public RPC endpoints (tested and working) - ordered by reliability
export const RELIABLE_RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',          // Official Solana Labs - most reliable
  'https://rpc.ankr.com/solana',                  // Ankr - very reliable
  'https://solana-api.projectserum.com',          // Project Serum - stable
  'https://api.metaplex.solana.com',              // Metaplex - good for NFTs
  'https://solana-mainnet.phantom.tech',          // Phantom - wallet optimized
  'https://mainnet.rpcpool.com',                  // RPC Pool - community
  'https://solana.blockdaemon.tech',              // Blockdaemon - enterprise
];

// Build final endpoint list with Helius first if available and configured
export const HELIUS_RPC_ENDPOINTS = (() => {
  const endpoints = [];
  
  // Add Helius first if properly configured
  if (isHeliusConfigured() && HELIUS_CONFIG.rpcUrl) {
    endpoints.push(HELIUS_CONFIG.rpcUrl);
    console.log('✅ Helius RPC configured and added to endpoint list');
  } else {
    console.log('⚠️ Helius RPC not configured, using public endpoints only');
  }
  
  // Add reliable public endpoints
  endpoints.push(...RELIABLE_RPC_ENDPOINTS);
  
  return endpoints;
})();

// Rate limiting and retry logic
class RateLimitManager {
  private endpointCooldowns: Map<string, number> = new Map();
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly cooldownDuration = 60000; // 1 minute cooldown for 429 errors

  // Dynamic rate limits based on endpoint type
  private getMaxRequestsPerMinute(endpoint: string): number {
    // Check if this is a Helius endpoint and if Helius is properly configured
    if (endpoint.includes('helius-rpc.com') && isHeliusConfigured()) {
      return 5000; // Much higher limit for Helius premium service
    }
    
    // Conservative limit for public endpoints
    return 30;
  }

  isEndpointCooledDown(endpoint: string): boolean {
    const cooldownUntil = this.endpointCooldowns.get(endpoint);
    if (!cooldownUntil) return true;
    
    const now = Date.now();
    if (now > cooldownUntil) {
      this.endpointCooldowns.delete(endpoint);
      return true;
    }
    return false;
  }

  canMakeRequest(endpoint: string): boolean {
    if (!this.isEndpointCooledDown(endpoint)) {
      return false;
    }

    const now = Date.now();
    const requestData = this.requestCounts.get(endpoint);
    const maxRequests = this.getMaxRequestsPerMinute(endpoint);
    
    if (!requestData || now > requestData.resetTime) {
      this.requestCounts.set(endpoint, {
        count: 1,
        resetTime: now + 60000 // Reset every minute
      });
      return true;
    }

    if (requestData.count >= maxRequests) {
      return false;
    }

    requestData.count++;
    return true;
  }

  handleRateLimit(endpoint: string): void {
    const cooldownUntil = Date.now() + this.cooldownDuration;
    this.endpointCooldowns.set(endpoint, cooldownUntil);
    const endpointType = endpoint.includes('helius-rpc.com') ? 'Helius' : 'Public';
    console.warn(`Rate limited on ${endpointType} endpoint ${endpoint}, cooling down until ${new Date(cooldownUntil).toLocaleTimeString()}`);
  }

  getNextAvailableEndpoint(endpoints: string[]): string | null {
    for (const endpoint of endpoints) {
      if (this.canMakeRequest(endpoint)) {
        return endpoint;
      }
    }
    return null;
  }

  // Debug method to show current rate limit status
  getDebugInfo(): { [key: string]: any } {
    const info: { [key: string]: any } = {};
    
    this.requestCounts.forEach((data, endpoint) => {
      const maxRequests = this.getMaxRequestsPerMinute(endpoint);
      const endpointName = endpoint.includes('helius-rpc.com') ? 'Helius' : 'Public';
      const cooldownUntil = this.endpointCooldowns.get(endpoint);
      
      info[endpointName] = {
        endpoint: endpoint.substring(0, 50) + '...',
        requests: `${data.count}/${maxRequests}`,
        resetTime: new Date(data.resetTime).toLocaleTimeString(),
        cooledDown: cooldownUntil ? new Date(cooldownUntil).toLocaleTimeString() : 'No',
      };
    });
    
    return info;
  }
}

const rateLimitManager = new RateLimitManager();

// Enhanced connection configuration with retry logic
export const HELIUS_CONNECTION_CONFIG = {
  commitment: HELIUS_CONFIG.commitment,
  confirmTransactionInitialTimeout: HELIUS_CONFIG.confirmTransactionInitialTimeout,
  wsEndpoint: HELIUS_CONFIG.wsUrl || undefined,
  httpHeaders: {
    'Content-Type': 'application/json',
    'User-Agent': '1B-Global-Clicks/1.0',
  },
  fetch: async (url: string, options?: RequestInit): Promise<Response> => {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Check if we can make a request to this endpoint
        if (!rateLimitManager.canMakeRequest(url)) {
          throw new Error('Rate limit exceeded for this endpoint');
        }

        const headers = {
          ...options?.headers,
          'X-Helius-Client': '1B-Global-Clicks',
        };

        const response = await fetch(url, {
          ...options,
          headers,
        });

        // Handle rate limiting
        if (response.status === 429) {
          rateLimitManager.handleRateLimit(url);
          
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : Math.min(1000 * Math.pow(2, attempt), 10000);
          
          console.warn(`Rate limited (429) on attempt ${attempt + 1}. Retrying after ${delay}ms delay...`);
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        // Handle other server errors
        if (response.status >= 500 && response.status < 600) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(`Server error ${response.status} on attempt ${attempt + 1}. Retrying after ${delay}ms delay...`);
          
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }

        return response;
      } catch (error: any) {
        lastError = error;
        
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          console.warn(`Request failed on attempt ${attempt + 1}: ${error.message}. Retrying after ${delay}ms delay...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('All retry attempts failed');
  },
};

// Enhanced RPC endpoint switcher
export class RpcEndpointManager {
  private currentEndpointIndex = 0;
  private endpointHealth: Map<string, boolean> = new Map();
  private lastHealthCheck: Map<string, number> = new Map();
  private readonly healthCheckInterval = 30000; // 30 seconds

  constructor(private endpoints: string[] = HELIUS_RPC_ENDPOINTS) {
    // Initialize all endpoints as healthy
    endpoints.forEach(endpoint => {
      this.endpointHealth.set(endpoint, true);
    });
  }

  getCurrentEndpoint(): string {
    return this.endpoints[this.currentEndpointIndex] || this.endpoints[0];
  }

  async getHealthyEndpoint(): Promise<string> {
    // Try to find a healthy endpoint that's not rate limited
    const availableEndpoint = rateLimitManager.getNextAvailableEndpoint(this.endpoints);
    if (availableEndpoint) {
      return availableEndpoint;
    }

    // If all endpoints are rate limited, wait and try again with shorter delay for Helius
    const hasHelius = this.endpoints.some(endpoint => endpoint.includes('helius-rpc.com')) && isHeliusConfigured();
    const waitTime = hasHelius ? 500 : 2000; // Shorter wait for Helius
    
    console.warn(`All endpoints are rate limited, waiting ${waitTime}ms before retry...`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Return the first endpoint as fallback
    return this.endpoints[0];
  }

  async switchToNextEndpoint(): Promise<string> {
    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
    const nextEndpoint = this.getCurrentEndpoint();
    console.log(`Switching to next RPC endpoint: ${this.getEndpointName(nextEndpoint)}`);
    return nextEndpoint;
  }

  async checkEndpointHealth(endpoint: string): Promise<boolean> {
    const now = Date.now();
    const lastCheck = this.lastHealthCheck.get(endpoint) || 0;
    
    // Skip if checked recently
    if (now - lastCheck < this.healthCheckInterval) {
      return this.endpointHealth.get(endpoint) || false;
    }

    try {
      const response = await Promise.race([
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getHealth',
          }),
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]);

      const isHealthy = response.ok && response.status !== 429;
      this.endpointHealth.set(endpoint, isHealthy);
      this.lastHealthCheck.set(endpoint, now);
      
      return isHealthy;
    } catch (error) {
      this.endpointHealth.set(endpoint, false);
      this.lastHealthCheck.set(endpoint, now);
      return false;
    }
  }

  getEndpointHealth(): { [key: string]: boolean } {
    const health: { [key: string]: boolean } = {};
    this.endpointHealth.forEach((isHealthy, endpoint) => {
      health[endpoint] = isHealthy;
    });
    return health;
  }

  private getEndpointName(endpoint: string): string {
    if (endpoint.includes('helius-rpc.com')) return 'Helius (Premium)';
    if (endpoint.includes('api.mainnet-beta.solana.com')) return 'Solana Labs (Official)';
    if (endpoint.includes('solana-api.projectserum.com')) return 'Project Serum';
    if (endpoint.includes('rpc.ankr.com')) return 'Ankr';
    if (endpoint.includes('api.metaplex.solana.com')) return 'Metaplex';
    if (endpoint.includes('solana-mainnet.phantom.tech')) return 'Phantom';
    if (endpoint.includes('mainnet.rpcpool.com')) return 'RPC Pool';
    if (endpoint.includes('solana.blockdaemon.tech')) return 'Blockdaemon';
    return 'Custom';
  }
}

// Global endpoint manager instance
export const rpcEndpointManager = new RpcEndpointManager();

// Helius API helper functions with better error handling
export const heliusApi = {
  // Parse transaction with enhanced data
  async parseTransaction(signature: string) {
    if (!isHeliusConfigured() || !HELIUS_CONFIG.parseTransactionUrl) {
      throw new Error('Helius API key not properly configured');
    }
    
    try {
      const response = await HELIUS_CONNECTION_CONFIG.fetch(HELIUS_CONFIG.parseTransactionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactions: [signature],
        }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Helius API key - please check your configuration');
        }
        if (response.status === 429) {
          throw new Error('Helius API rate limit exceeded - please wait before retrying');
        }
        throw new Error(`Helius API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to parse transaction with Helius:', error);
      throw error;
    }
  },

  // Get transaction history for an address
  async getTransactionHistory(address: string, limit = 100) {
    if (!isHeliusConfigured() || !HELIUS_CONFIG.parseHistoryUrl) {
      throw new Error('Helius API key not properly configured');
    }
    
    try {
      const url = HELIUS_CONFIG.parseHistoryUrl.replace('{address}', address);
      const response = await HELIUS_CONNECTION_CONFIG.fetch(`${url}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Helius API key - please check your configuration');
        }
        if (response.status === 429) {
          throw new Error('Helius API rate limit exceeded - please wait before retrying');
        }
        throw new Error(`Helius API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get transaction history from Helius:', error);
      throw error;
    }
  },

  // Get priority fees recommendation using Solana RPC method with better error handling
  async getPriorityFees(connection: any) {
    try {
      // Use the Solana RPC method to get recent prioritization fees
      const recentFees = await Promise.race([
        connection.getRecentPrioritizationFees(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Priority fees timeout')), 10000)
        )
      ]);
      
      if (!recentFees || recentFees.length === 0) {
        console.warn('No recent prioritization fees found, using default');
        return 5000; // Default fallback
      }
      
      // Calculate a reasonable priority fee based on recent fees
      const fees = recentFees.map((fee: any) => fee.prioritizationFee);
      const maxFee = Math.max(...fees);
      const avgFee = fees.reduce((sum: number, fee: number) => sum + fee, 0) / fees.length;
      
      // Use the higher of average fee or 5000 microlamports, but cap at reasonable maximum
      const recommendedFee = Math.min(Math.max(avgFee * 1.2, 5000), maxFee * 1.5, 50000);
      
      console.log(`Priority fee analysis - Avg: ${Math.round(avgFee)}, Max: ${maxFee}, Recommended: ${Math.round(recommendedFee)} microlamports`);
      
      return Math.round(recommendedFee);
    } catch (error: any) {
      console.warn('Failed to get priority fees from Solana RPC:', error.message);
      
      // Don't throw error for priority fees - just return default
      return 5000; // Fallback priority fee
    }
  },
};

// Utility function to check if Helius API key is valid with better error handling
export const validateHeliusApiKey = async (): Promise<boolean> => {
  if (!isHeliusConfigured() || !HELIUS_CONFIG.rpcUrl) {
    console.warn('No Helius API key configured or invalid format');
    return false;
  }
  
  try {
    const response = await Promise.race([
      HELIUS_CONNECTION_CONFIG.fetch(HELIUS_CONFIG.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getHealth',
        }),
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Validation timeout')), 5000)
      )
    ]);
    
    if (response.status === 401) {
      console.error('Helius API key validation failed: Invalid API key');
      return false;
    }
    
    if (response.status === 429) {
      console.warn('Helius API key validation rate limited - assuming valid');
      return true; // Assume valid if rate limited
    }
    
    return response.ok;
  } catch (error: any) {
    console.error('Helius API key validation failed:', error.message);
    return false;
  }
};

export default HELIUS_CONFIG;