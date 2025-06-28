// Bonding curve logic for $CLICK token requirements

export interface BondingCurvePoint {
  clickCount: number;
  requiredTokens: number;
  label: string;
}

export const BONDING_CURVE_POINTS: BondingCurvePoint[] = [
  { clickCount: 0, requiredTokens: 500000, label: '0' },
  { clickCount: 1000000, requiredTokens: 100000, label: '1M' },
  { clickCount: 10000000, requiredTokens: 50000, label: '10M' },
  { clickCount: 100000000, requiredTokens: 20000, label: '100M' },
  { clickCount: 500000000, requiredTokens: 5000, label: '500M' },
  { clickCount: 1000000000, requiredTokens: 5000, label: '1B' },
];

/**
 * Calculate required $CLICK tokens based on global click count
 */
export function getRequiredTokens(globalClickCount: number): number {
  // Find the appropriate tier
  for (let i = BONDING_CURVE_POINTS.length - 1; i >= 0; i--) {
    const point = BONDING_CURVE_POINTS[i];
    if (globalClickCount >= point.clickCount) {
      return point.requiredTokens;
    }
  }
  
  // Default to highest requirement if somehow below 0
  return BONDING_CURVE_POINTS[0].requiredTokens;
}

/**
 * Get the next milestone and how many clicks until token requirement decreases
 */
export function getNextMilestone(globalClickCount: number): {
  nextMilestone: BondingCurvePoint | null;
  clicksUntilNext: number;
  currentRequirement: number;
} {
  const currentRequirement = getRequiredTokens(globalClickCount);
  
  // Find next milestone
  for (const point of BONDING_CURVE_POINTS) {
    if (globalClickCount < point.clickCount && point.requiredTokens < currentRequirement) {
      return {
        nextMilestone: point,
        clicksUntilNext: point.clickCount - globalClickCount,
        currentRequirement
      };
    }
  }
  
  return {
    nextMilestone: null,
    clicksUntilNext: 0,
    currentRequirement
  };
}

/**
 * Format token count with appropriate suffixes
 */
export function formatTokenCount(tokens: number): string {
  if (tokens >= 1000000) {
    return (tokens / 1000000).toFixed(1) + 'M';
  }
  if (tokens >= 1000) {
    return (tokens / 1000).toFixed(0) + 'K';
  }
  return tokens.toLocaleString();
}

/**
 * Get progress percentage to next milestone
 */
export function getProgressToNextMilestone(globalClickCount: number): number {
  const { nextMilestone, clicksUntilNext } = getNextMilestone(globalClickCount);
  
  if (!nextMilestone) return 100; // At final milestone
  
  // Find current milestone
  let currentMilestone = BONDING_CURVE_POINTS[0];
  for (let i = BONDING_CURVE_POINTS.length - 1; i >= 0; i--) {
    if (globalClickCount >= BONDING_CURVE_POINTS[i].clickCount) {
      currentMilestone = BONDING_CURVE_POINTS[i];
      break;
    }
  }
  
  const totalRange = nextMilestone.clickCount - currentMilestone.clickCount;
  const progress = globalClickCount - currentMilestone.clickCount;
  
  return Math.min(100, (progress / totalRange) * 100);
}

/**
 * Check if user has sufficient tokens (mock function - replace with actual token balance check)
 */
export function checkTokenBalance(userTokenBalance: number, globalClickCount: number): {
  hasEnoughTokens: boolean;
  requiredTokens: number;
  shortfall: number;
} {
  const requiredTokens = getRequiredTokens(globalClickCount);
  const hasEnoughTokens = userTokenBalance >= requiredTokens;
  const shortfall = hasEnoughTokens ? 0 : requiredTokens - userTokenBalance;
  
  return {
    hasEnoughTokens,
    requiredTokens,
    shortfall
  };
}