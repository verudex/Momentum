import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import React from "react";

const Home = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-dark-200 font-bold">Testing</Text>
      <Link href="/workoutTracking">Workout Tracking!</Link>
      <Text className="text-xl mb-6">Welcome to Momentum</Text>

      <Link href="/(auth)/login" asChild>
        <TouchableOpacity className="bg-indigo-600 px-4 py-2 rounded mb-4">
          <Text className="text-white text-base">Login</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity className="bg-gray-600 px-4 py-2 rounded">
          <Text className="text-white text-base">Register</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
