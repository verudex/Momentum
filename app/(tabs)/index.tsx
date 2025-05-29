import { StyleSheet, Text, View } from 'react-native'
import {Link} from "expo-router";
import React from 'react'

const Home = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-5xl text-dark-200 font-bold">Testing</Text>
      <Link href="/workoutTracking">Workout Tracking!</Link>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})