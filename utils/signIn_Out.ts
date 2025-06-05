import { Alert } from "react-native";
import { useContext } from "react";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { router } from "expo-router";
import { AuthContext } from "../contexts/AuthContext";
import { createUserProfile } from "./userFirestore";

// Helper function to handle Firebase auth errors
const handleAuthError = (error: any) => {
  console.error("Auth error:", error);
  switch (error.code) {
    case 'auth/invalid-email':
      Alert.alert("Invalid Email", "The email address is badly formatted");
      break;
    case 'auth/user-not-found':
      Alert.alert("Account Not Found", "No user found with this email");
      break;
    case 'auth/wrong-password':
      Alert.alert("Wrong Password", "Incorrect password for this account");
      break;
    case 'auth/too-many-requests':
      Alert.alert("Access Blocked", "Too many failed attempts. Try again later or reset your password");
      break;
    default:
      Alert.alert("Error", error.message || "An unknown error occurred");
  }
};

//Google Sign-In
export const googleSignIn = async (setUser: (user: any) => void) => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Trigger Google Sign-In flow
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error('No ID token found');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const userCredential = await auth().signInWithCredential(googleCredential);

    setUser(userCredential.user); // Stores user data locally
    createUserProfile(userCredential.user); // Creates a database for the user

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

//Email Register
// export const emailRegister = async (email: string, password: string, setUser: (user: any) => void) => {
//   try {
//       await auth().createUserWithEmailAndPassword(
//         email, 
//         password
//       );
//     } catch (error: any) {
//       console.error('Registration error:', error);
    
//       // Handle specific errors
//       if (error.code === 'auth/email-already-in-use') {
//         setEmailError('That email address is already in use!');
//       } else if (error.code === 'auth/invalid-email') {
//         setEmailError('That email address is invalid!');
//       } else if (error.code === 'auth/weak-password') {
//         setPasswordError('Password should be at least 6 characters');
//       }
//     }
// }

// Email Sign-In
export const signIn = async (email: string, password: string, setUser: (user: any) => void) => {  
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    setUser(userCredential.user); // Update context
    createUserProfile(userCredential.user);
    router.replace("/(tabs)/home");
  } catch (error) {
    handleAuthError(error);
  }
};


// Sign-Out (Handles both Google and email/password)
export const signOut = async (setUser: (user: null) => void) => {
  try {
    await auth().signOut();
    await GoogleSignin.signOut(); // Only relevant if user signed in with Google
    setUser(null); // Clear user from context
    Alert.alert("Success", "You have been logged out");
  } catch (error) {
    Alert.alert("Error", "Failed to logout. Please try again.");
    console.error(error);
  }
};