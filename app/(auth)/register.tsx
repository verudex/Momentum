import React, { useState } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

const Register = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const isInvalid = !username || !email || !password || !confirmPassword || password !== confirmPassword;

  return (
    <SafeAreaView style={[styles.container, { marginTop: -useHeaderHeight() / 2 }]}> 
      <View style={styles.innerWrapper}>
        <Animated.Image 
          entering={FadeInUp.duration(500).springify()}
          style={styles.logo} source={require("../../assets/images/MomentumLogo.png")} 
        />

        <Animated.Text 
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={styles.title}
        >
          Register a new account
        </Animated.Text>

        <View style={styles.form}>
          <Animated.View 
            entering={FadeInDown.delay(400).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Email"
              autoCapitalize="none"
              autoComplete="email"
              onChangeText={(email) => {
                setEmail(email);
                setEmailError(email.includes("@") ? "" : "Please enter a valid email.");
              }}
            />
            {emailError ? <Text style={styles.error}>{emailError}</Text> : null}
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.delay(600).duration(1000).springify()}
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
            entering={FadeInDown.delay(800).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onChangeText={(pw) => {
                setPassword(pw);
                setPasswordError(confirmPassword && pw !== confirmPassword ? "Passwords do not match." : "");
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
            entering={FadeInDown.delay(1000).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              onChangeText={(pw) => {
                setConfirmPassword(pw);
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

          <Animated.View entering={FadeInDown.delay(1200).duration(1000).springify()}>
            <TouchableOpacity
              disabled={isInvalid}
              onPress={() => router.replace("/(tabs)/home")}
              style={[styles.registerButton, isInvalid && styles.disabled]}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View 
          entering={FadeInDown.delay(1400).duration(1000).springify()}
          style={styles.loginRow}
        >
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}> 
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1600).duration(1000).springify()}
          style={styles.dividerWrapper}
        >
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1800).duration(1000).springify()}
          style={styles.googleWrapper}
        >
          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Sign up with Google</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 24,
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
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: "white",
    fontSize: 16,
    color: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 27,
    transform: [{ translateY: -10 }],
  },
  error: {
    color: "#ef4444",
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
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
    fontSize: 16,
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
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#D1D5DB",
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
  googleButton: {
    width: "100%",
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
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
