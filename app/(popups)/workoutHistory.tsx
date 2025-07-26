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
  TouchableOpacity,
  SafeAreaView,
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
  DocumentData,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { app } from '../../utils/firebaseConfig';
import Animated, { FadeInDown, FadeInUp, FadeInLeft } from "react-native-reanimated";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

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
  weight: string,
  unit?: "metric" | "imperial";
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
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";
  const { uid } = useLocalSearchParams();

  const effectiveUid = typeof uid === "string" ? uid : user?.uid;

  if (!effectiveUid) {
    Alert.alert("Error", "No user ID provided.");
    return null; // return null instead of undefined
  }

  const fetchWorkouts = async (loadMore = false) => {
    if (user == null) {
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
      ...(doc.data() as Omit<Workout, 'id'>)  // Ensures full Workout object
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
              color: isDarkMode ? '#D1D5DB' : '#4B5563',
              backgroundColor: isDarkMode ? '#374151' : '#E5E7EB'
            }]}>
              {currentDayKey}
            </Text>
          )}
          <Animated.View
            entering={FadeInLeft.delay(idx % 10 * 200).duration(500).springify()}
            style={[styles.card, { 
              backgroundColor: isDarkMode ? '#1E1E1E' : 'white',
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOpacity: isDarkMode ? 0.7 : 0.1,
            }]}
          >
            <View style={styles.cardHeader}>
              <View style={{ width: "85%" }}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.workoutName, { color: isDarkMode ? '#E5E7EB' : '#111827' }]}
                >
                  {workout.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Delete Workout",
                    "Are you sure you want to delete this workout?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await deleteDoc(doc(db, 'Users', effectiveUid!, 'workouts', workout.id));
                            setWorkouts(prev => prev.filter(w => w.id !== workout.id));
                          } catch (error) {
                            Alert.alert("Error", "Failed to delete workout.");
                            console.error("Delete error:", error);
                          }
                        }
                      }
                    ]
                  );
                }}
              >
                <Text style={[styles.deleteIcon, { color: isDarkMode ? '#9CA3AF' : '#cfd2d8ff' }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.duration, { color: isDarkMode ? '#E5E7EB' : '#111827' }]}>
              Duration:
              {workout.duration.hours ? ` ${workout.duration.hours}h` : ''}
              {workout.duration.minutes ? ` ${workout.duration.minutes}m` : ''}
              {workout.duration.seconds ? ` ${workout.duration.seconds}s` : ''}
            </Text>
            <Text style={[styles.sets, { color: isDarkMode ? '#E5E7EB' : '#111827' }]}>
              Sets: {workout.sets} | Reps: {workout.reps}
            </Text>
            <Text style={[styles.weightLifted, { color: isDarkMode ? '#E5E7EB' : '#111827' }]}>
              Weight lifted: {workout.weight}
              {workout.weight && workout.weight.trim() !== '' ? (
                workout.unit === 'imperial' ? ' lbs' : ' kg'
              ) : ''}
            </Text>
            <Text style={[styles.timestamp, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
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
          style={[styles.header, { color: isDarkMode ? '#F3F4F6' : 'rgb(57, 53, 53)' }]}
        >
          Workout History
        </Animated.Text>

        <Animated.Text
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={[styles.subHeader, { color: isDarkMode ? '#A1A1AA' : 'rgb(146, 136, 136)' }]}
        >
          Keep up the momentum!
        </Animated.Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#A78BFA' : 'rgb(146, 136, 136)'}
          style={{ marginTop: hp(30) }}
        />
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
          contentContainerStyle={[styles.scrollArea, { backgroundColor: isDarkMode ? '#121212' : '#F9FAFB' }]}
        >
          {renderedWorkoutList()}
          {loadingMore && (
            <ActivityIndicator size="small" color={isDarkMode ? '#A78BFA' : 'rgb(146, 136, 136)'} style={{ marginVertical: hp(5) }} />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

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
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: hp(3),
    paddingHorizontal: wp(2),
    paddingBottom: hp(1.5),
    fontWeight: 'bold',
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
