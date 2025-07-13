import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../../contexts/AuthContext';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <AuthProvider>
      <KeyboardProvider>
        <Stack>
          <Stack.Screen name="startup" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{
              headerTitle: '',
              headerShadowVisible: false,
            }}
          />
          <Stack.Screen 
            name="register" 
            options={{ 
              headerTitle: '',
              headerShadowVisible: false,
            }} 
          />
        </Stack>
      </KeyboardProvider>
    </AuthProvider>
  );
}