import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';
import { AuthProvider } from '../../contexts/AuthContext';

export default function AuthLayout() {
  return (
    <AuthProvider>
      <StatusBar barStyle="dark-content" />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}