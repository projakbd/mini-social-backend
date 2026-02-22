const path = require('path');
const fs = require('fs');

const googleServicesPath = path.resolve(__dirname, 'google-services.json');
const hasGoogleServices = fs.existsSync(googleServicesPath);

module.exports = {
  expo: {
    name: 'Mini Social',
    slug: 'mini-social',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    scheme: 'mini-social',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#1a1b2e',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.minisocial.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#1a1b2e',
      },
      package: 'com.minisocial.app',
      ...(hasGoogleServices && { googleServicesFile: './google-services.json' }),
    },
    plugins: [
      'expo-router',
      ['expo-notifications', { color: '#6c5ce7' }],
      'expo-asset',
    ],
    extra: {
      eas: {
        projectId: 'c8b61cef-7ec4-40bc-bfee-a001f4d17b20',
      },
    },
  },
};
