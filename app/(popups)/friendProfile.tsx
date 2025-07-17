import { useLocalSearchParams, router } from "expo-router";
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
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";

export default function FriendProfilePage() {
  const db = getFirestore(app);
  const { uid, name, photo } = useLocalSearchParams();
  const [workoutStreak, setWorkoutStreak] = useState<number | null>(null);
  const [workoutHours, setWorkoutHours] = useState<number | null>(null);
  const [loadingStreak, setLoadingStreak] = useState(true);

  if (!uid || typeof uid !== "string") {
    return <Text>User not found</Text>;
  }

  const getWorkoutStreak = async (uid: string): Promise<number | null> => {
    try {
      const streakDocRef = doc(db, "Users", uid, "streak", "tracking");
      const streakSnap = await getDoc(streakDocRef);

      if (streakSnap.exists()) {
        const data = streakSnap.data();
        return data.workoutStreak ?? null;
      } else {
        console.warn("No workout streak data found");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch workout streak:", error);
      return null;
    }
  };

  const getWorkoutHours = async (uid: string): Promise<number | null> => {
    try {
      const streakDocRef = doc(db, "Users", uid, "streak", "tracking");
      const streakSnap = await getDoc(streakDocRef);

      if (streakSnap.exists()) {
        const data = streakSnap.data();
        return data.workoutHours ?? null;
      } else {
        console.warn("No workout hours data found");
        return null;
      }
    } catch (error) {
      console.error("Failed to fetch workout hours:", error);
      return null;
    }
  };
  
  
  useEffect(() => {
    const fetchStreak = async () => {
        const streak = await getWorkoutStreak(uid);
        const hours = await getWorkoutHours(uid);
        setWorkoutStreak(streak);
        setWorkoutHours(hours);
        setLoadingStreak(false);
    };
    fetchStreak();
  });

  return (
    <View style={styles.container}>
      <Animated.View 
          entering={FadeInDown.duration(500).springify()}
          style={styles.profileCard}
        >
            <View style={styles.avatarContainer}>
              <Image
                source={photo ? { uri: photo } : require('../../assets/images/default-avatar.png')}
                style={styles.avatar}
              />
            </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{name || 'User'}</Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {loadingStreak ? "..." : workoutStreak ?? "001"}
                </Text>
                <Text style={styles.statLabel}>WORKOUT STREAK</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{loadingStreak ? "..." : workoutHours ?? "001"}</Text>
                <Text style={styles.statLabel}>min of workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>Gold</Text>
                <Text style={styles.statLabel}>SUBSCRIPTION</Text>
              </View>
            </View>
          </View>
        </Animated.View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: "/(popups)/workoutHistory", params: { uid } })}
      >
        <Text style={styles.buttonText}>View Workout History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push({ pathname: "/(popups)/dietHistory", params: { uid } })}
      >
        <Text style={styles.buttonText}>View Diet History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subHeader: { fontSize: 16, marginBottom: 20 },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
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

