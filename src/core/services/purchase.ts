import { getSettings, getDevUnlock, saveSettings } from './settings';
import { getIapStatus, purchaseProduct, restorePurchases } from './iap';

export const FREE_REPORT_LIMIT = 2;

export async function canCreateReport(currentCount: number): Promise<boolean> {
  const settings = await getSettings();
  if (settings.purchased) return true;
  if (await getDevUnlock()) return true;
  return currentCount < FREE_REPORT_LIMIT;
}

export type UpgradeResult =
  | { kind: 'purchased' }
  | {
      kind: 'pending';
      reason: PurchasePendingReason;
    }
  | { kind: 'unsupported'; reason: 'iap_not_supported_on_web' };

export type PurchasePendingReason =
  | 'android_purchase_setup_pending'
  | 'no_prior_purchase_found'
  | 'iap_unavailable'
  | 'purchase_cancelled'
  | 'purchase_failed'
  | 'purchase_timeout';

function toPurchaseErrorReason(e: unknown): PurchasePendingReason {
  const msg = e instanceof Error ? e.message : String(e);
  if (msg.includes('iap_unavailable')) return 'iap_unavailable';
  if (msg.includes('purchase_cancelled')) return 'purchase_cancelled';
  if (msg.includes('purchase_timeout')) return 'purchase_timeout';
  return 'purchase_failed';
}

/**
 * Stub for v1 — manually sets the purchased flag.
 * Replace with expo-in-app-purchases for App Store release.
 */
export async function unlockPurchased(): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, purchased: true });
}

export async function upgradeToPro(): Promise<UpgradeResult> {
  const status = getIapStatus();
  if (status.kind === 'pending') return { kind: 'pending', reason: 'android_purchase_setup_pending' };
  if (status.kind === 'unsupported') return { kind: 'unsupported', reason: 'iap_not_supported_on_web' };

  try {
    await purchaseProduct(status.productId);
    await unlockPurchased();
    return { kind: 'purchased' };
  } catch (e) {
    // Treat cancellations and failures as "not upgraded" without crashing the UI.
    // UI intentionally shows a generic message for now.
    return { kind: 'pending', reason: toPurchaseErrorReason(e) };
  }
}

export async function restorePro(): Promise<UpgradeResult> {
  const status = getIapStatus();
  if (status.kind === 'pending') return { kind: 'pending', reason: 'android_purchase_setup_pending' };
  if (status.kind === 'unsupported') return { kind: 'unsupported', reason: 'iap_not_supported_on_web' };

  const has = await restorePurchases(status.productId);
  if (has) {
    await unlockPurchased();
    return { kind: 'purchased' };
  }
  return { kind: 'pending', reason: 'no_prior_purchase_found' };
}
