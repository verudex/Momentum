import React, { useContext } from "react";
import { Text, View, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { FontAwesome6, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { ThemeContext } from "../../contexts/ThemeContext";  // Adjust path as needed

const TabIcon = ({ focused, iconName, label, IconPack, isDarkMode }) => {
  const activeColor = isDarkMode ? '#7C3AED' : 'black';
  const inactiveColor = isDarkMode ? '#888' : 'gray';

  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
    }}>
      <IconPack
        name={iconName}
        size={24}
        color={focused ? activeColor : inactiveColor}
      />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          fontSize: 12,
          color: focused ? activeColor : inactiveColor,
          marginTop: 4,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const _layout = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : 'white' }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#121212' : 'white',
            height: hp(5) + (insets.bottom || 0),
            paddingTop: hp(2),
            borderTopWidth: 0.5,
            borderTopColor: isDarkMode ? '#333' : '#ccc',
            elevation: 0,
            shadowOpacity: 0,
            shadowOffset: { height: 0 },
            shadowRadius: 0,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="home" label="Home" IconPack={Ionicons} isDarkMode={isDarkMode} />
            ),
          }}
        />
        <Tabs.Screen
          name="workoutTracking"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="dumbbell" label="Workout" IconPack={FontAwesome6} isDarkMode={isDarkMode} />
            ),
          }}
        />
        <Tabs.Screen
          name="dietTracking"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="fast-food" label="Diet" IconPack={Ionicons} isDarkMode={isDarkMode} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="user" label="Profile" IconPack={AntDesign} isDarkMode={isDarkMode} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default _layout;
