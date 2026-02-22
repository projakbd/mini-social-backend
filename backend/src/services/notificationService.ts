import admin from '../config/firebase.js';
import User from '../models/User.js';
import { SendNotificationParams } from '../types/index.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushResponse {
  data?: Array<{ status: string; message?: string }>;
}

function isExpoPushToken(token: string): boolean {
  return typeof token === 'string' && token.startsWith('ExponentPushToken[');
}

async function sendExpoPush(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (tokens.length === 0) return;
  const messages = tokens.map((to) => ({
    to,
    sound: 'default' as const,
    title,
    body,
    ...(data && Object.keys(data).length > 0 && { data }),
  }));
  try {
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(messages),
    });
    const result = (await res.json()) as ExpoPushResponse;
    if (result.data?.some((d) => d.status === 'error')) {
      console.error('Expo push errors:', result.data);
    } else {
      console.log(`Expo push sent to ${tokens.length} token(s).`);
    }
  } catch (err) {
    console.error('Expo push request failed:', err);
  }
}

export const sendNotification = async ({ userId, title, body, data }: SendNotificationParams) => {
  try {
    const user = await User.findById(userId);

    if (!user || !user.fcmTokens || user.fcmTokens.filter((t) => !!t).length === 0) {
      console.log(
        `No valid FCM tokens found for user ${userId}. Tokens in DB:`,
        user?.fcmTokens ?? [],
      );
      return;
    }

    const validTokens = user.fcmTokens.filter((t) => !!t);
    const expoTokens = validTokens.filter(isExpoPushToken);
    const fcmTokens = validTokens.filter((t) => !isExpoPushToken(t));

    console.log(
      `Sending to user ${userId}: ${expoTokens.length} Expo token(s), ${fcmTokens.length} FCM token(s).`,
    );

    if (expoTokens.length > 0) {
      await sendExpoPush(expoTokens, title, body, data);
    }

    if (fcmTokens.length > 0) {
      const message: admin.messaging.MulticastMessage = {
        notification: { title, body },
        ...(data && Object.keys(data).length > 0 && { data }),
        tokens: fcmTokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(
        `FCM for user ${userId}: Success=${response.successCount}, Failure=${response.failureCount}`,
      );

      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const err = resp.error as { code?: string } | undefined;
            if (
              err?.code === 'messaging/invalid-registration-token' ||
              err?.code === 'messaging/registration-token-not-registered'
            ) {
              const tokenToRemove = fcmTokens[idx];
              if (tokenToRemove) failedTokens.push(tokenToRemove);
            }
          }
        });
        if (failedTokens.length > 0) {
          user.fcmTokens = user.fcmTokens.filter((token) => !failedTokens.includes(token));
          await user.save();
          console.log(`Cleaned up ${failedTokens.length} invalid FCM tokens for user ${userId}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
  }
};
