import React, { useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import auth from "@react-native-firebase/auth";
import { getFirestore, collection, doc, addDoc, serverTimestamp } from "@react-native-firebase/firestore";
import { getApp } from '@react-native-firebase/app';

const WorkoutSubmit = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !workoutName;

  const handleSubmit = async () => {
    setIsLoading(true);
    const uid = auth().currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    try {
      const app = getApp(); // 👈 This gets the default Firebase app instance
      const db = getFirestore(app); // 👈 Get Firestore instance tied to that app

      await addDoc(
        collection(doc(collection(db, "users"), uid), "workouts"),
        {
          name: workoutName,
          duration: duration || null,
          sets: sets || null,
          reps: reps || null,
          timestamp: serverTimestamp(),
        }
      );

      Alert.alert("Workout successfully recorded!");
      setWorkoutName("");
      setDuration("");
      setSets("");
      setReps("");
    } catch (error) {
      Alert.alert("Error", "Problem saving workout");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, {marginTop: -useHeaderHeight() / 2}]}>
      <View style={styles.innerWrapper}>
        <Animated.Text 
          entering={FadeInUp.duration(500).springify()}
          style={styles.title}
        >
          Workout Tracking
        </Animated.Text>

        <Animated.Text 
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={styles.subtitle}
        >
          Record your workout:
        </Animated.Text>

        <View style={styles.form}>
          <Animated.View 
            entering={FadeInLeft.delay(300).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Workout Name"
              autoCapitalize="none"
              onChangeText={(workoutName) => {
                setWorkoutName(workoutName);
              }}
              value={workoutName}
            />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(400).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Duration"
              autoCapitalize="none"
              onChangeText={(duration) => {
                setDuration(duration);
              }}
              value={duration}
            />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(500).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Number of Sets"
              autoCapitalize="none"
              onChangeText={(sets) => {
                setSets(sets);
              }}
              value={sets}
            />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(600).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Number of Reps"
              autoCapitalize="none"
              onChangeText={(reps) => {
                setReps(reps);
              }}
              value={reps}
            />
          </Animated.View>

          <Animated.View entering={FadeInLeft.delay(700).duration(1000).springify()}>
            <TouchableOpacity
              disabled={isInvalid || isLoading}
              onPress={handleSubmit}
              style={[styles.submitButton, (isInvalid || isLoading) && styles.disabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Record</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default WorkoutSubmit

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 24,
  },
  innerWrapper: {
    width: "100%",
  },
  logo: {
    height: 128,
    width: 128,
    alignSelf: "center",
  },
  title: {
    textAlign: "center",
    fontSize: 43,
    fontWeight: "bold",
    color: "rgb(57, 53, 53)",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    color: "rgb(146, 136, 136)",
  },
  form: {
    marginTop: 24,
    gap: 20,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "white",
    fontSize: 16,
    color: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 27,
    transform: [{ translateY: -10 }],
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 12,
  },
  loginText: {
    fontSize: 14,
    color: "#4B5563",
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#6B7280",
  },
  googleWrapper: {
    alignItems: "center",
    paddingTop: 8,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});