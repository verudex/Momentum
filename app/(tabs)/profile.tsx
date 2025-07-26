import { useContext, useEffect, useCallback, useState } from 'react';
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { 
  StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';
import { useDisableBack } from "../../hooks/useDisableBack";
import { signOut } from "../../utils/signIn_Out";
import { FontAwesome5, Ionicons, AntDesign } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import * as FileSystem from 'expo-file-system';
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where, 
  Timestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { app } from "../../utils/firebaseConfig";
import { ThemeContext } from "../../contexts/ThemeContext";

const Profile = () => {
  const db = getFirestore(app);

  useDisableBack();
  const { user, setUser } = useContext(AuthContext);
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [numWorkoutsThisWeek, setNumWorkoutsThisWeek] = useState(0);
  const [totalWorkoutTimeThisWeek, setTotalWorkoutTimeThisWeek] = useState({ hours: 0, minutes: 0 });
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

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

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchData = async () => {
        setLoading(true);

        try {
          const now = new Date();
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
          startOfWeek.setHours(5, 0, 0, 0);

          // --------------------
          // LOAD streak doc
          // --------------------
          const metaDocRef = doc(db, 'Users', user.uid, 'streak', 'tracking');
          const metaSnap = await getDoc(metaDocRef);

          let workoutStreakFromDB = 0;
          let dietStreakFromDB = 0;
          let lastDietChecked = null;
          let lastGoalTypeInDB = null;
          let lastTargetCaloriesInDB = null;
          let workoutHours = 0;

          if (metaSnap.exists()) {
            const data = metaSnap.data();
            workoutStreakFromDB = data.workoutStreak ?? 0;
            dietStreakFromDB = data.dietStreak ?? 0;
            lastDietChecked = data.lastDietChecked ?? null;
            lastGoalTypeInDB = data.lastGoalType ?? null;
            lastTargetCaloriesInDB = data.lastTargetCalories ?? null;
            workoutHours = data.workoutHours ?? null;
          }

          setWorkoutStreak(workoutStreakFromDB);

          // --------------------
          // WORKOUT SUMMARY
          // --------------------
          const workoutsQuery = query(
            collection(db, 'Users', user.uid, 'workouts'),
            where("timestamp", ">=", Timestamp.fromDate(startOfWeek)),
            orderBy("timestamp", "desc")
          );
          const workoutSnap = await getDocs(workoutsQuery);

          let numThisWeek = 0;
          let totalMinutes = 0;
          workoutSnap.forEach(doc => {
            numThisWeek++;
            const data = doc.data();
            if (data.duration) {
              totalMinutes += parseInt(data.duration.hours || "0") * 60
                + parseInt(data.duration.minutes || "0");
            }
          });

          setNumWorkoutsThisWeek(numThisWeek);
          setTotalWorkoutTimeThisWeek({
            hours: Math.floor(totalMinutes / 60),
            minutes: totalMinutes % 60,
          });

          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch/update data:", err);
          setLoading(false);
        }
      };

      fetchData();
    }, [user])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}>
  <ScrollView contentContainerStyle={styles.scrollContainer}>
    {/* Profile Card */}
    <Animated.View
      entering={FadeInDown.duration(500).springify()}
      style={[
        styles.profileCard,
        { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }
      ]}
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
        <Text style={[styles.userName, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>
          {user?.displayName || 'User'}
        </Text>
        <Text style={[styles.userEmail, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>
          {user?.email}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4F46E5" />
        ) : (
          <View style={[styles.statsContainer, { borderTopColor: isDarkMode ? '#333' : '#E5E7EB' }]}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{numWorkoutsThisWeek}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>
                Workouts This Week
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalWorkoutTimeThisWeek.hours}h {totalWorkoutTimeThisWeek.minutes}m
              </Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>
                Time Spent Grinding
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{workoutStreak}</Text>
              <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>
                Day Streak
              </Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>

    {/* Navigation Buttons */}
    <View style={styles.menuContainer}>
      <Animated.View
        entering={FadeInUp.duration(500).springify().delay(300)}
        style={[
          styles.menuButtonContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }
        ]}
      >
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push("friendsPage")}>
          <FontAwesome5 name="user-friends" size={hp(2)} color="#4F46E5" />
          <Text style={[styles.menuText, { color: isDarkMode ? '#F3F4F6' : '#374151' }]}>Friends</Text>
          <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(500).springify().delay(400)}
        style={[
          styles.menuButtonContainer,
          { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }
        ]}
      >
        <TouchableOpacity style={styles.menuButton} onPress={() => router.push("settings")}>
          <Ionicons name="settings-sharp" size={hp(2.5)} color="#4F46E5" />
          <Text style={[styles.menuText, { color: isDarkMode ? '#F3F4F6' : '#374151' }]}>Settings</Text>
          <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF" />
        </TouchableOpacity>
      </Animated.View>
    </View>

    {/* Logout Button */}
    <Animated.View
      entering={FadeInUp.duration(500).springify().delay(500)}
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
    justifyContent: 'space-between', 
    width: '100%',
    marginTop: hp(2),
    paddingTop: hp(2),
    borderTopWidth: wp(0.3),
    borderTopColor: '#E5E7EB',
    paddingHorizontal: wp(2), 
  },
  statItem: {
    alignItems: 'center',
    width: '30%', 
    paddingHorizontal: wp(1), 
  },
  statValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center', 
  },
  statLabel: {
    fontSize: wp(3),
    color: '#6B7280',
    marginTop: hp(0.5),
    textAlign: 'center', // Ensure text is centered
    flexWrap: 'wrap', // Allow text to wrap if needed
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