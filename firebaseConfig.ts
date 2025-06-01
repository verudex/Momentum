// Import the functions you need from the SDKs you need

//import { initializeApp, getApp } from "firebase/app";

import {initializeApp, getApps} from 'firebase/app';

import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

  apiKey: "AIzaSyABpQ4VetFSr4j6oKlTqY0FPGA4uB4g0s8",

  authDomain: "momentum-95eff.firebaseapp.com",

  projectId: "momentum-95eff",

  storageBucket: "momentum-95eff.firebasestorage.app",

  messagingSenderId: "12153493344",

  appId: "1:12153493344:web:a7e072d6853af358cff005",

  measurementId: "G-SS6RDEG3XZ"

};

let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
export { auth };

// Initialize Firebase

// const app = initializeApp(firebaseConfig);

// const auth = getAuth(app);

// const analytics = getAnalytics(app);

//export { auth };
// export const auth = initializeAuth(app, {
//   persistence: getReactNativePersistence(ReactNativeAsyncStorage)
// });
// const analytics = getAnalytics(app);

// Android Client ID: 404413087560-rc16d6m5h55abo96bcaj89flnruph56l.apps.googleusercontent.com
// Android SHA1 fingerprint: B8:10:90:4E:19:35:3E:07:69:1A:2F:45:CD:1C:3B:BA:90:D9:9F:6C gen by EAS configure
