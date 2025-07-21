import React, { useContext, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDisableBack } from "../../hooks/useDisableBack";
import { AuthContext } from "../../contexts/AuthContext";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import CircularProgress from "../../components/CircularProgress";


const DietTracking = () => {
  useDisableBack();
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [percentage, setPercentage] = useState(0);
  const [remainingCalories, setRemainingCalories] = useState(0);
  const [mode, setMode] = useState("deficit");
  const [loading, setLoading] = useState(true);

  const db = getFirestore(app);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        if (user == null) {
          Alert.alert("Error", "User not logged in.");
          setLoading(false);
          return;
        }

        try {
          const targetDoc = await getDoc(doc(db, "Users", user.uid, "targets", "dietTarget"));
          if (!targetDoc.exists()) return;

          const { targetCalories, goalType } = targetDoc.data();
          setMode(goalType);
          if (!targetCalories || !mode) return;

          const now = new Date();
          const start = new Date(now);
          start.setHours(5, 0, 0, 0);
          if (now.getHours() < 5) start.setDate(start.getDate() - 1);

          const end = new Date(start);
          end.setDate(end.getDate() + 1);

          const dietRef = collection(db, "Users", user.uid, "diet");
          const q = query(
            dietRef,
            where("timestamp", ">=", start),
            where("timestamp", "<", end)
          );

          const snapshot = await getDocs(q);
          let total = 0;
          snapshot.forEach(doc => {
            const data = doc.data();
            const cal = parseFloat(data.calories);
            if (!isNaN(cal)) total += cal;
          });

          const numericTarget = parseFloat(targetCalories);
          const progress = (total / numericTarget) * 100;
          setPercentage(Math.min(progress, 100));
          setRemainingCalories(numericTarget - total);

        } catch (err) {
          console.error("Failed to fetch diet data", err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, [user])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleWrapper}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={styles.title}
        >
          Diet Tracking
        </Animated.Text>
      </View>

      <View style={styles.subtitleWrapper}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={styles.subtitle}
        >
          What did you eat today?
        </Animated.Text>
      </View>

      {loading ? (
        <View style={{ paddingVertical: hp(15.5) }}>
          <ActivityIndicator size="large" color="rgb(146, 136, 136)" />
        </View>
      ) : (
        <>
          <CircularProgress 
            percentage={percentage} 
            size={hp(25)} 
            color="#10B981"
            bgColor="rgb(57, 53, 53)"
          />

          {remainingCalories !== null && (
            <View style={{ alignItems: "center" }}>
              {mode === "deficit" ? (
                <Text
                  style={{
                    fontSize: hp(2.3),
                    fontWeight: "bold",
                    color: remainingCalories < 0 ? "red" : "black",
                    paddingHorizontal: wp(3),
                    textAlign: "center",
                  }}
                >
                  {remainingCalories < 0
                    ? `${Math.abs(remainingCalories)} calories exceeded today.`
                    : `${remainingCalories} remaining calories until target exceeded.`}
                </Text>
              ) : (
                <Text
                  style={{
                    fontSize: hp(2.3),
                    fontWeight: "bold",
                    color: remainingCalories < 0 ? "green" : "black",
                    paddingHorizontal: wp(3),
                    textAlign: "center",
                  }}
                >
                  {remainingCalories < 0
                    ? `${Math.abs(remainingCalories)} extra calories consumed today.`
                    : `${remainingCalories} remaining calories to hit target.`}
                </Text>
              )}
            </View>
          )}
        </>
      )}

      <Animated.View 
        entering={FadeInLeft.delay(300).duration(1000).springify()}
        style={styles.buttonsWrapper}
      >
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => router.push("/(popups)/dietSubmit")}
        >
          <Text style={styles.recordButtonText}>Check/Record calories</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/(popups)/dietHistory")}
        >
          <FontAwesome name="history" size={hp(3.5)} color="white" />
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
        style={styles.changeTargetWrapper}
      >
        <TouchableOpacity
          style={styles.changeTargetButton}
          onPress={() => router.push("/(popups)/dietTarget")}
        >
          <Text style={styles.changeTargetButtonText}>Set a new target!</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  )
}

export default DietTracking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: wp(8),
  },
  titleWrapper: {
  },
  title: {
    textAlign: "center",
    fontSize: hp(5.7),
    fontWeight: "bold",
    color: "rgb(57, 53, 53)",
  },
  subtitleWrapper: {
  },
  subtitle: {
    textAlign: "center",
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "rgb(146, 136, 136)",
  },
  buttonsWrapper: {
    flexDirection: "row",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  recordButton: {
    flex: 4,
    backgroundColor: "#34D399",
    paddingVertical: hp(2),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgb(57, 53, 53)",
    shadowColor: 'black',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 1,
    shadowRadius: wp(3),
    elevation: 4,
  },
  recordButtonText: {
    color: "white",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  historyButton: {
    flex: 1,
    backgroundColor: "#34D399",
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: 'black',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 1,
    shadowRadius: wp(3),
    elevation: 4,
  },
  dividerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#9CA3AF",
  },
  changeTargetWrapper: {
    alignItems: "center",
    paddingTop: hp(1.5),
  },
  changeTargetButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(15),
    borderRadius: 30,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.7) },
    shadowOpacity: 0.15,
    shadowRadius: wp(4),
    elevation: 6,
  },
  changeTargetButtonText: {
    color: "white",
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});
