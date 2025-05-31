import React from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDisableBack } from "../../hooks/useDisableBack";

const WorkoutTracking = () => {
  useDisableBack();
  
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      
      <Text className="text-5xl text-dark-200 font-bold mb-6 text-center">Workout Tracking</Text>

    </SafeAreaView>
  )
}

export default WorkoutTracking

const styles = StyleSheet.create({})