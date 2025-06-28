import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount, TokenAccountNotFoundError, TokenInvalidAccountOwnerError } from '@solana/spl-token';

// OBGC Token mint address from environment
const OBGC_TOKEN_MINT = new PublicKey(
  import.meta.env.VITE_OBGC_TOKEN_MINT || 'HNnmV7LMStogJC4PoTj6doSHZtWdCeExMSzBAukEpump'
);

/**
 * Fetch OBGC token balance for a given wallet address
 */
export async function fetchTokenBalance(
  connection: Connection,
  walletAddress: string
): Promise<number> {
  try {
    const walletPublicKey = new PublicKey(walletAddress);
    
    // Get the associated token account address for the OBGC token
    const associatedTokenAddress = await getAssociatedTokenAddress(
      OBGC_TOKEN_MINT,
      walletPublicKey
    );
    
    // Try to get the token account
    const tokenAccount = await getAccount(connection, associatedTokenAddress);
    
    // Convert balance from smallest unit to tokens (assuming 6 decimals for most SPL tokens)
    // Note: You may need to adjust decimals based on the actual token configuration
    const balance = Number(tokenAccount.amount) / Math.pow(10, 6);
    
    console.log(`OBGC Token balance for ${walletAddress}: ${balance}`);
    return balance;
    
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
      // Token account doesn't exist, which means balance is 0
      console.log(`No OBGC token account found for ${walletAddress}, balance: 0`);
      return 0;
    }
    
    console.error('Error fetching OBGC token balance:', error);
    throw error;
  }
}

/**
 * Get token mint info including decimals
 */
export async function getTokenMintInfo(connection: Connection) {
  try {
    const mintInfo = await connection.getParsedAccountInfo(OBGC_TOKEN_MINT);
    
    if (mintInfo.value?.data && 'parsed' in mintInfo.value.data) {
      const parsedData = mintInfo.value.data.parsed;
      return {
        decimals: parsedData.info.decimals,
        supply: parsedData.info.supply,
        mintAuthority: parsedData.info.mintAuthority,
        freezeAuthority: parsedData.info.freezeAuthority,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching token mint info:', error);
    return null;
  }
}

/**
 * Fetch token balance with proper decimal handling
 */
export async function fetchTokenBalanceWithDecimals(
  connection: Connection,
  walletAddress: string
): Promise<{ balance: number; decimals: number }> {
  try {
    // First get the mint info to determine decimals
    const mintInfo = await getTokenMintInfo(connection);
    const decimals = mintInfo?.decimals || 6; // Default to 6 if we can't fetch mint info
    
    const walletPublicKey = new PublicKey(walletAddress);
    
    // Get the associated token account address
    const associatedTokenAddress = await getAssociatedTokenAddress(
      OBGC_TOKEN_MINT,
      walletPublicKey
    );
    
    // Try to get the token account
    const tokenAccount = await getAccount(connection, associatedTokenAddress);
    
    // Convert balance using the correct decimals
    const balance = Number(tokenAccount.amount) / Math.pow(10, decimals);
    
    console.log(`OBGC Token balance for ${walletAddress}: ${balance} (${decimals} decimals)`);
    return { balance, decimals };
    
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
      // Token account doesn't exist, which means balance is 0
      const mintInfo = await getTokenMintInfo(connection);
      const decimals = mintInfo?.decimals || 6;
      
      console.log(`No OBGC token account found for ${walletAddress}, balance: 0`);
      return { balance: 0, decimals };
    }
    
    console.error('Error fetching OBGC token balance:', error);
    throw error;
  }
}

/**
 * Check if a wallet has sufficient OBGC tokens
 */
export async function checkSufficientTokenBalance(
  connection: Connection,
  walletAddress: string,
  requiredAmount: number
): Promise<{ hasEnough: boolean; balance: number; shortfall: number }> {
  try {
    const { balance } = await fetchTokenBalanceWithDecimals(connection, walletAddress);
    const hasEnough = balance >= requiredAmount;
    const shortfall = hasEnough ? 0 : requiredAmount - balance;
    
    return {
      hasEnough,
      balance,
      shortfall
    };
  } catch (error) {
    console.error('Error checking token balance:', error);
    return {
      hasEnough: false,
      balance: 0,
      shortfall: requiredAmount
    };
  }
}

/**
 * Get OBGC token mint address
 */
export function getOBGCTokenMint(): PublicKey {
  return OBGC_TOKEN_MINT;
}

/**
 * Format token balance for display
 */
export function formatTokenBalance(balance: number): string {
  if (balance >= 1000000) {
    return (balance / 1000000).toFixed(2) + 'M';
  }
  if (balance >= 1000) {
    return (balance / 1000).toFixed(1) + 'K';
  }
  return balance.toLocaleString(undefined, { maximumFractionDigits: 2 });
}