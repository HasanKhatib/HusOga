import { Platform } from 'react-native';

/**
 * RevenueCat configuration.
 *
 * API keys are injected at EAS build time via environment variables
 * (REVENUECAT_IOS_API_KEY, REVENUECAT_ANDROID_API_KEY).
 * They are never committed to git.
 *
 * To set them:
 *   eas env:create --scope project --name REVENUECAT_IOS_API_KEY --value appl_... --visibility sensitive
 *   eas env:create --scope project --name REVENUECAT_ANDROID_API_KEY --value goog_... --visibility sensitive
 *
 * See docs/commerce/revenuecat-setup.md for the full guide.
 */
export const RC_CONFIG = {
  /**
   * Entitlement identifier in the RevenueCat dashboard.
   * Must match exactly — case-sensitive.
   */
  entitlementId: 'pro',

  /**
   * Product identifier in App Store Connect and Google Play Console.
   * Must match the product ID configured in the RevenueCat dashboard.
   */
  productId: 'com.husoga.pro',

  /**
   * Platform API keys — injected from EAS environment variables at build time.
   * Falls back to empty string in development (purchase calls will fail gracefully).
   */
  apiKey: Platform.select({
    ios: process.env.REVENUECAT_IOS_API_KEY ?? '',
    android: process.env.REVENUECAT_ANDROID_API_KEY ?? '',
    default: '',
  }) as string,
} as const;
