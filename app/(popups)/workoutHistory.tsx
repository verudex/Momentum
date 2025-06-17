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
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";
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

  const fetchWorkouts = async (loadMore = false) => {
    if (user == null) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (loadMore && endReached) return;

    const baseQuery = query(
      collection(db, 'Users', user.uid, 'workouts'),
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

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.headerContainer}>
        <Animated.Text 
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={styles.header}
        >
          Workout History
        </Animated.Text>

        <Animated.Text 
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={styles.subHeader}
        >
          Keep up the momentum!
        </Animated.Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="rgb(146, 136, 136)" style={{ marginTop: hp(30) }} />
      ) : workouts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.Text 
            entering={FadeInUp.delay(300).duration(500).springify()}
            style={styles.emptyText}
          >
            Nothing but crickets here... 🦗
          </Animated.Text>

          <Animated.Text 
            entering={FadeInUp.delay(500).duration(500).springify()}
            style={styles.emptyText}
          >
            Start your journey by recording a workout! 💪
          </Animated.Text>
        </View>
      ) : (
        <ScrollView 
          onScroll={handleScroll} 
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollArea}
        >
          {workouts.map((workout, idx) => (
            <Animated.View 
              entering={FadeInLeft.delay(idx % 10 * 200).duration(500).springify()}
              key={workout.id} style={styles.card}
            >
              <Text adjustsFontSizeToFit numberOfLines={1} style={styles.workoutName}>
                {workout.name}
              </Text>
              <Text style={styles.duration}>Duration: 
                {workout.duration.hours ? ` ${workout.duration.hours}h` : ''}
                {workout.duration.minutes ? ` ${workout.duration.minutes}m` : ''}
                {workout.duration.seconds ? ` ${workout.duration.seconds}s` : ''}
              </Text>
              <Text style={styles.sets}>Sets: {workout.sets} | Reps: {workout.reps}</Text>
              <Text style={styles.weightLifted}>Weight lifted: {workout.weight}</Text>
              <Text style={styles.timestamp}>
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
          ))}
          {loadingMore && (
            <ActivityIndicator size="small" color="rgb(146, 136, 136)" style={{ marginVertical: hp(5) }} />
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default WorkoutHistory

const styles = StyleSheet.create({
  headerContainer: {
    paddingBottom: wp(4),
    backgroundColor: 'white',
  },
  header: {
    fontSize: hp(5),
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgb(57, 53, 53)"',
  },
  subHeader: {
    textAlign: 'center',
    color: 'rgb(146, 136, 136)',
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
    color: '#888',
    textAlign: 'center',
    paddingHorizontal: wp(5),
  },
  scrollArea: {
    paddingHorizontal: wp(6),
    backgroundColor: "white",
  },
  card: {
    height: hp(25),
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
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
    color: '#111827',
    marginBottom: hp(1),
  },
  duration: {
    fontSize: hp(2.7),
    fontWeight: '300',
    color: '#111827',
    marginBottom: hp(1),
  },
  sets: {
    fontSize: hp(2.7),
    fontWeight: '300',
    color: '#111827',
    marginBottom: hp(1),
  },
  weightLifted: {
    fontSize: hp(2.7),
    fontWeight: '300',
    color: '#111827',
    marginBottom: hp(1),
  },
  timestamp: {
    fontSize: hp(2),
    color: '#9CA3AF',
  },
});