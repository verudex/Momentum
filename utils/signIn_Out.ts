import { Alert } from "react-native";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User
} from "firebase/auth";
import { app } from "./firebaseConfig";
import { router } from "expo-router";
import { createUserProfile } from "./userFirestore";

// Get modular Firebase Auth instance
const auth = getAuth(app);

// 🔒 Handle Firebase Auth errors
const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  switch (error.code) {
    case 'auth/email-already-in-use':
      Alert.alert("Email In Use", "That email address is already in use!");
      break;
    case 'auth/invalid-email':
      Alert.alert("Invalid Email", "The email address is badly formatted.");
      break;
    case 'auth/user-not-found':
      Alert.alert("Account Not Found", "No user found with this email.");
      break;
    case 'auth/wrong-password':
      Alert.alert("Wrong Password", "Incorrect password for this account.");
      break;
    case 'auth/weak-password':
      Alert.alert("Weak Password", "Password should be at least 6 characters.");
      break;
    case 'auth/too-many-requests':
      Alert.alert("Access Blocked", "Too many failed attempts. Try again later or reset your password.");
      break;
    default:
      Alert.alert("Error", error.message || "An unknown error occurred.");
  }
};

//
// ✅ Google Sign-In
//
export const googleSignIn = async (setUser: (user: User) => void) => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error('No ID token found');

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    setUser(userCredential.user);
    if (!userCredential.user.email) {
      throw new Error("Google account did not return an email.");
    }

    await createUserProfile({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    });

    return {
      success: true,
      user: userCredential.user,
    };

  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }
    handleAuthError(error);
    return {
      success: false,
      error,
    };
  }
};

//
// ✅ Email Sign-In
//
export const signIn = async (
  email: string,
  password: string,
  setUser: (user: User) => void
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    if (!userCredential.user.email) {
      throw new Error("Google account did not return an email.");
    }

    await createUserProfile({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    });
    router.replace("/(tabs)/home");
  } catch (error) {
    handleAuthError(error);
  }
};

//
// ✅ Email Register
//
export const emailRegister = async (
  email: string,
  password: string,
  setUser: (user: User) => void
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setUser(userCredential.user);
    if (!userCredential.user.email) {
      throw new Error("Google account did not return an email.");
    }

    await createUserProfile({
      uid: userCredential.user.uid,
      email: userCredential.user.email,
    });
    router.replace("/(tabs)/home");
  } catch (error) {
    handleAuthError(error);
  }
};

//
// ✅ Sign-Out (Google or Email)
//
export const signOut = async (setUser: (user: null) => void) => {
  try {
    await firebaseSignOut(auth);
    await GoogleSignin.signOut(); // optional: only if user signed in with Google
    setUser(null);
    Alert.alert("Success", "You have been logged out");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to logout. Please try again.");
  }
};
