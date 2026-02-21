import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!admin.apps.length) {
    try {
        if (serviceAccountPath) {
            const serviceAccountPathResolved = path.resolve(serviceAccountPath);
            const serviceAccount = JSON.parse(
                fs.readFileSync(serviceAccountPathResolved, 'utf8'),
            ) as admin.ServiceAccount;

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('Firebase Admin initialized successfully using service account');
        } else {
            console.warn('FIREBASE_SERVICE_ACCOUNT_PATH not provided in .env');
            console.warn('Firebase Admin is not fully initialized. Notifications will fail.');
        }
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error);
    }
}

export default admin;
