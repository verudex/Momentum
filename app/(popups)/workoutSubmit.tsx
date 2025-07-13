import React, { useContext, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, Easing } from "react-native-reanimated";
import { AuthContext } from "../../contexts/AuthContext";
import WorkoutOptions from "../../utils/workoutOptions";
import { getFirestore, doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from "../../utils/firebaseConfig";
import { Dropdown } from 'react-native-element-dropdown';

const WorkoutSubmit = () => {
  const { user } = useContext(AuthContext);

  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState({ hours: "", minutes: "", seconds: "" });
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !workoutName;

  const db = getFirestore(app);

  const handleSubmit = async () => {
    console.log("Submit button clicked");
    setIsLoading(true);

    if (user == null) {
      Alert.alert("Error", "User not logged in.");
      setIsLoading(false);
      return;
    }
    if (!WorkoutOptions.includes(workoutName)) {
      Alert.alert("Invalid Input", "Invalid Workout Name!");
      setIsLoading(false);
      return;
    }

    const now = new Date();
    if (now.getHours() < 5) now.setDate(now.getDate() - 1);
    const todayKey = now.toDateString();

    const metaRef = doc(db, "Users", user.uid, "streak", "tracking");
    const metaSnap = await getDoc(metaRef);

    let newStreak = 1;

    if (metaSnap.exists()) {
      const data = metaSnap.data();
      const lastWorkoutDate = data.lastWorkoutDate?.seconds 
        ? new Date(data.lastWorkoutDate.seconds * 1000).toDateString() 
        : null;
      const currentStreak = data.workoutStreak ?? 0;

      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastWorkoutDate === todayKey) {
        newStreak = currentStreak; // already logged today
      } else if (lastWorkoutDate === yesterday.toDateString()) {
        newStreak = currentStreak + 1; // continued streak
      }
    }

    // Add workout record
    await addDoc(
      collection(db, "Users", user.uid, "workouts"),
      {
        name: workoutName,
        duration,
        sets,
        reps,
        weight,
        timestamp: serverTimestamp(),
      }
    );

    // Update streak object
    await setDoc(metaRef, {
      workoutStreak: newStreak,
      lastWorkoutDate: serverTimestamp(),
    }, { merge: true });

    console.log("Workout recorded & streak updated!");

    setWorkoutName("");
    setDuration({ hours: "", minutes: "", seconds: "" });
    setReps("");
    setSets("");
    setWeight("");
    setIsLoading(false);

    Alert.alert("Workout Recorded!", "Well done!");
  };

  const isNumber = (text: string) => /^\d+$/.test(text);
  const isDecimal = (text: string) => /^\d+(\.\d{0,1})?$/.test(text);

  return (
      <KeyboardAwareScrollView
        style={{ backgroundColor: "white" }}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Text 
          adjustsFontSizeToFit
          numberOfLines={1}
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

        <Animated.View
          entering={FadeInLeft.delay(300).duration(500).springify()}
          style={styles.workoutNameInput}
        >
          <Dropdown
            style={styles.input}
            containerStyle={{
              paddingVertical: hp(0.5),
              paddingHorizontal: wp(1),
              borderRadius: 30,
              elevation: 2,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.41
            }}
            placeholderStyle={{ fontSize: hp(2.5), color: "rgba(109, 104, 104, 1)" }}
            selectedTextStyle={{ fontSize: hp(2.5) }}
            inputSearchStyle={{
              height: hp(5),
              fontSize: hp(2),
              borderRadius: 30,
            }}
            itemTextStyle={{
              fontSize: hp(2)
            }}
            data={WorkoutOptions.map(item => ({ label: item, value: item }))}
            search
            maxHeight={hp(25)}
            labelField="label"
            valueField="value"
            placeholder="Workout Name*"
            searchPlaceholder="Search workouts..."
            value={workoutName}
            onChange={item => {
              setWorkoutName(item.value);
            }}
          />
        </Animated.View>

        <View style={styles.durationRow}>
          <Animated.View 
            entering={FadeInLeft.delay(400).duration(500).springify()} 
            style={styles.durationBox}
          >
            <TextInput
              style={styles.durationInput}
              placeholder="Hours"
              keyboardType="number-pad"
              value={duration.hours}
              onChangeText={(text) => {
                if (text === "" || isNumber(text)) setDuration({ ...duration, hours: text });
              }}
            />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(500).duration(500).springify()} 
            style={[styles.durationBox, { marginHorizontal: 4 }]}
          >
            <TextInput
              style={styles.durationInput}
              placeholder="Mins"
              keyboardType="number-pad"
              value={duration.minutes}
              onChangeText={(text) => {
                if (text === "" || isNumber(text)) setDuration({ ...duration, minutes: text });
              }}
            />
          </Animated.View>

          <Animated.View 
            entering={FadeInLeft.delay(600).duration(500).springify()} 
            style={styles.durationBox}
          >
            <TextInput
              style={styles.durationInput}
              placeholder="Sec"
              keyboardType="number-pad"
              value={duration.seconds}
              onChangeText={(text) => {
                if (text === "" || isNumber(text)) setDuration({ ...duration, seconds: text });
              }}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInLeft.delay(700).duration(500).springify()}>
          <TextInput
            style={styles.input}
            placeholder="Number of Sets"
            keyboardType="number-pad"
            value={sets}
            onChangeText={(text) => {
              if (text === "" || isNumber(text)) setSets(text);
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInLeft.delay(800).duration(500).springify()}>
          <TextInput
            style={styles.input}
            placeholder="Number of Reps"
            keyboardType="number-pad"
            value={reps}
            onChangeText={(text) => {
              if (text === "" || isNumber(text)) setReps(text);
            }}
          />
        </Animated.View>

        <Animated.View entering={FadeInLeft.delay(900).duration(500).springify()}>
          <View style={styles.weightRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Weight Lifted"
              keyboardType="decimal-pad"
              value={weight}
              onChangeText={(text) => {
                if (text === "" || isDecimal(text)) setWeight(text);
              }}
            />
            <Text style={styles.kgLabel}>kg</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInLeft.delay(1000).duration(1000).springify()}>
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
      </KeyboardAwareScrollView>
  );
};

export default WorkoutSubmit;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: wp(7),
    backgroundColor: "white",
  },
  title: {
    width: wp(90),
    fontSize: hp(5.5),
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    fontSize: hp(3),
    color: "#888",
    marginBottom: hp(1),
  },
  input: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.7),
    borderRadius: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: hp(3),
    fontSize: hp(2.5),
  },
  workoutNameInput: {
    marginTop: hp(2),
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(3),
    gap: wp(2.5),
  },
  durationBox: {
    flex: 1,
  },
  durationInput: {
    flex: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2.5),
    borderRadius: 30,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: hp(2.5),
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hp(0.5),
  },
  kgLabel: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    marginHorizontal: wp(7),
    marginBottom: hp(4),
    color: "#444",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(2.7),
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