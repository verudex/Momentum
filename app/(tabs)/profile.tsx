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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

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
    padding: wp(5),
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: wp(5),
    padding: wp(6),
    marginBottom: hp(3),
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.1,
    shadowRadius: wp(3),
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: hp(2),
  },
  avatar: {
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    borderWidth: wp(0.8),
    borderColor: '#4F46E5',
  },
  editIcon: {
    position: 'absolute',
    bottom: hp(1),
    right: hp(1),
    backgroundColor: '#4F46E5',
    borderRadius: wp(3),
    padding: wp(2),
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    fontSize: wp(6),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp(0.5),
  },
  userEmail: {
    fontSize: wp(4),
    color: '#6B7280',
    marginBottom: hp(2),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: wp(0.3),
    borderTopColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: wp(3),
  },
  statValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: wp(3.5),
    color: '#6B7280',
    marginTop: hp(0.5),
  },
  menuContainer: {
    marginBottom: hp(3),
  },
  menuButtonContainer: {
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.3) },
    shadowOpacity: 0.05,
    shadowRadius: wp(1.5),
    elevation: 2,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(5),
  },
  menuText: {
    flex: 1,
    fontSize: wp(4.5),
    color: '#374151',
    marginLeft: wp(4),
    fontWeight: '500',
  },
  logoutContainer: {
    paddingHorizontal: wp(5),
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: hp(2),
    borderRadius: wp(3),
    gap: wp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.7) },
    shadowOpacity: 0.15,
    shadowRadius: wp(4),
    elevation: 6,
  },
  logoutText: {
    color: 'white',
    fontSize: wp(4),
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});