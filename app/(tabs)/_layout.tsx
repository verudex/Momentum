import { Text, View } from 'react-native';
import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons, AntDesign } from '@expo/vector-icons';

const TabIcon = ({ focused, iconName, label, IconPack }) => {
  return (
    <View style={{ 
      alignItems: 'center',
      justifyContent: 'center',
      width: 80, // Fixed width for each tab
    }}>
      <IconPack 
        name={iconName} 
        size={24}
        color={focused ? 'black' : 'gray'}
      />
      <Text 
        numberOfLines={1} // Prevent text wrapping
        ellipsizeMode="tail" // Add "..." if text is too long
        style={{
          fontSize: 12,
          color: focused ? 'black' : 'gray',
          marginTop: 4,
          width: '100%', // Take full available width
          textAlign: 'center', // Center text
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,  // Hide default labels if using custom ones
        tabBarStyle: {
          height: 80,  // Increased height for better icon+text display
        },
      }}
    >
        <Tabs.Screen
            name="index"
            options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                        focused={focused} 
                        iconName="home" 
                        label="Home" 
                        IconPack={Ionicons}  // Pass the component, not string
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="workoutTracking"
            options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                        focused={focused} 
                        iconName="sports-martial-arts"  // Correct icon name
                        label="Workout" 
                        IconPack={MaterialIcons}  // Pass the component
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="dietTracking"
            options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                        focused={focused} 
                        iconName="fast-food"  // Correct icon name
                        label="Diet" 
                        IconPack={Ionicons}
                    />
                ),
            }}
        />
        <Tabs.Screen
            name="profile"
            options={{
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <TabIcon 
                        focused={focused} 
                        iconName="user"  // More appropriate profile icon
                        label="Profile" 
                        IconPack={AntDesign}
                    />
                ),
            }}
        />
    </Tabs>
  );
};

export default _layout;