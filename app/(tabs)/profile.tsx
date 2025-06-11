import { useContext, useEffect, useState, } from 'react';
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { 
  StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Image 
        } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import auth from '@react-native-firebase/auth';
import { signOut } from "../../utils/signIn_Out";


const Profile = () => {
  useDisableBack();
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await signOut(setUser); // From utils
    setIsLoggingOut(false);
    router.replace("/");
    setUser(null);
  };


  return (
    <SafeAreaView style={[styles.container, {marginTop: -useHeaderHeight() / 2}]}>
      
      <Text style={styles.title}>Profile</Text>

      <View style={styles.profilePicWrapper}>
        {user?.photoURL ? (
          <Image source={{ uri: user?.photoURL }} style={styles.profilePic} />
        ) : (
          <Image source={require('../../assets/images/default-avatar.png')} style={styles.profilePic} />
        )}
        {user?.displayName && (
          <Text style={styles.displayName}>
            {user.displayName}
          </Text>
        )}

        {user?.email && (
          <Text style={styles.email}>
            {user.email}
          </Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleLogout}
        style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.logoutText}>Logout</Text>
        )}
      </TouchableOpacity>

    </SafeAreaView>
  )
}
export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30, // text-5xl ~ 40px
    fontWeight: 'bold',
    color: '#1f2937', // text-dark-200 ~ neutral dark
    marginBottom: 24,
    textAlign: 'center',
  },
  profilePicWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 60, // Makes it circular
    borderWidth: 2,
    borderColor: '#4F46E5',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 18, // text-lg
    color: '#4B5563', // text-gray-600
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 18, // text-lg
    color: '#4B5563', // text-gray-600
    textAlign: 'center',
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#4F46E5', // bg-indigo-600
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16, // text-base
  },
  disabledButton: {
    opacity: 0.5,
  },
});