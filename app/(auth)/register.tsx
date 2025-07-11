import React, { useState, useContext } from "react";
import { useAssetPreload } from "../../hooks/useAssetPreload";
import { AuthContext } from "../../contexts/AuthContext";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { googleSignIn, emailRegister } from "../../utils/signIn_Out";

const Register = () => {
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isInvalid = !username || !email || !password || !confirmPassword;

  const [isLoading, setIsLoading] = useState(false);

  // Waits for assets to load before showing screen.
  const assetsReady = useAssetPreload([
    require('../../assets/images/MomentumLogo.png'),
  ]);

  // Google Sign-In Logic
  const handleGoogleSignIn = async () => {
    const result = await googleSignIn(setUser);

    if (result.success) {
      router.replace("/(tabs)/home");
    } else if (!result.cancelled) {
      alert("Google sign-in failed. Please try again.");
    }
  };

  const handleEmailRegister = async () => {
    setEmailError("");
    setPasswordError("");

    if (!email.includes("@")) {
      setEmailError("Please enter a valid email");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setIsLoading(true);
    await emailRegister(email, password, setUser);
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {!assetsReady ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <View style={styles.innerWrapper}>
            <Animated.Image 
              entering={FadeInUp.duration(500).springify()}
              style={styles.logo} source={require("../../assets/images/MomentumLogo.png")} 
            />

            <Animated.Text 
              entering={FadeInUp.delay(100).duration(500).springify()}
              style={styles.title}
            >
              Register a new account
            </Animated.Text>

            <View style={styles.form}>
              <Animated.View 
                entering={FadeInDown.delay(200).duration(1000).springify()}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  autoComplete="email"
                  onChangeText={(email) => {
                    setEmail(email);
                    //Clear error when user starts typing again
                    if (emailError) setEmailError("")              
                    }}
                  value={email}
                />
                {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(300).duration(1000).springify()}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  autoCapitalize="none"
                  onChangeText={(name) => setUsername(name)}
                />
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(400).duration(1000).springify()}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onChangeText={(pw) => {
                    setPassword(pw);
                    if (passwordError) setPasswordError(""); // Clear error when typing
                    if (confirmPassword) {
                      setPasswordError(pw !== confirmPassword ? "Passwords do not match." : "");
                    }
                  }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View 
                entering={FadeInDown.delay(500).duration(1000).springify()}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onChangeText={(pw) => {
                  setConfirmPassword(pw);
                  if (passwordError) setPasswordError(""); // Clear error when typing
                  setPasswordError(password && pw !== password ? "Passwords do not match." : "");
                }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
                {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(600).duration(1000).springify()}>
                <TouchableOpacity
                  disabled={isInvalid || isLoading}
                  onPress={handleEmailRegister}
                  style={[styles.registerButton, (isInvalid || isLoading) && styles.disabled]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.registerButtonText}>Register</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Animated.View 
              entering={FadeInDown.delay(700).duration(1000).springify()}
              style={styles.loginRow}
            >
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}> 
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(800).duration(1000).springify()}
              style={styles.dividerWrapper}
            >
              <View style={styles.divider} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.divider} />
            </Animated.View>

            <Animated.View 
              entering={FadeInDown.delay(900).duration(1000).springify()}
              style={styles.googleWrapper}
            >
              <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={handleGoogleSignIn}
              />
            </Animated.View>
          </View>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  contentContainer: {
    paddingTop: hp(3),
    paddingHorizontal: wp(7),
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 16,
  },
  form: {
    marginTop: 20,
    gap: 20,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    paddingHorizontal: wp(4.5),
    paddingVertical: hp(2),
    backgroundColor: "white",
    fontSize: hp(2),
    color: "#111827",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  eyeIcon: {
    position: "absolute",
    right: wp(5),
    top: hp(3.3),
    transform: [{ translateY: -10 }],
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: hp(2),
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registerButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: hp(2),
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
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
    marginTop: hp(0.6),
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: "#9CA3AF",
  },
  googleWrapper: {
    alignItems: "center",
    paddingTop: 2,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#4F46E5",
    paddingVertical: 10,
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
