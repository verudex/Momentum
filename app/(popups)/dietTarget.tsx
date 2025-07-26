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
import { ThemeContext } from "../../contexts/ThemeContext";
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";

const DietTarget = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const [target, setTarget] = useState("");
  const [goalType, setGoalType] = useState<"deficit" | "surplus">("deficit");
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !target;

  const db = getFirestore(app);

  const updateTarget = async () => {
    setIsLoading(true);
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, "Users", user.uid, "targets", "dietTarget");
      await setDoc(
        docRef,
        {
          targetCalories: target,
          goalType: goalType, // "deficit" or "surplus"
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      Alert.alert("Calorie Target Updated!", "Good luck!");
      setTarget("");
    } catch (error) {
      Alert.alert("Error", "Failed to update target.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const isNumber = (text: string) => /^\d+$/.test(text);

  return (
    <KeyboardAwareScrollView
      style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}
      contentContainerStyle={[styles.contentContainer, isDarkMode ? styles.contentContainerDark : styles.contentContainerLight]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.titleWrapper}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={[styles.title, isDarkMode && styles.titleDark]}
        >
          Diet Tracking
        </Animated.Text>
      </View>

      <View style={styles.subtitleWrapper}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={[styles.subtitle, isDarkMode && styles.subtitleDark]}
        >
          Set a new target!
        </Animated.Text>
      </View>

      <View style={styles.inputWrapper}>
        <Animated.View entering={FadeInLeft.delay(300).duration(500).springify()}>
          <TextInput
            style={[styles.input, isDarkMode && styles.inputDark]}
            placeholder="Target Calories*"
            placeholderTextColor={isDarkMode ? "#aaa" : "#888"}
            keyboardType="number-pad"
            value={target}
            onChangeText={(text) => {
              if (text === "" || isNumber(text)) setTarget(text);
            }}
          />
        </Animated.View>
      </View>

      <Animated.View entering={FadeInLeft.delay(400).duration(500).springify()} style={styles.toggleWrapper}>
        <TouchableOpacity
          style={[
            styles.deficitButton,
            goalType === "deficit" && styles.activeButton,
            isDarkMode && styles.toggleButtonDark,
            goalType === "deficit" && isDarkMode && styles.activeButtonDark,
          ]}
          onPress={() => setGoalType("deficit")}
        >
          <Text style={[styles.toggleText, goalType === "deficit" && styles.activeText]}>{`Deficit`}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.surplusButton,
            goalType === "surplus" && styles.activeButton,
            isDarkMode && styles.toggleButtonDark,
            goalType === "surplus" && isDarkMode && styles.activeButtonDark,
          ]}
          onPress={() => setGoalType("surplus")}
        >
          <Text style={[styles.toggleText, goalType === "surplus" && styles.activeText]}>{`Surplus`}</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInLeft.delay(500).duration(500).springify()}>
        <TouchableOpacity
          disabled={isInvalid || isLoading}
          onPress={updateTarget}
          style={[
            styles.submitButton,
            (isInvalid || isLoading) && styles.disabled,
            isDarkMode && styles.submitButtonDark,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
};

export default DietTarget;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(8),
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  contentContainer: {
    paddingTop: hp(10),
    paddingHorizontal: wp(8),
  },
  contentContainerLight: {
    backgroundColor: "white",
  },
  contentContainerDark: {
    backgroundColor: "#121212",
  },
  titleWrapper: {
    marginTop: hp(2),
  },
  title: {
    textAlign: "center",
    fontSize: hp(5.7),
    fontWeight: "bold",
    color: "rgb(57, 53, 53)",
  },
  titleDark: {
    color: "white",
  },
  subtitleWrapper: {},
  subtitle: {
    textAlign: "center",
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "rgb(146, 136, 136)",
  },
  subtitleDark: {
    color: "#aaa",
  },
  inputWrapper: {
    marginTop: hp(3),
  },
  input: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.7),
    borderRadius: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: hp(2),
    color: "#111",
    backgroundColor: "white",
  },
  inputDark: {
    borderColor: "#444",
    color: "white",
    backgroundColor: "#222",
  },
  toggleWrapper: {
    flexDirection: "row",
    marginVertical: hp(2.5),
    paddingHorizontal: wp(3),
  },
  deficitButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  surplusButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
  },
  toggleButtonDark: {
    backgroundColor: "#333",
  },
  activeButton: {
    backgroundColor: "#7C3AED",
  },
  activeButtonDark: {
    backgroundColor: "#9A6EF5",
  },
  toggleText: {
    fontSize: hp(2),
    fontWeight: "bold",
    color: "#6B7280",
  },
  activeText: {
    color: "white",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(2),
    borderRadius: 30,
    alignItems: "center",
  },
  submitButtonDark: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
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
