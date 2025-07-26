import React, { useContext } from "react";
import { AuthProvider, AuthContext } from "../contexts/AuthContext";
import { Stack } from "expo-router";
import { View } from "react-native";
import './globals.css';
import { ThemeProvider } from "../contexts/ThemeContext";

function RootStack() {
  const { initializing } = useContext(AuthContext);

  if (initializing) { 
    return (
      <View style={{ flex: 1, backgroundColor: "white", justifyContent: "center", alignItems: "center" }} />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
        }} 
      />
      <Stack.Screen
        name="(popups)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
          <RootStack />
      </ThemeProvider>
    </AuthProvider>
  );
}
