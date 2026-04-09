const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Ensures com.android.vending.BILLING is present in AndroidManifest.
 * Play Console requires this permission in an uploaded AAB/APK before
 * it allows creating one-time products.
 */
module.exports = function withAndroidBillingPermission(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    const usesPermissions = manifest['uses-permission'] ?? [];

    const nameKey = 'android:name';
    const permissionName = 'com.android.vending.BILLING';
    const hasPermission = usesPermissions.some((p) => p?.$?.[nameKey] === permissionName);

    if (!hasPermission) {
      usesPermissions.push({ $: { [nameKey]: permissionName } });
      manifest['uses-permission'] = usesPermissions;
    }

    return config;
  });
};
