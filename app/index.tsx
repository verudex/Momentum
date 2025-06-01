import React from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const Startup = () => {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/images/PullupsBackground.png")} // replace with your actual image path
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
    width: "100%",
    height: 1200,
    zIndex: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
    marginTop: 100,   // push it downward
    marginBottom: -80, // pull content below it closer
  },
  title: {
    fontSize: 28,
    color: 'rgb(42, 38, 38)',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonWrapper: {
    width: '90%',
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
    fontSize: 30,
  },
});