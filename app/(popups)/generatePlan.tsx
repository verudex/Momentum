// File: app/(popups)/generatePlan.tsx
import React, { useContext, useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext"; // import your ThemeContext
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { getFirestore, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";

const GeneratePlan = () => {
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [showResult, setShowResult] = useState(false);

  const isInvalid = !prompt;

  const db = getFirestore(app);

  const handleGenerate = async () => {
    if (!prompt || !user) return;
    setIsLoading(true);
    try {
      const API_BASE_URL = "http://192.168.1.77:3001";

      const response = await fetch(`${API_BASE_URL}/api/calculate/generate-workout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: prompt }),
      });

      const data = await response.json();
      if (data.result) {
        setGeneratedPlan(data.result);
        setShowResult(true);
      } else {
        Alert.alert("Error", "No result returned.");
      }
    } catch (error) {
      console.error("Error generating workout plan:", error);
      Alert.alert("Error", "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    try {
      const planRef = doc(db, "Users", user.uid, "plans", "workoutPlan");
      await setDoc(planRef, {
        description: generatedPlan,
        timestamp: serverTimestamp(),
      });

      Alert.alert("Success!", "Workout Plan Saved!");
      setPrompt("");
      setGeneratedPlan("");
      setShowResult(false);
    } catch (error) {
      console.error("Error saving workout plan:", error);
      Alert.alert("Error", "Could not save workout plan.");
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "white" }]}
      contentContainerStyle={{ paddingBottom: hp(5) }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {showResult ? (
        <>
          <View
            style={[
              styles.resultBox,
              {
                backgroundColor: isDarkMode ? "#1E1E1E" : "#F5F5F5",
                shadowColor: isDarkMode ? "#000" : "#000",
                shadowOpacity: isDarkMode ? 0.7 : 0.1,
              },
            ]}
          >
            <Text
              style={[
                styles.resultTitle,
                { color: isDarkMode ? "#D1D5DB" : "#111" },
              ]}
            >
              AI Workout Plan
            </Text>
            <Text
              style={[
                styles.resultText,
                { color: isDarkMode ? "#E5E7EB" : "#333" },
              ]}
            >
              {generatedPlan}
            </Text>
          </View>

          <Animated.View entering={FadeInLeft.delay(300).duration(1000).springify()}>
            <TouchableOpacity
              style={[styles.submitButton, { marginTop: hp(3), backgroundColor: "#10B981" }]}
              onPress={handleSavePlan}
            >
              <Text style={styles.submitButtonText}>Save Plan</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            entering={FadeInLeft.delay(400).duration(1000).springify()}
            style={styles.dividerWrapper}
          >
            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#374151" : "#D1D5DB" }]} />
            <Text style={[styles.orText, { color: isDarkMode ? "#9CA3AF" : "#9CA3AF" }]}>or</Text>
            <View style={[styles.divider, { backgroundColor: isDarkMode ? "#374151" : "#D1D5DB" }]} />
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(500).duration(1000).springify()}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "#7C3AED" }]}
              onPress={() => {
                setShowResult(false);
                setPrompt("");
                setGeneratedPlan("");
              }}
            >
              <Text style={styles.submitButtonText}>Generate Another Plan</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      ) : (
        <>
          <Animated.Text
            entering={FadeInUp.duration(500).springify()}
            style={[styles.title, { color: isDarkMode ? "#E5E7EB" : "rgb(57, 53, 53)" }]}
          >
            Workout Plan
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(200).duration(500).springify()}
            style={[styles.subtitle, { color: isDarkMode ? "#9CA3AF" : "rgb(146, 136, 136)" }]}
          >
            What would you like to work on?
          </Animated.Text>

          <View style={styles.inputWrapper}>
            <Animated.View entering={FadeInLeft.delay(300).duration(500).springify()}>
              <TextInput
                multiline
                style={[
                  styles.input,
                  {
                    backgroundColor: isDarkMode ? "#1E1E1E" : "white",
                    borderColor: isDarkMode ? "#444" : "#ccc",
                    color: isDarkMode ? "#E5E7EB" : "black",
                  },
                ]}
                placeholder="Describe your goal/requirements (e.g. lose fat, include certain workouts, etc.)"
                placeholderTextColor={isDarkMode ? "#9CA3AF" : "#888"}
                value={prompt}
                onChangeText={setPrompt}
              />
            </Animated.View>
          </View>

          <Animated.View entering={FadeInLeft.delay(400).duration(500).springify()}>
            <TouchableOpacity
              disabled={!prompt || isLoading}
              onPress={handleGenerate}
              style={[
                styles.submitButton,
                (!prompt || isLoading) && styles.disabled,
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Generate Plan</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </KeyboardAwareScrollView>
  );
};

export default GeneratePlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hp(1),
    paddingHorizontal: wp(8),
  },
  title: {
    textAlign: "center",
    fontSize: hp(5.7),
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: hp(2.2),
    fontWeight: "bold",
    marginTop: hp(1),
  },
  inputWrapper: {
    marginVertical: hp(4),
  },
  input: {
    minHeight: hp(20),
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.7),
    borderRadius: 30,
    borderWidth: 1,
    fontSize: hp(2),
    textAlignVertical: "top",
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
  resultBox: {
    borderRadius: 20,
    paddingTop: wp(5),
    paddingHorizontal: wp(5),
    shadowRadius: 10,
    elevation: 5,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: hp(2.5),
    marginBottom: hp(1),
  },
  resultText: {
    fontSize: hp(2),
    lineHeight: hp(2.8),
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(1),
  },
  divider: {
    flex: 1,
    height: 1,
    marginTop: hp(0.6),
  },
  orText: {
    marginHorizontal: wp(4.5),
    fontSize: hp(2),
  },
});
