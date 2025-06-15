import { useContext, useEffect, useState, } from 'react';
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { 
  StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView 
        } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useDisableBack } from "../../hooks/useDisableBack";
import { signOut } from "../../utils/signIn_Out";
import { FontAwesome6, Ionicons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import * as FileSystem from 'expo-file-system';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";


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

  const handleChangeProfilePicture = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission denied', 'Please allow access to your photos.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
  });

  if (!result.canceled && result.assets.length > 0) {
    const image = result.assets[0];
    const path = `profile_pictures/${user?.uid}.jpg`;

    try {
      // ✅ fetch image and convert to blob
      console.log('image.uri:', image.uri);
      const response = await fetch(image.uri);
      const blob = await response.blob();
      console.log('blob.size:', blob.size);
      console.log('blob.type:', blob.type);

      const storage = getStorage(); // make sure this uses an initialized app!
      const reference = ref(storage, path);

      console.log("0 - Uploading");
      await uploadBytes(reference, blob);
      console.log("1 - Uploaded");

      const downloadURL = await getDownloadURL(reference);
      console.log("2 - Got download URL");

      if (user) {
        console.log("3 - Updating profile");
        await updateProfile(user, { photoURL: downloadURL });
        console.log("4 - Updated");

        setUser({ ...user, photoURL: downloadURL });
        Alert.alert('Success', 'Profile picture updated.');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Error', 'Failed to upload profile picture.');
    }
  }
};





  return (
    <ScrollView>
      <Text style={styles.title}>Profile</Text>

      {/* <View style={styles.profilePicWrapper}>
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
      </View> */}
      <View style={styles.profilePicWrapper}>
        <TouchableOpacity onPress={handleChangeProfilePicture}>
          <View>
            <Image
              source={user?.photoURL ? { uri: user?.photoURL } : require('../../assets/images/default-avatar.png')}
              style={styles.profilePic}
            />
            <View style={styles.editIconWrapper}>
              <Ionicons name="pencil" size={16} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {user?.displayName && (
          <Text style={styles.displayName}>{user.displayName}</Text>
        )}
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
      </View>

    <View style={styles.navSection}>
      {/* Profile Details Button */}
      <Animated.View 
        entering={FadeInUp.duration(500).springify().delay(100)}
        style={styles.buttonContainer}
      >
      <TouchableOpacity style={styles.navButton} onPress={() => router.push("profileDetails")}>
        <Ionicons name="person-sharp" size={20} color="#4B5563" />
        <Text style={styles.navText}>Profile Details</Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
      </TouchableOpacity>
    </Animated.View>
      
      <Animated.View 
        entering={FadeInUp.duration(500).springify().delay(200)}
        style={styles.buttonContainer}
      >
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("notifications")}>
          <Ionicons name="notifications-sharp" size={20} color="#4B5563" />
          <Text style={styles.navText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View 
        entering={FadeInUp.duration(500).springify().delay(300)}
        style={styles.buttonContainer}
      >
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("help")}>
          <Ionicons name="help-circle-sharp" size={20} color="#4B5563" />
          <Text style={styles.navText}>Help</Text>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
        </TouchableOpacity>
      </Animated.View>

        <Animated.View 
          entering={FadeInUp.duration(500).springify().delay(400)}
          style={styles.buttonContainer}
        >
          <TouchableOpacity style={styles.navButton} onPress={() => router.push("settings")}>
            <Ionicons name="settings-sharp" size={20} color="#4B5563" />
            <Text style={styles.navText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View>
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
      </View>
    </ScrollView>
  )
}
export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 40, // text-5xl ~ 40px
    fontWeight: 'bold',
    color: '#1f2937', // text-dark-200 ~ neutral dark
    marginBottom: 14,
    textAlign: 'center',
  },
  profilePicWrapper: {
    alignItems: 'center',
    marginBottom: 2,
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4F46E5',
    borderRadius: 999,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 2,
  },
  logoutButton: {
    backgroundColor: '#4F46E5', // bg-indigo-600
    paddingHorizontal: 10,
    paddingVertical: 18,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 18, // text-base
    fontWeight: 600,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navSection: {
    marginVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    width: '100%',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // for Android
  },
  navButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navText: {
    fontSize: 20,
    color: '#4B5563',
    marginLeft: 12,
    fontWeight: 600,
  },
});