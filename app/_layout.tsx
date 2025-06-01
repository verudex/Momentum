import { Stack } from "expo-router";
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext'; // adjust path as needed


export default function RootLayout() {
  return (
    <AuthProvider>    
      <Stack >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="(auth)"
          options={{
            headerTitle: '',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}