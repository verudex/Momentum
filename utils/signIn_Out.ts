import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const googleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Trigger Google Sign-In flow
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) throw new Error('No ID token found');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const userCredential = await auth().signInWithCredential(googleCredential);

    return {
      success: true,
      user: userCredential.user,
    };

  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      return { success: false, cancelled: true };
    }

    console.error("Google Sign-In failed:", error);
    return {
      success: false,
      error,
    };
  }
};

export const signOut = async () => {
  try {
    await GoogleSignin.revokeAccess(); // Disconnects their google account i think, so no more autofill
    console.log("1");
    await GoogleSignin.signOut(); // Runs the signOut command
    console.log("2");
    await auth().signOut(); // Signs out from Firebase SDK
    console.log("3");
    Alert.alert("Success", "You have been logged out successfully");
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to logout. Please try again.");
  }
};