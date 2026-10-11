import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { isApiError } from '@/lib/api';

import { deleteDevice, registerDevice } from './devices.api';

/** The server's id for this device's registration, kept for sign-out. */
const DEVICE_ID_KEY = 'lokkhyo.push.deviceId';

/**
 * Register this device for server push.
 *
 * Android only: `getDevicePushTokenAsync` returns the raw FCM token there,
 * which is what the server sends to. (iOS would return an APNs token, which
 * FCM cannot address without `@react-native-firebase/messaging`.) Skipped
 * unless notifications are permitted — there is no point being pushed to a
 * device that will not show it. Safe to call on every launch: the server
 * upserts on the token.
 *
 * Pass `token` when it comes from the token-refresh listener.
 */
export async function registerThisDevice(token?: string): Promise<void> {
  if (Platform.OS !== 'android') return;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const fcmToken = token ?? String((await Notifications.getDevicePushTokenAsync()).data);
  const device = await registerDevice({
    fcmToken,
    platform: 'ANDROID',
    deviceName: `${Platform.OS} ${String(Platform.Version)}`,
  });
  await AsyncStorage.setItem(DEVICE_ID_KEY, device.id);
}

/**
 * Stop pushes to this device. Called before Firebase sign-out, while the ID
 * token that authorises the delete is still valid. Never throws: a failed
 * unregister must not block signing out, and the server also drops tokens FCM
 * reports as dead.
 */
export async function unregisterThisDevice(): Promise<void> {
  try {
    const id = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (id) {
      await deleteDevice(id).catch((error: unknown) => {
        // Already gone (another sign-out, or the account was deleted) is fine.
        if (!(isApiError(error) && error.code === 'NOT_FOUND')) throw error;
      });
    }
  } catch (error) {
    console.warn('[devices] Unregister failed:', error);
  } finally {
    await AsyncStorage.removeItem(DEVICE_ID_KEY).catch(() => undefined);
  }
}

/** Forget the stored registration without calling the server (account deleted). */
export async function forgetThisDevice(): Promise<void> {
  await AsyncStorage.removeItem(DEVICE_ID_KEY).catch(() => undefined);
}
