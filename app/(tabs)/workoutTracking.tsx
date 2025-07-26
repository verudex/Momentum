import React, { useContext } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeContext } from "../../contexts/ThemeContext";

const WorkoutTracking = () => {
  useDisableBack();
  const router = useRouter();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB', marginTop: -useHeaderHeight() / 2 }]}>
      <View style={styles.innerWrapper}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={[styles.title, { color: isDarkMode ? '#E0E0E0' : 'rgb(57, 53, 53)' }]}
        >
          Workout Tracking
        </Animated.Text>

        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={[styles.subtitle, { color: isDarkMode ? '#A0A0A0' : 'rgb(146, 136, 136)' }]}
        >
          What would you like to do?
        </Animated.Text>

        <Animated.View
          entering={FadeInLeft.delay(300).duration(1000).springify()}
          style={styles.buttonsWrapper}
        >
          <TouchableOpacity
            style={[styles.recordButton, { backgroundColor: isDarkMode ? '#22C55E' : '#34D399', borderRightColor: isDarkMode ? '#333' : 'rgb(57, 53, 53)', shadowColor: isDarkMode ? '#000' : 'black' }]}
            onPress={() => router.push("/(popups)/workoutSubmit")}
          >
            <Text style={styles.recordButtonText}>Record a workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: isDarkMode ? '#22C55E' : '#34D399', shadowColor: isDarkMode ? '#000' : 'black' }]}
            onPress={() => router.push("/(popups)/workoutHistory")}
          >
            <FontAwesome name="history" size={hp(3.5)} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          entering={FadeInLeft.delay(400).duration(1000).springify()}
          style={styles.dividerWrapper}
        >
          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#444' : '#D1D5DB' }]} />
          <Text style={[styles.orText, { color: isDarkMode ? '#888' : '#9CA3AF' }]}>or</Text>
          <View style={[styles.divider, { backgroundColor: isDarkMode ? '#444' : '#D1D5DB' }]} />
        </Animated.View>

        <Animated.View
          entering={FadeInLeft.delay(500).duration(1000).springify()}
          style={styles.aiPlanWrapper}
        >
          <TouchableOpacity
            style={[styles.aiPlanButton, { backgroundColor: isDarkMode ? '#7C3AED' : '#7C3AED', shadowColor: '#000' }]}
            onPress={() => router.push("/(popups)/workoutPlan")}
          >
            <Text style={styles.aiPlanButtonText}>View AI Workout Plan</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default WorkoutTracking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
  },
  innerWrapper: {
    width: wp(85),
  },
  title: {
    textAlign: "center",
    fontSize: hp(5.7),
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    fontSize: hp(2.5),
    fontWeight: "bold",
    marginBottom: hp(1.5),
  },
  buttonsWrapper: {
    flexDirection: "row",
    marginTop: hp(2),
    marginBottom: hp(0),
  },
  recordButton: {
    flex: 7,
    paddingVertical: hp(2.5),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    alignItems: "center",
    borderRightWidth: 1,
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 1,
    shadowRadius: wp(3),
    elevation: 4,
  },
  recordButtonText: {
    color: "white",
    fontSize: hp(3),
    fontWeight: "bold",
  },
  historyButton: {
    flex: 2,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 1,
    shadowRadius: wp(3),
    elevation: 4,
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
    marginTop: hp(0.6),
  },
  orText: {
    marginHorizontal: wp(4.5),
    fontSize: hp(2),
  },
  aiPlanWrapper: {
    alignItems: "center",
  },
  aiPlanButton: {
    paddingVertical: hp(2.5),
    paddingHorizontal: wp(9.5),
    borderRadius: 30,
    alignItems: "center",
    shadowOffset: { width: 0, height: hp(0.7) },
    shadowOpacity: 0.15,
    shadowRadius: wp(4),
    elevation: 6,
  },
  aiPlanButtonText: {
    color: "white",
    fontSize: hp(3),
    fontWeight: "bold",
  },
  toggleThemeButton: {
    marginTop: hp(3),
    alignSelf: "center",
    padding: hp(1.5),
    borderRadius: 20,
  },
  toggleThemeText: {
    fontWeight: "bold",
    fontSize: hp(2),
  },
});
