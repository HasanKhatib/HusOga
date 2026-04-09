import { Platform } from 'react-native';
import type * as InAppPurchases from 'expo-in-app-purchases';
import { IAP_CONFIG } from './iapConfig';

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

let connected = false;

let iapPromise: Promise<typeof import('expo-in-app-purchases') | null> | null = null;

async function getIapModule(): Promise<typeof import('expo-in-app-purchases') | null> {
  if (Platform.OS === 'web') return null;
  if (!iapPromise) {
    // Avoid crashing on runtimes where the native module isn't present (e.g. Expo Go).
    iapPromise = import('expo-in-app-purchases')
      .then((m) => m)
      .catch(() => null);
  }
  return iapPromise;
}

export function getIapStatus(): IapPlatformStatus {
  if (Platform.OS === 'ios') {
    return { kind: 'supported', productId: IAP_CONFIG.ios.productId };
  }
  if (Platform.OS === 'android') {
    if (!IAP_CONFIG.android.productId) {
      return { kind: 'pending', reason: 'android_purchase_setup_pending' };
    }
    return { kind: 'supported', productId: IAP_CONFIG.android.productId };
  }
  return { kind: 'unsupported', reason: 'iap_not_supported_on_web' };
}

async function ensureConnected(): Promise<void> {
  if (connected) return;
  const IAP = await getIapModule();
  if (!IAP) throw new Error('iap_unavailable');
  await IAP.connectAsync();
  connected = true;
}

export async function getProducts(): Promise<IapItemDetails[]> {
  const status = getIapStatus();
  if (status.kind !== 'supported') return [];
  const IAP = await getIapModule();
  if (!IAP) return [];
  await ensureConnected();
  const { responseCode, results } = await IAP.getProductsAsync([status.productId]);
  if (responseCode !== IAP.IAPResponseCode.OK || !results) return [];
  return results.map((r) => ({
    productId: r.productId,
    title: r.title,
    description: r.description,
    price: r.price,
  }));
}

/**
 * Start a purchase flow and resolve when the transaction is finished.
 * This is a client-only entitlement; server-side validation is out of scope for now.
 */
export async function purchaseProduct(productId: string): Promise<'purchased'> {
  const IAP = await getIapModule();
  if (!IAP) throw new Error('iap_unavailable');
  await ensureConnected();

  // Cache details (required on iOS).
  await IAP.getProductsAsync([productId]);

  const result = await new Promise<'purchased'>((resolve, reject) => {
    let done = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      if (timeoutId) clearTimeout(timeoutId);
      fn();
    };

    // setPurchaseListener is global; set it per-attempt so each purchase has its own resolver.
    IAP.setPurchaseListener(async ({ responseCode, results, errorCode }) => {
      if (done) return;

      if (responseCode === IAP.IAPResponseCode.USER_CANCELED) {
        finish(() => reject(new Error('purchase_cancelled')));
        return;
      }
      if (responseCode === IAP.IAPResponseCode.ERROR) {
        finish(() => reject(new Error(errorCode ? String(errorCode) : 'purchase_failed')));
        return;
      }
      if (responseCode !== IAP.IAPResponseCode.OK || !results) return;

      for (const purchase of results) {
        if (purchase.productId !== productId) continue;
        try {
          // non-consumable
          await IAP.finishTransactionAsync(purchase, false);
          finish(() => resolve('purchased'));
        } catch (e) {
          finish(() => reject(e instanceof Error ? e : new Error('finishTransaction failed')));
        }
      }
    });

    IAP.purchaseItemAsync(productId).catch((e) => {
      finish(() => reject(e instanceof Error ? e : new Error('purchase_failed')));
    });

    // Timeout safety
    timeoutId = setTimeout(() => {
      finish(() => reject(new Error('purchase_timeout')));
    }, 120_000);
  });

  return result;
}

export async function restorePurchases(productId: string): Promise<boolean> {
  const IAP = await getIapModule();
  if (!IAP) return false;
  await ensureConnected();
  const { responseCode, results } = await IAP.getPurchaseHistoryAsync();
  if (responseCode !== IAP.IAPResponseCode.OK || !results) return false;
  return results.some((p) => p.productId === productId);
}
