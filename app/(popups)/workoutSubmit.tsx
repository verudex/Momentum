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
  KeyboardAvoidingView, 
  Platform, 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, Easing } from "react-native-reanimated";
import { AuthContext } from "../../contexts/AuthContext";
import WorkoutOptions from "../../utils/workoutOptions";
import { getFirestore, doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from "../../utils/firebaseConfig";

const WorkoutSubmit = () => {
  const { user } = useContext(AuthContext);

  const [workoutName, setWorkoutName] = useState("");
  const [filteredWorkouts, setFilteredWorkouts] = useState(WorkoutOptions);
  const [inputLayout, setInputLayout] = useState({ y: 0, height: 0 });
  const [duration, setDuration] = useState({ hours: "", minutes: "", seconds: "" });
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
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
      Alert.alert("Invalid Input", "Invalid Workout Name!")
      setIsLoading(false);
      return;
    }
    await addDoc(
      collection(db, "Users", user.uid, "workouts"), // nested path
      {
        name: workoutName,
        duration: duration,
        sets: sets,
        reps: reps,
        weight: weight,
        timestamp: serverTimestamp(),
      }
    );
    console.log("Successfully written!");
    setWorkoutName("");
    setDuration({ hours: "", minutes: "", seconds: "" });
    setReps("");
    setSets("");
    setWeight("");
    setIsLoading(false);
    Alert.alert("Workout Recorded!", "Well done!")
  };

  const handleWorkoutInput = (text: string) => {
    setWorkoutName(text);
    setShowDropdown(true);
    setFilteredWorkouts(WorkoutOptions.filter(item => item.toLowerCase().includes(text.toLowerCase())));
  };

  const isNumber = (text: string) => /^\d+$/.test(text);
  const isDecimal = (text: string) => /^\d+(\.\d{0,1})?$/.test(text);
  
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={100} // adjust if needed
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <SafeAreaView style={[styles.container, { marginTop: -useHeaderHeight() * 3 / 4 }]}>
          <View>
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

            <Animated.View
              entering={FadeInLeft.delay(300).duration(500).springify()} 
              style={styles.workoutNameInput}
              onLayout={(event) => {
                const { y, height } = event.nativeEvent.layout;
                setInputLayout({ y, height });
              }}
            >
              <TextInput
                style={styles.input}
                placeholder="Workout Name"
                value={workoutName}
                onChangeText={handleWorkoutInput}
              />
            </Animated.View>

            {showDropdown && workoutName.length > 0 && filteredWorkouts.length > 0 && (
              <Animated.View 
                entering={FadeInUp.duration(100).easing(Easing.out(Easing.ease))}
                style={[styles.dropdownWrapper, { top: inputLayout.y + inputLayout.height * 2 / 3 }]}
              >
                <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                  {filteredWorkouts.map((item) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setWorkoutName(item);
                        setFilteredWorkouts([]);
                        setShowDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItem}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

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
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default WorkoutSubmit;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  scrollWrapper: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "#333",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 22,
    color: "#888",
    marginBottom: 20,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 22,
    fontSize: 18,
  },
  dropdownContainer: {
    zIndex: 10,
  },
  dropdownWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 150,
    zIndex: 100,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 150,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    fontSize: 18,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  workoutNameInput: {
    marginTop: 10,
  },
  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 8,
  },
  durationBox: {
    flex: 1,
  },
  durationInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: 18,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  kgLabel: {
    fontSize: 18,
    fontWeight: 600,
    marginHorizontal: 26,
    marginBottom: 25,
    color: "#444",
  },
  submitButton: {
    backgroundColor: "#7C3AED",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});