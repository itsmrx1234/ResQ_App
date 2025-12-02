🛡️ ResQApp

ResQApp is a 🚨 discreet safety and support app designed to protect individuals from domestic violence by providing:

📞 Quick emergency help

💾 Secure file storage

💬 Real-time chat with trusted contacts or experts

🎭 Hidden features to ensure user safety

✨ Features

🧮 Calculator Login (Fake UI) – doubles as a PIN-protected app entry

📞 SOS Dialer – instantly dials emergency number (112 by default)

📍 Location Sharing – send live location to trusted contacts

💾 File Save – upload and secure important files (images, audio, documents)

💬 Real-time Chat – private chat with mental health experts or responders

🎭 Hidden/Stealth Mode – disguise app as a normal calculator

☎️ Helpline Directory – quick access to verified helpline numbers

🛠️ Tech Stack

⚛️ React Native

🔥 Firebase (Auth, Firestore, Storage)

🌍 Expo / React Native CLI

⚙️ Setup & Run (Important Commands)
📥 Install Dependencies
npm install
# or
yarn install

▶️ Start Metro Bundler
npx react-native start

📱 Run App on Android Device / Emulator
npx react-native run-android

📱 Run App on iOS (Mac Only)
npx react-native run-ios

🔁 Clean Build (Android)
cd android
./gradlew clean
cd ..

📦 Install Pods (iOS)
cd ios
pod install
cd ..

🧹 Clear Cache (Fix common issues)
npx react-native start --reset-cache

🖼️ Link Native Dependencies (Older RN versions)
npx react-native link

🚀 Progress

✔️ Basic UI Screens
✔️ Firebase Setup
✔️ Calculator Fake Login
✔️ Real-time Chat Final Fixes
⬜ Expert Dashboard
⬜ Dynamic App Icon/Name Switching

🔐 Secure encryption helpers

* File uploads are encrypted with AES-256-GCM before being sent to Firebase Storage. Encrypted bytes are stored as binary blobs (application/octet-stream) so binary fidelity is preserved.
* Key material is pulled from platform-secure storage (iOS Keychain/Android Keystore via `react-native-keychain` for the RN app and `expo-secure-store` for Expo). If no key exists, a fresh one is generated and persisted; setting `RESQAPP_ENCRYPTION_KEY` allows bootstrapping from an environment secret, and `LEGACY_ENCRYPTION_KEY` supports decrypting older payloads.
* Firestore metadata attached to each upload now includes the IV, authentication tag, algorithm, and key version. When decrypting, if data is unlocked with the legacy key the helpers return a rotated payload that can be saved back to migrate data transparently.
* React Native helper: `utils/crypto.js` exports `encryptBlob`, `decryptToBlob`, and low-level byte helpers; Expo helper mirrors this API in `ResQAppExpo/utils/encryption.ts`.
