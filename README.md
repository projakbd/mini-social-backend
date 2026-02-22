# Mini Social Feed App 📱

Welcome to the Mini Social Feed App! This is a simple, lightweight social media project where you can share what's on your mind, see what others are up to, and get notified when people interact with your posts.

## What can you do?

- 📝 **Create Posts**: Share quick text updates with everyone.
- 🗞️ **Live Feed**: See a shared stream of posts from all users, updated in real-time.
- ❤️ **Like & Comment**: Show some love or start a conversation on any post.
- 🔔 **Stay Notified**: You'll get a push notification on your phone whenever someone likes or comments on your post.
- 🔍 **Filter**: Looking for someone specific? You can easily filter the feed by username.

---

## How to get it running

### 1. The Backend (Node.js)
First, let's get the server up and running:
1. Go into the `backend` folder and run `npm install`.
2. Make sure you have your `.env` file ready with your MongoDB URI and JWT secrets.
3. Start it up with `npm run dev`. It'll be listening on port 5000.

### 2. The Mobile App (React Native / Expo)
Next, let's launch the app on your phone or emulator:
1. Go into the `app` folder and run `npm install`.
2. Open `app/constants/config.ts` and point it to your computer's IP address (so your phone can talk to your server).
3. Run `npm start` and scan the QR code with the **Expo Go** app.

---

## Technical Details (For the curious)

- **Backend**: Built with Node.js and Express. It uses JWT for secure logins and Mongoose to talk to MongoDB.
- **Frontend**: A React Native app built with Expo Router. It's designed to be clean, fast, and responsive on both phones and tablets.
- **Notifications**: Powered by Firebase Cloud Messaging (FCM) to make sure you never miss an interaction.

