import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const router = useRouter();

  const handleLogout = () => {
    router.replace({
      pathname: "/",
    });
  };

  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      
      <Text className="text-5xl text-dark-200 font-bold mb-6 text-center">Profile</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-indigo-600 px-4 py-2 rounded mb-4"
      >
        <Text className="text-white text-base">Logout</Text>
      </TouchableOpacity>

    </SafeAreaView>
  )
}

export default Profile

const styles = StyleSheet.create({})