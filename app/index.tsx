import React, { useState, useEffect, useContext } from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const Startup = () => {
  const router = useRouter();

    // Configure Google Sign-In webclient Id
    useEffect(() => {
        GoogleSignin.configure({
        webClientId: '12153493344-qbhdurglltd38a6boc6jke2vpnmgtmn0.apps.googleusercontent.com',
      });
    }, []);

  return (
    <ImageBackground
      source={require("../assets/images/PullupsBackground.jpeg")} // replace with your actual image path
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay} />

      <Animated.Image
        entering={FadeInDown.duration(1000).springify()}      
        source={require("../assets/images/CurvedBackground.png")} // your white curve image
        style={styles.curve}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.content}>
        <Animated.Image
          entering={FadeInUp.delay(500).duration(1000).springify()} 
          style={styles.logo}
          source={require("../assets/images/MomentumLogoBlackTransparent.png")}
        />

        <Animated.Text 
          entering={FadeInUp.delay(500).duration(1000).springify()}
          style={styles.title}>
          Join the Momentum.
        </Animated.Text>

        <View style={styles.buttonWrapper}>
          <Animated.View entering={FadeInDown.delay(500).duration(1000).springify()}>
            <TouchableOpacity 
              onPress={() => router.push("/(auth)/register")}
              style={[styles.button, { backgroundColor: 'rgba(10, 132, 255, 1)' }]}
            >
              <Text style={styles.buttonText}>✨ Start now</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(1000).springify()}>
            <TouchableOpacity 
              onPress={() => router.push("/(auth)/login")}
              style={[styles.button, { backgroundColor: 'rgba(44, 44, 46, 1) ' }]}
            >
              <Text style={styles.buttonText}>Log in</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Startup;

const styles = StyleSheet.create({
  bold: {
    fontWeight: '900',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 0,
  },
  curve: {
    position: "absolute",
    bottom: 0,
    width: wp(100),
    height: hp(150),
    zIndex: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: hp(2.5),
  },
  logo: {
    width: wp(70),
    height: hp(25),
    resizeMode: 'contain',
    marginTop: 0,   // push it downward
    marginBottom: 0, // pull content below it closer
  },
  title: {
    fontSize: hp(3.5),
    color: 'rgb(42, 38, 38)',
    fontWeight: 'bold',
    marginBottom: hp(3),
  },
  buttonWrapper: {
    width: wp(85),
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: hp(4),
  },
});