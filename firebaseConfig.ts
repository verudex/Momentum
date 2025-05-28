// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABpQ4VetFSr4j6oKlTqY0FPGA4uB4g0s8",
  authDomain: "momentum-95eff.firebaseapp.com",
  projectId: "momentum-95eff",
  storageBucket: "momentum-95eff.firebasestorage.app",
  messagingSenderId: "12153493344",
  appId: "1:12153493344:web:a7e072d6853af358cff005",
  measurementId: "G-SS6RDEG3XZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);