import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { saveFCMToken } from '@/services/authService';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const token = useAuthStore((s) => s.token);
  const tokenRegistered = useRef(false);

  useEffect(() => {
    if (!token) return;

    async function registerAndSaveToken() {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let final = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          final = status;
        }

        console.log('Notification permission status:', final);
        if (final !== 'granted') {
          Alert.alert('Notification', 'No notification permission!');
          return;
        }

        const pushToken = (await Notifications.getDevicePushTokenAsync()).data;
        console.log('Acquired Native FCM Token:', pushToken);

        if (pushToken && !tokenRegistered.current) {
          await saveFCMToken(pushToken);
          tokenRegistered.current = true;
          console.log('Token successfully sent to backend');
        }
      } catch (e) {
        console.warn('Failed to register push token', e);
      }
    }

    registerAndSaveToken();
  }, [token]);

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener((n) => {
    });
    const responded = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { postId?: string };
      if (data?.postId) {
        router.push(`/post/${data.postId}`);
      }
    });
    return () => {
      received.remove();
      responded.remove();
    };
  }, []);

  return null;
}
