import { PublicKey } from '@solana/web3.js';

// Environment variable validation helper
const getEnvVar = (key: string, defaultValue?: string): string => {
  const value = import.meta.env[key] || process.env[key] || defaultValue;
  if (!value && !defaultValue) {
    console.warn(`Environment variable ${key} is not set`);
  }
  return value || '';
};

const getEnvNumber = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

// Solana Program IDs from environment variables
export const PROGRAM_IDS = {
  // Your deployed Anchor program on MAINNET - THE ONLY PROGRAM WE USE
  ANCHOR_PROGRAM: new PublicKey(
    getEnvVar('VITE_ANCHOR_PROGRAM_ID', 'Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t')
  ),
  
  // System program (required for account creation)
  SYSTEM_PROGRAM: new PublicKey(
    getEnvVar('VITE_SYSTEM_PROGRAM_ID', '11111111111111111111111111111112')
  ),
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
  NETWORK: getEnvVar('VITE_SOLANA_NETWORK', 'mainnet-beta'),
  COMMITMENT: getEnvVar('VITE_SOLANA_COMMITMENT', 'confirmed') as 'confirmed' | 'finalized' | 'processed',
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: getEnvVar('VITE_APP_NAME', '1B Global Clicks'),
  VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  TARGET_CLICKS: getEnvNumber('VITE_TARGET_CLICKS', 1000000000),
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  CAPTCHA_INTERVAL: getEnvNumber('VITE_CAPTCHA_INTERVAL', 1000),
  MAX_BATCH_SIZE: getEnvNumber('VITE_MAX_BATCH_SIZE', 10000),
  MIN_WALLET_BALANCE: parseFloat(getEnvVar('VITE_MIN_WALLET_BALANCE', '0.001')),
} as const;

// Storage Keys - Only for pending clicks and transactions (everything else from Anchor program)
export const STORAGE_KEYS = {
  PENDING_CLICKS: 'solana_pending_clicks',
  TRANSACTIONS: 'solana_recent_transactions',
} as const;

// Validation functions
export const validateProgramId = (programId: string): boolean => {
  try {
    new PublicKey(programId);
    return true;
  } catch {
    return false;
  }
};

export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate program IDs
  if (!validateProgramId(getEnvVar('VITE_ANCHOR_PROGRAM_ID', 'Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t'))) {
    errors.push('Invalid VITE_ANCHOR_PROGRAM_ID');
  }
  
  // Validate network
  const network = getEnvVar('VITE_SOLANA_NETWORK', 'mainnet-beta');
  if (!['mainnet-beta', 'devnet', 'testnet'].includes(network)) {
    errors.push('Invalid VITE_SOLANA_NETWORK');
  }
  
  // Validate commitment
  const commitment = getEnvVar('VITE_SOLANA_COMMITMENT', 'confirmed');
  if (!['confirmed', 'finalized', 'processed'].includes(commitment)) {
    errors.push('Invalid VITE_SOLANA_COMMITMENT');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Log configuration on startup (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 100% Web3 Application Configuration:');
  console.log(`📍 Anchor Program ID: ${PROGRAM_IDS.ANCHOR_PROGRAM.toString()}`);
  console.log(`🌐 Network: ${NETWORK_CONFIG.NETWORK}`);
  console.log(`⚙️ Commitment: ${NETWORK_CONFIG.COMMITMENT}`);
  console.log(`🎯 Target Clicks: ${APP_CONFIG.TARGET_CLICKS.toLocaleString()}`);
  console.log('🚀 Mode: 100% Web3 - All data from Anchor program on MAINNET');
  console.log('⚓ Using ONLY Anchor program - no memo program needed');
  
  const validation = validateEnvironment();
  if (!validation.isValid) {
    console.error('❌ Environment validation errors:', validation.errors);
  } else {
    console.log('✅ Environment configuration is valid for Web3');
  }
}

export default {
  PROGRAM_IDS,
  NETWORK_CONFIG,
  APP_CONFIG,
  SECURITY_CONFIG,
  STORAGE_KEYS,
};