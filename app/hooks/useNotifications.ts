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
    async function registerAndSaveToken(retryCount = 0) {
      if (!token || tokenRegistered.current) return;

      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let final = existing;
        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          final = status;
        }

        console.log(`[Push] Permission status: ${final} (Attempt ${retryCount + 1})`);
        if (final !== 'granted') return;

        let pushToken: string | null = null;

        // Try Native FCM first
        try {
          console.log('[Push] Attempting to get Native FCM token...');
          const deviceToken = (await Notifications.getDevicePushTokenAsync()).data;
          if (deviceToken) {
            pushToken = deviceToken;
            console.log('[Push] Acquired Native FCM Token:', deviceToken.slice(0, 20) + '...');
          }
        } catch (e) {
          console.log('[Push] Native FCM acquisition failed:', (e as Error).message);
        }

        // Fallback to Expo token if native fails
        if (!pushToken) {
          try {
            console.log('[Push] Falling back to Expo push token...');
            const expoToken = (await Notifications.getExpoPushTokenAsync()).data;
            pushToken = expoToken;
            console.log('[Push] Acquired Expo Push Token:', expoToken.slice(0, 20) + '...');
          } catch (e) {
            console.log('[Push] Expo fallback failed:', (e as Error).message);
          }
        }

        if (pushToken) {
          console.log('[Push] Sending token to backend (with explicit auth)...');
          await saveFCMToken(pushToken, token);
          tokenRegistered.current = true;
          console.log('[Push] Token successfully saved to backend');
        } else {
          // If no token acquired, retry after 5 seconds
          if (retryCount < 3) {
            console.log('[Push] No token acquired, retrying in 5s...');
            setTimeout(() => registerAndSaveToken(retryCount + 1), 5000);
          }
        }
      } catch (e) {
        console.warn('[Push] Error in registerAndSaveToken:', e);
        if (retryCount < 3) {
          setTimeout(() => registerAndSaveToken(retryCount + 1), 5000);
        }
      }
    }

    // Give the auth store a second to settle before trying to register
    const timer = setTimeout(() => registerAndSaveToken(), 1000);
    return () => clearTimeout(timer);
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
