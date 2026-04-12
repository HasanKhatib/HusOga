import { Platform } from 'react-native';
import { RC_CONFIG } from './iapConfig';

export type IapItemDetails = {
  productId: string;
  title?: string;
  description?: string;
  price?: string;
};

export type IapPlatformStatus =
  | { kind: 'supported'; productId: string }
  | { kind: 'pending'; reason: 'android_purchase_setup_pending' }
  | { kind: 'unsupported'; reason: 'iap_not_supported_on_web' };

let rcModule: typeof import('react-native-purchases') | null = null;

/**
 * Lazy-load react-native-purchases to avoid crashes in environments
 * where the native module is not linked (e.g. Expo Go).
 */
async function getRCModule(): Promise<typeof import('react-native-purchases') | null> {
  if (Platform.OS === 'web') return null;
  if (!rcModule) {
    try {
      rcModule = await import('react-native-purchases');
    } catch {
      rcModule = null;
    }
  }
  return rcModule;
}

export function getIapStatus(): IapPlatformStatus {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    if (!RC_CONFIG.apiKey) {
      // API key not yet set — pending developer setup
      return { kind: 'pending', reason: 'android_purchase_setup_pending' };
    }
    return { kind: 'supported', productId: RC_CONFIG.productId };
  }
  return { kind: 'unsupported', reason: 'iap_not_supported_on_web' };
}

export async function getProducts(): Promise<IapItemDetails[]> {
  const status = getIapStatus();
  if (status.kind !== 'supported') return [];
  const RC = await getRCModule();
  if (!RC) return [];
  try {
    const offerings = await RC.default.getOfferings();
    const current = offerings.current;
    if (!current) return [];
    return current.availablePackages.map((pkg) => ({
      productId: pkg.product.identifier,
      title: pkg.product.title,
      description: pkg.product.description,
      price: pkg.product.priceString,
    }));
  } catch {
    return [];
  }
}

/**
 * Initiate a purchase flow for the pro entitlement.
 * Resolves with 'purchased' on success, throws on cancellation or failure.
 */
export async function purchaseProduct(_productId: string): Promise<'purchased'> {
  const RC = await getRCModule();
  if (!RC) throw new Error('iap_unavailable');

  try {
    const offerings = await RC.default.getOfferings();
    const current = offerings.current;
    if (!current) throw new Error('purchase_failed');

    // Find the package matching our product ID
    const pkg = current.availablePackages.find(
      (p) => p.product.identifier === RC_CONFIG.productId,
    );
    if (!pkg) throw new Error('purchase_failed');

    await RC.default.purchasePackage(pkg);
    return 'purchased';
  } catch (e: unknown) {
    const err = e as { userCancelled?: boolean; message?: string };
    if (err?.userCancelled === true) throw new Error('purchase_cancelled');
    throw new Error(err?.message ?? 'purchase_failed');
  }
}

/**
 * Check whether the user has previously purchased the pro entitlement.
 */
export async function restorePurchases(_productId: string): Promise<boolean> {
  const RC = await getRCModule();
  if (!RC) return false;
  try {
    const customerInfo = await RC.default.restorePurchases();
    return customerInfo.entitlements.active[RC_CONFIG.entitlementId] !== undefined;
  } catch {
    return false;
  }
}
