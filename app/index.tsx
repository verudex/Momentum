import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

const Home = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ marginTop: -useHeaderHeight() / 2 }} className="flex-1 justify-center items-center">
      <Text className="text-5xl text-dark-200 font-bold mb-6 text-center">Welcome to Momentum</Text>

      <TouchableOpacity 
        onPress={() => router.push("/(auth)/login")}
        className="bg-indigo-600 px-4 py-2 rounded mb-4"
      >
        <Text className="text-white text-base">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => router.push("/(auth)/register")}
        className="bg-gray-600 px-4 py-2 rounded"
      >
        <Text className="text-white text-base">Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({});