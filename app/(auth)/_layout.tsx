import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../../contexts/AuthContext';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AuthLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ 
      flex: 1,
      paddingTop: -insets.top,
      backgroundColor: 'white'
    }}>
      <AuthProvider>
        <KeyboardProvider>
          <StatusBar barStyle="dark-content" />
          <Stack screenOptions={{ headerShown: false }} />
        </KeyboardProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}