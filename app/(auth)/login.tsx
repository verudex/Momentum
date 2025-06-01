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
  Alert,
  ActivityIndicator
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import auth from '@react-native-firebase/auth';

const Login = () => {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isInvalid = !email || !password;

  // If email is invalid
  const handleLogin = async () => {
    if (!email.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
  }

  setIsLoading(true);
      try {
      await auth().signInWithEmailAndPassword(email, password);
      console.log("test");
      // Successful login - AuthContext will handle redirection
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      switch (error.code) {
        case 'auth/invalid-email':
          Alert.alert("Invalid Email", "The email address is badly formatted");
          break;
        case 'auth/user-not-found':
          Alert.alert("Account Not Found", "No user found with this email");
          break;
        case 'auth/wrong-password':
          Alert.alert("Wrong Password", "Incorrect password for this account");
          break;
        case 'auth/too-many-requests':
          Alert.alert("Access Blocked", "Too many failed attempts. Try again later or reset your password");
          break;
        default:
          Alert.alert("Login Failed", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          Sign in to your account
        </Animated.Text>

        <View style={styles.form}>
          <Animated.View entering={FadeInDown.delay(400).duration(1000).springify()}>
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
            entering={FadeInDown.delay(600).duration(1000).springify()}
            style={styles.inputWrapper}
          >
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              onChangeText={(pw) => setPassword(pw)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(800).duration(1000).springify()}>
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

        <Animated.View entering={FadeInDown.delay(1000).duration(1000).springify()}>
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1200).duration(1000).springify()} 
          style={styles.loginRow}
        >
          <Text style={styles.loginText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}> 
            <Text style={styles.loginLink}>Register</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1400).duration(1000).springify()}
          style={styles.dividerWrapper}
        >
          <View style={styles.divider} />
          <Text style={styles.orText}>or</Text>
          <View style={styles.divider} />
        </Animated.View>

        <Animated.View 
          entering={FadeInDown.delay(1600).duration(1000).springify()} 
          style={styles.googleWrapper}
        >
          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

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
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 4,
  },
  passwordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  forgot: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "600",
    color: "#4F46E5",
    paddingTop: 8,
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 18,
  },
  button: {
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
  buttonText: {
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

export default Login;