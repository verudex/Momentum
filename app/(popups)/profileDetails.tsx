import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";


const profileDetails = () => {
  return (
    <View>
      <Animated.Text entering={FadeInUp.duration(500).springify()}>profileDetails</Animated.Text>
    </View>
  )
}

export default profileDetails

const styles = StyleSheet.create({})