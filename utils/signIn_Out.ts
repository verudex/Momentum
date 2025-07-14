import { Alert } from "react-native";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  sendEmailVerification,
  signOut as firebaseSignOut,
  User,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { app } from "./firebaseConfig";
import { router } from "expo-router";
import { createUserProfile } from "./userFirestore";

// Firebase instances
const auth = getAuth(app);
const db = getFirestore(app);

// ==============================
// 🔥 PUSH TOKEN HELPERS
// ==============================
const registerPushTokenForUser = async (uid: string) => {
  console.log("Starting registration of push token...");
  if (!Device.isDevice) return;
  console.log("Awaiting permissions for push token...");
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  const tokenData = await Notifications.getExpoPushTokenAsync();
  console.log('Push token registered:', tokenData.data);

  await setDoc(doc(db, 'Users', uid), {
    tokens: arrayUnion(tokenData.data)
  }, { merge: true });
};

const removePushTokenForUser = async (uid: string) => {
  if (!uid) return;
  if (!Device.isDevice) return;

  try {
    console.log("Getting push token...");
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Retrieved push token:', tokenData.data);

    await setDoc(doc(db, 'Users', uid), {
      tokens: arrayRemove(tokenData.data)
    }, { merge: true });

  } catch (error) {
    console.error("Failed to remove push token from Firestore:", error);
  }
};




// ==============================
// 🔥 ERROR HANDLER
// ==============================
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

// ==============================
// 🔥 GOOGLE SIGN IN
// ==============================
export const googleSignIn = async (setUser: (user: User) => void) => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error('No ID token found');

    const googleCredential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, googleCredential);

    setUser(userCredential.user);

    await registerPushTokenForUser(userCredential.user.uid);

    return {
      success: true,
      user: userCredential.user,
    };

  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }
    handleAuthError(error);
    return { success: false, error };
  }
};

// ==============================
// 🔥 EMAIL SIGN IN
// ==============================
export const signIn = async (
  email: string,
  password: string,
  setUser: (user: User) => void
) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await user.reload();
    if (!user.emailVerified) {
      Alert.alert(
        "Email Not Verified",
        "Please verify your email before logging in.",
        [
          {
            text: "Resend Verification",
            onPress: () => sendVerificationLink(user),
          },
          { text: "OK", style: "cancel" },
        ]
      );
      return;
    }

    setUser(user);
    await registerPushTokenForUser(user.uid);

    router.replace("/(tabs)/home");

  } catch (error) {
    handleAuthError(error);
  }
};

// ==============================
// 🔥 EMAIL REGISTER
// ==============================
export const emailRegister = async (
  email: string,
  password: string,
  username: string,
  setUser: (user: User) => void
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password, );
    const user = userCredential.user;    
    await updateProfile(user, { displayName: username });

    // Refresh the user object with updated profile info
    await user.reload();

    setUser(auth.currentUser!);

    await createUserProfile(userCredential.user);

    await sendVerificationLink(userCredential.user);
    Alert.alert("Please verify your email and log in again!");

    await registerPushTokenForUser(userCredential.user.uid);

  } catch (error) {
    handleAuthError(error);
  }
};

// ==============================
// 🔥 SEND VERIFICATION
// ==============================
const sendVerificationLink = async (user: User) => {
  try {
    if (!user.emailVerified) {
      await sendEmailVerification(user);
      Alert.alert("Email Verification Sent", "Please check your inbox to verify your account.");
    } else {
      console.log("User already verified.");
    }
  } catch (error: any) {
    console.error("Verification error:", error);
    Alert.alert("Error", error.message || "Failed to send verification email.");
  }
};

// ==============================
// 🔥 SIGN OUT
// ==============================
export const signOut = async (setUser: (user: null) => void) => {
  try {
    const user = auth.currentUser;

    if (user) {
      // Only try remove token if still logged in
      await removePushTokenForUser(user.uid);
    }

    // Then sign out from auth & Google
    await firebaseSignOut(auth);
    await GoogleSignin.signOut();

    setUser(null);
    Alert.alert("Success", "You have been logged out");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to logout. Please try again.");
  }
};