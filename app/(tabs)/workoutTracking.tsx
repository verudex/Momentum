import React, { useState, useContext } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import auth from '@react-native-firebase/auth';
import { AuthContext } from "../../contexts/AuthContext";


const WorkoutTracking = () => {
  useDisableBack();
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !workoutName;

  const handleSubmit = async () => {

  }
  
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
          What would you like to do?
        </Animated.Text>

        <View style={styles.inputWrapper}>
          <Animated.View 
            entering={FadeInLeft.delay(300).duration(1000).springify()} 
            style={styles.submitWrapper}
          >
            <TouchableOpacity 
              style={styles.historyButton}
              onPress={() => {
                console.log(user)
                router.push("/(popups)/workoutHistory")}
              }
            >
              <Text style={styles.historyButtonText}>View workout history</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(400).duration(1000).springify()}
            style={styles.dividerWrapper}
          >
            <View style={styles.divider} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.divider} />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(500).duration(1000).springify()} 
            style={styles.submitWrapper}
          >
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => router.push("/(popups)/workoutSubmit")}
            >
              <Text style={styles.submitButtonText}>Record a workout</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

    </SafeAreaView>
  )
}

export default WorkoutTracking

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
    fontSize: 20,
    fontWeight: "bold",
    color: "rgb(146, 136, 136)",
  },
  form: {
    marginTop: 24,
    gap: 20,
  },
  inputWrapper: {
    position: "relative",
    marginTop: 20,
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
  historyButton: {
    width: "100%",
    backgroundColor: "rgb(76, 72, 159)",
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  historyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 23,
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
    marginVertical: 15,
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
  submitWrapper: {
    alignItems: "center",
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "rgb(79, 70, 229)",
    paddingVertical: 20,
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
    fontSize: 23,
  },
});