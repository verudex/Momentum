import { useContext, useEffect, useState } from 'react';
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
    await signOut(setUser);
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
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const storage = getStorage();
        const reference = ref(storage, path);
        await uploadBytes(reference, blob);
        const downloadURL = await getDownloadURL(reference);

        if (user) {
          await updateProfile(user, { photoURL: downloadURL });
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Card */}
        <Animated.View 
          entering={FadeInDown.duration(500).springify()}
          style={styles.profileCard}
        >
          <TouchableOpacity onPress={handleChangeProfilePicture}>
            <View style={styles.avatarContainer}>
              <Image
                source={user?.photoURL ? { uri: user?.photoURL } : require('../../assets/images/default-avatar.png')}
                style={styles.avatar}
              />
              <View style={styles.editIcon}>
                <Ionicons name="pencil" size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>2400</Text>
                <Text style={styles.statLabel}>CALORIES</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>3</Text>
                <Text style={styles.statLabel}>DAY STREAK</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Gold</Text>
                <Text style={styles.statLabel}>SUBSCRIPTION</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.menuContainer}>
          <Animated.View 
            entering={FadeInUp.duration(500).springify().delay(200)}
            style={styles.menuButtonContainer}
          >
            <TouchableOpacity style={styles.menuButton} onPress={() => router.push("notifications")}>
              <Ionicons name="notifications-sharp" size={24} color="#4F46E5" />
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
            </TouchableOpacity>
          </Animated.View>
{/* 
          <Animated.View 
            entering={FadeInUp.duration(500).springify().delay(300)}
            style={styles.menuButtonContainer}
          >
            <TouchableOpacity style={styles.menuButton} onPress={() => router.push("help")}>
              <Ionicons name="help-circle-sharp" size={24} color="#4F46E5" />
              <Text style={styles.menuText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
            </TouchableOpacity>
          </Animated.View> */}

          <Animated.View 
            entering={FadeInUp.duration(500).springify().delay(300)}
            style={styles.menuButtonContainer}
          >
            <TouchableOpacity style={styles.menuButton} onPress={() => router.push("settings")}>
              <Ionicons name="settings-sharp" size={24} color="#4F46E5" />
              <Text style={styles.menuText}>Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF"/>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Logout Button */}
        <Animated.View 
          entering={FadeInUp.duration(500).springify().delay(400)}
          style={styles.logoutContainer}
        >
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="white" />
                <Text style={styles.logoutText}>Log Out</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4F46E5',
  },
  editIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 6,
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuButtonContainer: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    color: '#374151',
    marginLeft: 16,
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});