import { useContext, useEffect, useState } from 'react';
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDisableBack } from "../../hooks/useDisableBack";
import auth from '@react-native-firebase/auth';

const Profile = () => {
  useDisableBack();
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await auth().signOut();
      Alert.alert("Success", "You have been logged out successfully");
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    router.replace("/");
    return null;
  }

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      
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

const styles = StyleSheet.create({})