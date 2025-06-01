import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function PopupsLayout() {
  return (
    <Stack screenOptions={{
      headerTitle: '',
      headerShadowVisible: false,
    }} />
  );
}