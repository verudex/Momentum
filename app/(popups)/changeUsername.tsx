import React, { useContext, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AuthContext } from "../../contexts/AuthContext";
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
} from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { updateProfile } from "firebase/auth";


const ChangeUsername = () => {
  const { user, setUser } = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore(app);

	const handleUsernameChange = async () => {
		if (!newUsername.trim()) {
			Alert.alert("Error", "Username cannot be empty.");
			return;
		}

		if (!user) {
			Alert.alert("Error", "You must be logged in to change your username.");
			return;
		}

		setIsLoading(true);

		try {
			const usernameQuery = query(
				collection(db, "userData"),
				where("username", "==", newUsername.trim())
			);
			const snapshot = await getDocs(usernameQuery);

			if (!snapshot.empty) {
				Alert.alert("Error", "Username already exists. Try another one.");
				setIsLoading(false);
				return;
			}

			// Update Firestore
			await setDoc(doc(db, "userData", user.uid), {
				username: newUsername.trim(),
			}, { merge: true });

			// Update Firebase Auth profile
			await updateProfile(user, { displayName: newUsername.trim() });

			// Update local user context
			setUser({ ...user, displayName: newUsername.trim() });

			Alert.alert("Success", "Username updated successfully!");
			setNewUsername("");
		} catch (error) {
			console.error("Error updating username:", error);
			Alert.alert("Error", "Something went wrong. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};


  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: "white" }}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.titleWrapper}>
        <Animated.Text
          entering={FadeInUp.duration(500).springify()}
          style={styles.title}
        >
          Change Username
        </Animated.Text>
      </View>

      <View style={styles.inputWrapper}>
        <Animated.View entering={FadeInLeft.delay(300).duration(500).springify()}>
          <TextInput
            style={styles.input}
            placeholder="Enter new username"
            value={newUsername}
            onChangeText={setNewUsername}
          />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInLeft.delay(500).duration(500).springify()}>
        <TouchableOpacity
          disabled={isLoading || !newUsername.trim()}
          onPress={handleUsernameChange}
          style={[
            styles.submitButton,
            (isLoading || !newUsername.trim()) && styles.disabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Change Username</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
};

export default ChangeUsername;

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "white",
    paddingTop: hp(15),
    paddingHorizontal: wp(8),
  },
  titleWrapper: {
    marginBottom: hp(1),
  },
  title: {
    textAlign: "center",
    fontSize: hp(5),
    fontWeight: "bold",
    color: "#393535",
  },
  inputWrapper: {
    marginVertical: hp(3),
    gap: hp(2),
  },
  input: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.7),
    borderRadius: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: hp(2),
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(2),
    borderRadius: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});
