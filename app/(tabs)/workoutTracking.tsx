import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";


const WorkoutTracking = () => {
  useDisableBack();
  const router = useRouter();
  
  return (
    <SafeAreaView style={[styles.container, {marginTop: -useHeaderHeight() / 2}]}>
      <View style={styles.innerWrapper}>
        <Animated.Text 
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={styles.title}
        >
          Workout Tracking
        </Animated.Text>

        <Animated.Text 
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={styles.subtitle}
        >
          What would you like to do?
        </Animated.Text>

        <Animated.View 
          entering={FadeInLeft.delay(300).duration(1000).springify()} 
          style={styles.buttonWrapper}
        >
          <TouchableOpacity 
            style={styles.historyButton}
            onPress={() => {
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
          style={styles.buttonWrapper}
        >
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={() => router.push("/(popups)/workoutSubmit")}
          >
            <Text style={styles.submitButtonText}>Record a workout</Text>
          </TouchableOpacity>
        </Animated.View>
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
    paddingHorizontal: wp(8),
  },
  innerWrapper: {
    width: wp(85),
  },
  title: {
    textAlign: "center",
    fontSize: hp(5.7),
    fontWeight: "bold",
    color: "rgb(57, 53, 53)",
  },
  subtitle: {
    textAlign: "center",
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "rgb(146, 136, 136)",
    marginBottom: hp(1.5),
  },
  historyButton: {
    width: "100%",
    marginTop: hp(2),
    backgroundColor: "rgb(76, 72, 159)",
    paddingVertical: hp(3),
    borderRadius: 30,
    alignItems: "center",
  },
  historyButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: hp(3),
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: hp(2),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
    marginTop: hp(0.6),
  },
  orText: {
    marginHorizontal: wp(4.5),
    fontSize: hp(2),
    color: "#6B7280",
  },
  buttonWrapper: {
    alignItems: "center",
    backgroundColor: "transparent",
  },
  submitButton: {
    width: "100%",
    backgroundColor: "rgb(79, 70, 229)",
    paddingVertical: hp(3),
    borderRadius: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: hp(3),
  },
});