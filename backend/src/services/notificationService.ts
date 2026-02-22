import admin from '../config/firebase.js';
import User from '../models/User.js';
import { SendNotificationParams } from '../types/index.js';


export const sendNotification = async ({ userId, title, body, data }: SendNotificationParams) => {
    try {
        const user = await User.findById(userId);

        if (!user || !user.fcmTokens || user.fcmTokens.filter(t => !!t).length === 0) {
            console.log(`No valid FCM tokens found for user ${userId}. Tokens in DB:`, user?.fcmTokens);
            return;
        }

        const validTokens = user.fcmTokens.filter(t => !!t);
        console.log(`Attempting to send notification to user ${userId} with ${validTokens.length} tokens.`);

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            ...(data && { data }),
            tokens: validTokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`FCM Response for user ${userId}: Success=${response.successCount}, Failure=${response.failureCount}`);

        if (response.failureCount > 0) {
            const failedTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    console.error(`FCM error for token ${user.fcmTokens![idx]}:`, resp.error);
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
