import React from "react";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { StyleSheet, Text, View, TouchableOpacity, ImageBackground, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const Startup = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView style={{ 
      flex: 1,
      paddingTop: -insets.top,
      backgroundColor: 'black'
    }}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/images/PullupsBackground.jpeg")} // replace with your actual image path
        style={styles.background}
        resizeMode="cover"
      >
        <StatusBar barStyle="light-content" />
        <View style={styles.overlay} />

        <SafeAreaView style={styles.container}>
          <Animated.Image
            entering={FadeInDown.duration(1000).springify()}      
            source={require("../../assets/images/CurvedBackground.png")} // your white curve image
            style={styles.curve}
          />

          <View style={styles.contentWrapper}>
            <View style={styles.logoWrapper}>
              <Animated.Image
                entering={FadeInUp.delay(500).duration(1000).springify()} 
                style={styles.logo}
                source={require("../../assets/images/MomentumLogoBlackTransparent.png")}
              />
            </View>

            <View style={styles.subtitleWrapper}>
              <Animated.Text 
                entering={FadeInUp.delay(500).duration(1000).springify()}
                style={styles.subTitle}>
                Join the Momentum.
              </Animated.Text>
            </View>

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
          </View>
        </SafeAreaView>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default Startup;

const styles = StyleSheet.create({
  bold: {
    fontWeight: '900',
  },
  background: {
    flex: 1,
    justifyContent: 'flex-end',
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
    height: "300%",
  },
  container: {
    height: hp(50),
  },
  contentWrapper: {
    flex: 1,
    alignItems: "center",
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: wp(70),
    height: hp(25),
    marginTop: 0,   // push it downward
    marginBottom: 0, // pull content below it closer
    resizeMode: "contain",
  },
  subtitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: "4%",
  },
  subTitle: {
    fontSize: hp(3.2),
    color: 'rgb(42, 38, 38)',
    fontWeight: 'bold',
    textAlign: "center",
  },
  buttonWrapper: {
    flex: 2,
    width: wp(85),
    gap: hp(2),
  },
  button: {
    paddingVertical: "4%",
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: hp(3.8),
  },
});