// utils/firebaseConfig.ts
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyABpQ4VetFSr4j6oKlTqY0FPGA4uB4g0s8",
  authDomain: "momentum-95eff.firebaseapp.com",
  projectId: "momentum-95eff",
  storageBucket: "momentum-95eff.firebasestorage.app",
  messagingSenderId: "12153493344",
  appId: "1:12153493344:web:a7e072d6853af358cff005",
  measurementId: "G-SS6RDEG3XZ"
};

// Ensure the app is only initialized once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence for React Native
initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});


export { app };