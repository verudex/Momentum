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
  Alert,
  ActivityIndicator,
} from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { googleSignIn, signIn } from "../../utils/signIn_Out";

const Login = () => {
  const { setUser } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !email || !password;

  // Waits for assets to load before showing screen.
  const assetsReady = useAssetPreload([
    require('../../assets/images/MomentumLogo.png'),
  ]);

  const handleGoogleSignIn = async () => {
    const result = await googleSignIn(setUser);
    if (result.success) {
      router.replace("/(tabs)/home");
    } else if (!result.cancelled) {
      Alert.alert("Google Sign-In Failed", "Please try again.");
    }
  };

  const handleLogin = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    await signIn(email, password, setUser);
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
              style={styles.logo}
              source={require("../../assets/images/MomentumLogo.png")}
            />

            <Animated.Text
              entering={FadeInUp.delay(100).duration(500).springify()}
              style={styles.title}
            >
              Sign in to your account
            </Animated.Text>

            <View style={styles.form}>
              <Animated.View entering={FadeInDown.delay(200).duration(1000).springify()}>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  value={email}
                />
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(300).duration(1000).springify()}
                style={styles.inputWrapper}
              >
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  onChangeText={setPassword}
                  value={password}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                </TouchableOpacity>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
                <TouchableOpacity
                  disabled={isInvalid || isLoading}
                  onPress={handleLogin}
                  style={[styles.button, (isInvalid || isLoading) && styles.disabled]}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.buttonText}>Sign in</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>

            <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
              <TouchableOpacity>
                <Text style={styles.forgot}>Forgot password?</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(1000).springify()}
              style={styles.loginRow}
            >
              <Text style={styles.loginText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.loginLink}>Register</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(700).duration(1000).springify()}
              style={styles.dividerWrapper}
            >
              <View style={styles.divider} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.divider} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(800).duration(1000).springify()}
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

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  contentContainer: {
    paddingTop: hp(5),
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
    marginTop: 24,
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
    top: hp(2.3),
  },
  button: {
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
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: hp(2),
  },
  disabled: {
    opacity: 0.5,
  },
  forgot: {
    fontSize: hp(1.5),
    textAlign: "center",
    fontWeight: "600",
    color: "#4F46E5",
    paddingTop: 8,
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
    marginVertical: 20,
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
    color: "#6B7280",
  },
  googleWrapper: {
    alignItems: "center",
    paddingTop: 8,
  },
});
