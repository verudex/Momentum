// File: app/(popups)/workoutPlan.tsx
import React, { useContext, useEffect, useState, useCallback } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeInUp } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";
import { AuthContext } from "../../contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";

const WorkoutPlan = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [planText, setPlanText] = useState("");
  const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			setLoading(true);
			const fetchPlan = async () => {
				if (!user) return;
				const db = getFirestore(app);
				const docRef = doc(db, "Users", user.uid, "plans", "workoutPlan");
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					setPlanText(docSnap.data().description);
				}
				setLoading(false);
			};

			fetchPlan();
		}, [user])
	);

  return (
    <KeyboardAwareScrollView style={styles.container}>
      <Animated.Text
        entering={FadeInUp.duration(500).springify()}
        style={styles.title}
      >
        Workout Plan
      </Animated.Text>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: hp(5) }} />
      ) : planText ? (
				<View style={{ paddingBottom: hp(5) }}>
					<View style={{
						backgroundColor: "#F5F5F5",
						borderRadius: 20,
						marginTop: hp(2),
						marginBottom: hp(3),
						paddingHorizontal: wp(5),
						shadowColor: "#000",
						shadowOpacity: 0.1,
						shadowRadius: 10,
						elevation: 5,
					}}>
						<Text style={styles.planText}>{planText}</Text>
					</View>

					<TouchableOpacity style={styles.button} onPress={() => router.push("/(popups)/generatePlan")}>
						<Text style={styles.buttonText}>Change Workout Plan</Text>
					</TouchableOpacity>
				</View>
      ) : (
        <View style={styles.emptyWrapper}>
					<Text style={styles.emptyText}>
							No workout plan active! 😕{"\n"}Start by generating one! 🚀
					</Text>
					
					<Text style={styles.arrow}>⬇️</Text>

					<TouchableOpacity style={styles.button} onPress={() => router.push("/(popups)/generatePlan")}>
						<Text style={styles.buttonText}>Create New Workout Plan</Text>
					</TouchableOpacity>
        </View>
      )}
    </KeyboardAwareScrollView>
  );
};

export default WorkoutPlan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(8),
    backgroundColor: "white",
  },
  title: {
    fontSize: hp(5.7),
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(57, 53, 53)",
  },
  emptyWrapper: {
    marginTop: hp(10),
    alignItems: "center",
    gap: hp(3),
  },
  emptyText: {
    fontSize: hp(2.2),
    color: "#6B7280",
    textAlign: "center",
  },
  arrow: {
    fontSize: hp(4),
    marginTop: -hp(1),
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(2),
    paddingHorizontal: wp(10),
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp(2.3),
		alignSelf: 'center',
  },
  planText: {
    fontSize: hp(2.1),
    color: "#374151",
    marginTop: hp(3),
    lineHeight: hp(3.2),
  },
});
