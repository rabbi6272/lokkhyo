/** Wire types for devices — mirror `lokkhyo_server/schemas/notification.ts`. */

export interface DeviceDto {
  id: string;
  fcmToken: string;
  platform: 'ANDROID' | 'IOS';
  deviceName: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export interface RegisterDeviceDto {
  fcmToken: string;
  platform: 'ANDROID' | 'IOS';
  deviceName?: string;
}
