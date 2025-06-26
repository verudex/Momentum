import React, { useContext, useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { AuthContext } from "../../contexts/AuthContext";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { app } from "../../utils/firebaseConfig";

const DietSubmit = () => {
	const { user } = useContext(AuthContext);

  const [target, setTarget] = useState("");
  const [goalType, setGoalType] = useState<'deficit' | 'surplus'>('deficit');
	const [isLoading, setIsLoading] = useState(false);

	const isInvalid = !target;

	const db = getFirestore(app);

  const updateTarget = async () => {
    console.log("Submit button clicked");
    setIsLoading(true);
    if (user == null) {
      Alert.alert("Error", "User not logged in.");
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, "Users", user.uid, "targets", "dietTarget");
    await setDoc(docRef, {
      targetCalories: target,
      goalType: goalType, // "deficit" or "surplus"
      updatedAt: serverTimestamp()
    }, { merge: true });

    console.log("Successfully updated!");
    setTarget("");
    setIsLoading(false);
    Alert.alert("Calorie Target Updated!", "Good luck!")
  };

  const isNumber = (text: string) => /^\d+$/.test(text);

	return (
		<KeyboardAwareScrollView
			style={{ backgroundColor: "white" }}
			contentContainerStyle={styles.contentContainer}
			keyboardShouldPersistTaps="handled"
		>
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
					Set a new target!
				</Animated.Text>
			</View>

			<View style={styles.inputWrapper}>
        <Animated.View entering={FadeInLeft.delay(300).duration(500).springify()}>
          <TextInput
            style={styles.input}
            placeholder="Target Calories"
            keyboardType="number-pad"
            value={target}
            onChangeText={(text) => {
              if (text === "" || isNumber(text)) setTarget(text);
            }}
          />
        </Animated.View>
			</View>

      <Animated.View 
        entering={FadeInLeft.delay(400).duration(500).springify()}
        style={styles.toggleWrapper}
      >
        <TouchableOpacity
          style={[
            styles.deficitButton,
            goalType === 'deficit' && styles.activeButton
          ]}
          onPress={() => setGoalType('deficit')}
        >
          <Text style={[
            styles.toggleText,
            goalType === 'deficit' && styles.activeText
          ]}>
            Deficit
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.surplusButton,
            goalType === 'surplus' && styles.activeButton
          ]}
          onPress={() => setGoalType('surplus')}
        >
          <Text style={[
            styles.toggleText,
            goalType === 'surplus' && styles.activeText
          ]}>
            Surplus
          </Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInLeft.delay(500).duration(500).springify()}>
        <TouchableOpacity
          disabled={isInvalid || isLoading}
          onPress={() => updateTarget()}
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
	)
}

export default DietSubmit;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		paddingHorizontal: wp(8),
	},
	contentContainer: {
		backgroundColor: "white",
		paddingTop: hp(10),
		paddingHorizontal: wp(8),
	},
	innerWrapper: {
		width: wp(85),
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
	subtitleWrapper: {
	},
	subtitle: {
		textAlign: "center",
		fontSize: hp(2.5),
		fontWeight: "bold",
		color: "rgb(146, 136, 136)",
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
	},
  toggleWrapper: {
    flexDirection: 'row',
    marginVertical: hp(2.5),
    paddingHorizontal: wp(3),
  },
  deficitButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  surplusButton: {
    flex: 1,
    paddingVertical: hp(1.5),
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#7C3AED',
  },
  toggleText: {
    fontSize: hp(2),
    fontWeight: 'bold',
    color: '#6B7280',
  },
  activeText: {
    color: 'white',
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
});
