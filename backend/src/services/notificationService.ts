import admin from '../config/firebase.js';
import User from '../models/User.js';
import { SendNotificationParams } from '../types/index.js';


export const sendNotification = async ({ userId, title, body, data }: SendNotificationParams) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            console.log(`No FCM tokens found for user ${userId}. Notification not sent.`);
            return;
        }

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            ...(data && { data }),
            tokens: user.fcmTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`Successfully sent message to user ${userId}:`, response.successCount);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    if (
                        resp.error?.code === 'messaging/invalid-registration-token' ||
                        resp.error?.code === 'messaging/registration-token-not-registered'
                    ) {
                        const tokenToRemove = user.fcmTokens![idx];
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
    } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
    }
};
