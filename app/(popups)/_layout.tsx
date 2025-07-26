import { useContext } from 'react';
import { Stack } from 'expo-router';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from "../../contexts/ThemeContext";

export default function PopupsLayout() {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: -insets.top,
        backgroundColor: isDarkMode ? '#121212' : 'white',
      }}
    >
      <KeyboardProvider>
        <Stack
          screenOptions={{
            headerTitle: '',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: isDarkMode ? '#121212' : 'white',  // <-- set header background here
            },
            headerTintColor: isDarkMode ? 'white' : 'black',     // <-- set header text/icon color
          }}
        />
      </KeyboardProvider>
    </SafeAreaView>
  );
}
