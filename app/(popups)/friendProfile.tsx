import { useLocalSearchParams, router } from "expo-router";
import { useContext, useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, where, getDocs, doc, getDoc, Timestamp } from "firebase/firestore";
import { app } from "../../utils/firebaseConfig";
import { 
  StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemeContext } from "../../contexts/ThemeContext";

export default function FriendProfilePage() {
  const db = getFirestore(app);
  const { uid, name, photo } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [numWorkoutsThisWeek, setNumWorkoutsThisWeek] = useState(0);
  const [totalWorkoutTimeThisWeek, setTotalWorkoutTimeThisWeek] = useState({ hours: 0, minutes: 0 });
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [canViewWorkout, setCanViewWorkout] = useState(false);
  const [canViewDiet, setCanViewDiet] = useState(false);

  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  if (!uid || typeof uid !== "string") return <Text>User not found</Text>;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        startOfWeek.setHours(5, 0, 0, 0);

        const metaDocRef = doc(db, 'Users', uid, 'streak', 'tracking');
        const metaSnap = await getDoc(metaDocRef);

        const userDataDocRef = doc(db, 'userData', uid);
        const userDataSnap = await getDoc(userDataDocRef);

        if (userDataSnap.exists()) {
          const userData = userDataSnap.data();
          setCanViewWorkout(userData.showWorkoutHistory ?? true);
          setCanViewDiet(userData.showDietHistory ?? true);
        }

        let workoutStreakFromDB = 0;

        if (metaSnap.exists()) {
          const data = metaSnap.data();
          workoutStreakFromDB = data.workoutStreak ?? 0;
        }

        setWorkoutStreak(workoutStreakFromDB);

        const workoutsQuery = query(
          collection(db, 'Users', uid, 'workouts'),
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
            totalMinutes += parseInt(data.duration.hours || "0") * 60 + parseInt(data.duration.minutes || "0");
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
  }, [uid]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View entering={FadeInDown.duration(500).springify()} style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={photo ? { uri: photo } : require('../../assets/images/default-avatar.png')}
              style={[styles.avatar, { borderColor: '#4F46E5' }]}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>{name || 'User'}</Text>

            {loading ? (
              <ActivityIndicator size="large" color={isDarkMode ? '#A78BFA' : '#4F46E5'} />
            ) : (
              <View style={[styles.statsContainer, { borderTopColor: isDarkMode ? '#333' : '#E5E7EB' }]}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#A78BFA' : '#4F46E5' }]}>{numWorkoutsThisWeek}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>Workouts This Week</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#A78BFA' : '#4F46E5' }]}>{totalWorkoutTimeThisWeek.hours}h {totalWorkoutTimeThisWeek.minutes}m</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>Time Spent Grinding</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: isDarkMode ? '#A78BFA' : '#4F46E5' }]}>{workoutStreak}</Text>
                  <Text style={[styles.statLabel, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}>Day Streak</Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>

        {canViewWorkout && (
          <Animated.View entering={FadeInUp.duration(500).springify().delay(200)} style={[styles.menuButtonContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
            <TouchableOpacity
              style={styles.buttonRow}
              onPress={() => router.push({ pathname: "/(popups)/friendWorkoutHistory", params: { uid } })}
            >
              <Ionicons name="barbell" size={hp(2.5)} color="#4F46E5" />
              <Text style={[styles.buttonText, { color: isDarkMode ? '#F3F4F6' : '#374151' }]}>View Workout History</Text>
              <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>
        )}

        {canViewDiet && (
          <Animated.View entering={FadeInUp.duration(500).springify().delay(300)} style={[styles.menuButtonContainer, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}>
            <TouchableOpacity
              style={styles.buttonRow}
              onPress={() => router.push({ pathname: "/(popups)/friendDietHistory", params: { uid } })}
            >
              <Ionicons name="nutrition-sharp" size={hp(2.5)} color="#4F46E5" />
              <Text style={[styles.buttonText, { color: isDarkMode ? '#F3F4F6' : '#374151' }]}>View Diet History</Text>
              <Ionicons name="chevron-forward" size={hp(2.2)} color="#9CA3AF" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContainer: { 
    padding: wp(5),
  },
  profileCard: {
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
  },
  userInfo: { 
    alignItems: 'center', 
    width: '100%',
  },
  userName: {
    fontSize: wp(6), 
    fontWeight: 'bold', 
    marginBottom: hp(0.5),
  },
  statsContainer: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%',
    marginTop: hp(2), 
    paddingTop: hp(2), 
    borderTopWidth: wp(0.3),
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
    textAlign: 'center',
  },
  statLabel: {
    fontSize: wp(3), 
    marginTop: hp(0.5),
    textAlign: 'center', 
    flexWrap: 'wrap',
  },
  menuButtonContainer: {
    marginBottom: hp(1.5),
    borderRadius: wp(3),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp(0.3) },
    shadowOpacity: 0.05,
    shadowRadius: wp(1.5),
    elevation: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp(2.2),
    paddingHorizontal: wp(5),
  },
  buttonText: {
    flex: 1,
    fontSize: wp(4.5),
    marginLeft: wp(4),
    fontWeight: '500',
  },
});
