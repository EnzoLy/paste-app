/**
 * Expiration utilities for paste management
 */

export type ExpirationOption = '1h' | '1d' | '1w' | 'never' | '1m' | 'custom';

export const EXPIRATION_OPTIONS = [
  { value: '1h' as const, label: '1 Hour' },
  { value: '1d' as const, label: '1 Day' },
  { value: '1w' as const, label: '1 Week' },
  { value: '1m' as const, label: '1 Month' },
  { value: 'never' as const, label: 'Never' },
  { value: 'custom' as const, label: 'Custom...' }
] as const;

/**
 * Calculate expiration date based on the selected option
 * Returns null for 'never' option
 * For 'custom', returns null (caller should handle custom date)
 */
export function calculateExpirationDate(option: ExpirationOption, customDate?: Date | null): Date | null {
  if (option === 'never') return null;
  if (option === 'custom') return customDate || null;

  const now = new Date();

  switch (option) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '1w':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '1m':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

/**
 * Calculate custom expiration date based on duration
 */
export function calculateCustomExpiration(amount: number, unit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date {
  const now = new Date();
  const milliseconds = {
    minutes: amount * 60 * 1000,
    hours: amount * 60 * 60 * 1000,
    days: amount * 24 * 60 * 60 * 1000,
    weeks: amount * 7 * 24 * 60 * 60 * 1000,
    months: amount * 30 * 24 * 60 * 60 * 1000,
    years: amount * 365 * 24 * 60 * 60 * 1000,
  };
  return new Date(now.getTime() + milliseconds[unit]);
}

/**
 * Format expiration time for display
 * Shows human-readable countdown or "Expired" or "Never expires"
 */
export function formatExpirationTime(expiresAt: string | null): string {
  if (!expiresAt) return 'Never expires';

  const date = new Date(expiresAt);
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  if (diff < 0) return 'Expired';

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) return `Expires in ${years} year${years > 1 ? 's' : ''}`;
  if (months > 0) return `Expires in ${months} month${months > 1 ? 's' : ''}`;
  if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
  if (minutes > 0) return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (seconds > 0) return `Expires in ${seconds} second${seconds > 1 ? 's' : ''}`;
  return 'Expires soon';
}

/**
 * Check if a paste has expired
 */
export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}
