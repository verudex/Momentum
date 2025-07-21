import React, { useContext, useState } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { KeyboardAwareScrollView, KeyboardProvider } from "react-native-keyboard-controller";
import { AuthContext } from "../../contexts/AuthContext";
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { getFirestore, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { app } from "../../utils/firebaseConfig";
// import { API_BASE_URL } from "@env";

const DietSubmit = () => {
	const { user } = useContext(AuthContext);

	const [foodName, setFoodName] = useState("");
	const [foodAmount, setFoodAmount] = useState("");
	const [requestType, setRequestType] = useState("check");
	const [isLoading, setIsLoading] = useState(false);

	const isInvalid = !foodName || !foodAmount;

	const db = getFirestore(app);

	const handleRequest = async () => {
		console.log("Submit button clicked");
		setIsLoading(true);
		if (user == null) {
			Alert.alert("Error", "User not logged in.");
			setIsLoading(false);
			return;
		}

		try {
			const API_BASE_URL = "https://momentum-mbw7.onrender.com";

			const response = await fetch(`${API_BASE_URL}/api/calculate/calories`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ input: foodAmount + " " + foodName }),
			});

			const data = await response.json();
			if (data.result) {
			const cleanResult = String(data.result).replace(/\s+/g, ' ').trim();
			console.log("Calories estimated:", cleanResult);

			if (requestType === 'check') {
				Alert.alert("Estimated calories: ", `${cleanResult} calories`)
				console.log("Successfully checked!")
			} else {
				Alert.alert("Estimated calories consumed: ", `${cleanResult} calories`)
				await addDoc(
				collection(db, "Users", user.uid, "diet"),
				{
					name: foodName,
					amount: foodAmount,
					calories: cleanResult,
					timestamp: serverTimestamp(),
				}
				);
				console.log("Successfully recorded!");
			}
			} else {
			console.log("No result returned");
			}
		} catch (error) {
			console.error("Error calling backend:", error);
		} finally {
			setFoodName("");
			setFoodAmount("");
			setIsLoading(false);
		}
	};

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
					What did you eat today?
				</Animated.Text>
			</View>

			<View style={styles.inputWrapper}>
				<Animated.View entering={FadeInLeft.delay(300).duration(500).springify()}>
					<TextInput
						style={styles.input}
						placeholder="Name of Food/Meal*"
						value={foodName}
						onChangeText={(food) => setFoodName(food)}
					/>
				</Animated.View>

				<Animated.View entering={FadeInLeft.delay(400).duration(500).springify()}>
					<TextInput
						style={styles.input}
						placeholder="Amount/Volume*"
						value={foodAmount}
						onChangeText={(amount) => setFoodAmount(amount)}
					/>
				</Animated.View>
			</View>

			<Animated.View 
				entering={FadeInLeft.delay(500).duration(500).springify()}
				style={styles.toggleWrapper}
			>
				<TouchableOpacity
				style={[
					styles.checkButton,
					requestType === 'check' && { backgroundColor: '#10B981' }
				]}
				onPress={() => setRequestType('check')}
				>
				<Text style={[
					styles.toggleText,
					requestType === 'check' && styles.activeText
				]}>
					Check
				</Text>
				</TouchableOpacity>

				<TouchableOpacity
				style={[
					styles.recordButton,
					requestType === 'record' && { backgroundColor: '#7C3AED' }
				]}
				onPress={() => setRequestType('record')}
				>
				<Text style={[
					styles.toggleText,
					requestType === 'record' && styles.activeText
				]}>
					Record
				</Text>
				</TouchableOpacity>
			</Animated.View>

			<Animated.View entering={FadeInLeft.delay(600).duration(500).springify()}>
				<TouchableOpacity
				disabled={isInvalid || isLoading}
				onPress={() => handleRequest()}
				style={[
					styles.submitButton,
					requestType === 'check' ? { backgroundColor: '#10B981' } : { backgroundColor: '#7C3AED' },
					(isInvalid || isLoading) && styles.disabled
				]}
				>
					{isLoading ? (
						<ActivityIndicator color="white" />
					) : (
						<Text style={styles.submitButtonText}>
							{requestType === 'check' ? 'Check' : 'Record'}
						</Text>
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
		marginVertical: hp(3),
		gap: hp(2),
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
		marginBottom: hp(2.5),
		paddingHorizontal: wp(3),
	},
	checkButton: {
		flex: 1,
		paddingVertical: hp(1.5),
		borderTopLeftRadius: 30,
		borderBottomLeftRadius: 30,
		backgroundColor: '#E5E7EB',
		alignItems: 'center',
	},
	recordButton: {
		flex: 1,
		paddingVertical: hp(1.5),
		borderTopRightRadius: 30,
		borderBottomRightRadius: 30,
		backgroundColor: '#E5E7EB',
		alignItems: 'center',
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
		fontSize: hp(3),
		fontWeight: "bold",
	},
	disabled: {
		opacity: 0.5,
	},
});
