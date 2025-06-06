/**
 * Payment Configuration
 *
 * Centralized configuration for payment processing including
 * default currency, supported currencies, and payment settings.
 */

export const PAYMENT_CONFIG = {
  /**
   * Default currency for all payments
   */
  DEFAULT_CURRENCY: 'usd' as const,

  /**
   * Supported currencies
   */
  SUPPORTED_CURRENCIES: ['usd', 'eur', 'gbp'] as const,

  /**
   * Currency display names
   */
  CURRENCY_DISPLAY: {
    usd: 'USD ($)',
    eur: 'EUR (€)',
    gbp: 'GBP (£)',
  } as const,

  /**
   * Currency symbols
   */
  CURRENCY_SYMBOLS: {
    usd: '$',
    eur: '€',
    gbp: '£',
  } as const,

  /**
   * Default payment capture method
   */
  CAPTURE_METHOD: 'manual' as const,

  /**
   * Payment processing settings
   */
  SETTINGS: {
    /**
     * Convert amount to smallest currency unit (cents for USD)
     */
    AMOUNT_MULTIPLIER: 100,

    /**
     * Default service fee percentage (if applicable)
     */
    SERVICE_FEE_PERCENTAGE: 0,

    /**
     * Maximum payment amount in USD
     */
    MAX_PAYMENT_AMOUNT: 10000,

    /**
     * Minimum payment amount in USD
     */
    MIN_PAYMENT_AMOUNT: 1,
  },
} as const

/**
 * Type definitions for payment configuration
 */
export type SupportedCurrency = (typeof PAYMENT_CONFIG.SUPPORTED_CURRENCIES)[number]
export type CurrencySymbol = keyof typeof PAYMENT_CONFIG.CURRENCY_SYMBOLS

/**
 * Format amount with currency symbol
 *
 * @param amount - Amount to format
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted amount string
 */
export const formatCurrency = (
  amount: number,
  currency: SupportedCurrency = PAYMENT_CONFIG.DEFAULT_CURRENCY,
): string => {
  const symbol = PAYMENT_CONFIG.CURRENCY_SYMBOLS[currency]
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Convert amount to smallest currency unit
 *
 * @param amount - Amount in main currency unit
 * @returns Amount in smallest currency unit (e.g., cents)
 */
export const convertToSmallestUnit = (amount: number): number => {
  return Math.round(amount * PAYMENT_CONFIG.SETTINGS.AMOUNT_MULTIPLIER)
}

/**
 * Convert amount from smallest currency unit
 *
 * @param amount - Amount in smallest currency unit
 * @returns Amount in main currency unit
 */
export const convertFromSmallestUnit = (amount: number): number => {
  return amount / PAYMENT_CONFIG.SETTINGS.AMOUNT_MULTIPLIER
}
