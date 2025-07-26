import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  getFirestore,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { AuthContext } from "../../contexts/AuthContext";
import { app } from '../../utils/firebaseConfig';
import Animated, { FadeInLeft, FadeInUp } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../contexts/ThemeContext";

type Workout = {
  id: string;
  name: string;
  duration: {
    hours: string;
    minutes: string;
    seconds: string;
  };
  sets: string;
  reps: string;
  weight: string;
  timestamp: any;
};

const WorkoutHistory = () => {
  const db = getFirestore(app);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const { user } = useContext(AuthContext);
  const { uid } = useLocalSearchParams();

  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const effectiveUid = typeof uid === "string" ? uid : user?.uid;

  if (!effectiveUid) {
    Alert.alert("Error", "No user ID provided.");
    return null;
  }

  const fetchWorkouts = async (loadMore = false) => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (loadMore && endReached) return;

    const baseQuery = query(
      collection(db, 'Users', effectiveUid!, 'workouts'),
      orderBy('timestamp', 'desc'),
      ...(loadMore && lastDoc ? [startAfter(lastDoc)] : []),
      limit(10)
    );

    const snapshot = await getDocs(baseQuery);
    const newWorkouts: Workout[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Workout, 'id'>)
    }));

    setWorkouts(prev => (loadMore ? [...prev, ...newWorkouts] : newWorkouts));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setEndReached(snapshot.empty);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const bottomReached =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - 60;

    if (bottomReached && !loadingMore && !endReached) {
      setLoadingMore(true);
      fetchWorkouts(true);
    }
  };

  const getShiftedDayKey = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    const clone = new Date(date);
    if (clone.getHours() < 5) clone.setDate(clone.getDate() - 1);
    return clone.toDateString();
  };

  const renderedWorkoutList = () => {
    let lastDayKey: string | null = null;

    return workouts.map((workout, idx) => {
      const currentDayKey = getShiftedDayKey(workout.timestamp);
      const showDivider = currentDayKey !== lastDayKey;
      lastDayKey = currentDayKey;

      return (
        <React.Fragment key={workout.id}>
          {showDivider && (
            <Text style={[styles.dateDivider, { 
              color: isDarkMode ? '#A1A1AA' : '#4B5563', 
              backgroundColor: isDarkMode ? '#2C2C2C' : '#E5E7EB',
            }]}>
              {currentDayKey}
            </Text>
          )}
          <Animated.View
            entering={FadeInLeft.delay(idx % 10 * 200).duration(500).springify()}
            style={[styles.card, { backgroundColor: isDarkMode ? '#1E1E1E' : 'white' }]}
          >
            <Text adjustsFontSizeToFit numberOfLines={1} style={[styles.workoutName, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>
              {workout.name}
            </Text>
            <Text style={[styles.duration, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>Duration:
              {workout.duration.hours ? ` ${workout.duration.hours}h` : ''}
              {workout.duration.minutes ? ` ${workout.duration.minutes}m` : ''}
              {workout.duration.seconds ? ` ${workout.duration.seconds}s` : ''}
            </Text>
            <Text style={[styles.sets, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>Sets: {workout.sets} | Reps: {workout.reps}</Text>
            <Text style={[styles.weightLifted, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}>Weight lifted: {workout.weight}</Text>
            <Text style={[styles.timestamp, { color: isDarkMode ? '#A1A1AA' : '#9CA3AF' }]}>
              {new Date(workout.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) + ' at ' + new Date(workout.timestamp.seconds * 1000).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              })}
            </Text>
          </Animated.View>
        </React.Fragment>
      );
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}>
      <View style={[styles.headerContainer, { backgroundColor: isDarkMode ? '#121212' : 'white' }]}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={[styles.header, { color: isDarkMode ? '#F3F4F6' : '#1F2937' }]}
        >
          Workout History
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={[styles.subHeader, { color: isDarkMode ? '#A1A1AA' : '#6B7280' }]}
        >
          Keep up the momentum!
        </Animated.Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={isDarkMode ? '#A78BFA' : '#4F46E5'} style={{ marginTop: hp(30) }} />
      ) : workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.Text
            entering={FadeInUp.delay(300).duration(500).springify()}
            style={[styles.emptyText, { color: isDarkMode ? '#A1A1AA' : '#888' }]}
          >
            Nothing but crickets here... 🦗
          </Animated.Text>

          <Animated.Text
            entering={FadeInUp.delay(500).duration(500).springify()}
            style={[styles.emptyText, { color: isDarkMode ? '#A1A1AA' : '#888' }]}
          >
            Start your journey by recording a workout! 💪
          </Animated.Text>
        </View>
      ) : (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={[styles.scrollArea, { backgroundColor: isDarkMode ? '#121212' : 'white' }]}
        >
          {renderedWorkoutList()}
          {loadingMore && (
            <ActivityIndicator size="small" color={isDarkMode ? '#A78BFA' : '#4F46E5'} style={{ marginVertical: hp(5) }} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default WorkoutHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingBottom: wp(4),
  },
  header: {
    fontSize: hp(5),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subHeader: {
    textAlign: 'center',
    fontSize: hp(3),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: hp(18),
    gap: hp(3),
  },
  emptyText: {
    fontSize: hp(2.7),
    textAlign: 'center',
    paddingHorizontal: wp(5),
  },
  scrollArea: {
    paddingHorizontal: wp(6),
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginVertical: hp(1.5),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  workoutName: {
    fontSize: hp(3.5),
    fontWeight: '600',
    marginBottom: hp(1),
  },
  duration: {
    fontSize: hp(2.7),
    fontWeight: '300',
    marginBottom: hp(1),
  },
  sets: {
    fontSize: hp(2.7),
    fontWeight: '300',
    marginBottom: hp(1),
  },
  weightLifted: {
    fontSize: hp(2.7),
    fontWeight: '300',
    marginBottom: hp(1),
  },
  timestamp: {
    fontSize: hp(2),
  },
  dateDivider: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: 9999,
    alignSelf: "center",
    marginVertical: hp(1),
    overflow: 'hidden',
  }
});
