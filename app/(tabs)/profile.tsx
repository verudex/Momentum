import { useContext, useEffect, useState, } from 'react';
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import auth from '@react-native-firebase/auth';
import { signOut } from "../../utils/signIn_Out";


const Profile = () => {
  useDisableBack();
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(setUser); // From utils
    setIsLoggingOut(false);
    router.replace("/");
    setUser(null);
  };


  return (
    <SafeAreaView style={[styles.container, {marginTop: -useHeaderHeight() / 2}]}>
      
      <Text className="text-5xl text-dark-200 font-bold mb-6 text-center">Profile</Text>

      {user?.email && (
        <Text className="text-lg text-gray-600 mb-8">
          Logged in as: {user.email}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleLogout}
        className={`bg-indigo-600 px-4 py-2 rounded mb-4 ${isLoggingOut ? 'opacity-50' : ''}`}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-base">Logout</Text>
        )}
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default Profile

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