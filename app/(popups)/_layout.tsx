import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PopupsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ 
      flex: 1,
      paddingTop: -insets.top,
      backgroundColor: 'white'
    }}>
      <KeyboardProvider>
        <Stack screenOptions={{
          headerTitle: '',
          headerShadowVisible: false,
        }} />
      </KeyboardProvider>
    </SafeAreaView>
  );
}