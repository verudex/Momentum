import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'react-native';
import { FontAwesome6, Ionicons, AntDesign } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

const TabIcon = ({ focused, iconName, label, IconPack }) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 80,
    }}>
      <IconPack
        name={iconName}
        size={24}
        color={focused ? 'black' : 'gray'}
      />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          fontSize: 12,
          color: focused ? 'black' : 'gray',
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" />
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: 'white',
            height: hp(5) + (insets.bottom || 0),
            paddingTop: hp(2),
            borderTopWidth: 0.5,
            borderTopColor: '#ccc',
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
              <TabIcon focused={focused} iconName="home" label="Home" IconPack={Ionicons} />
            ),
          }}
        />
        <Tabs.Screen
          name="workoutTracking"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="dumbbell" label="Workout" IconPack={FontAwesome6} />
            ),
          }}
        />
        <Tabs.Screen
          name="dietTracking"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="fast-food" label="Diet" IconPack={Ionicons} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconName="user" label="Profile" IconPack={AntDesign} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
};

export default _layout;