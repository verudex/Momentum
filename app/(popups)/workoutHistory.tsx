import React, { useEffect, useState, useContext } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";

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

  const screenHeight = Dimensions.get('window').height;

  return (
    <SafeAreaView style={[styles.container, {marginTop: -useHeaderHeight() / 3}]}>
      <View style={styles.headerContainer}>
        <Animated.Text 
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
        <ActivityIndicator size="large" color="rgb(146, 136, 136)" style={{ marginTop: 32 }} />
      ) : (
        <ScrollView 
          style={styles.scrollArea} 
          onScroll={handleScroll} 
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
          {workouts.map((workout, idx) => (
            <Animated.View 
              entering={FadeInLeft.delay(idx % 10 * 200).duration(500).springify()}
              key={workout.id} style={[styles.card, { height: screenHeight * 0.18 }]}
            >
              <Text 
                adjustsFontSizeToFit 
                numberOfLines={1}
                style={styles.workoutName}>{workout.name}</Text>
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
                  month: 'long', // 👈 full month name
                  day: 'numeric',
                }) + ' at ' + new Date(workout.timestamp.seconds * 1000).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </Animated.View>
          ))}
          {loadingMore && <ActivityIndicator size="small" color="rgb(146, 136, 136)" style={{ marginVertical: 16 }} />}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

export default WorkoutHistory

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
  },
    headerContainer: {
    paddingVertical: 12,
    backgroundColor: 'white',
    zIndex: 1,
  },
  header: {
    fontSize: 42,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    color: 'rgb(57, 53, 53)"',
  },
  subHeader: {
    textAlign: 'center',
    color: 'rgb(146, 136, 136)',
    fontSize: 20,
    marginBottom: 8,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 8,

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android shadow
    elevation: 4,
  },
  workoutName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  duration: {
    fontSize: 18,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 6,
  },
  sets: {
    fontSize: 18,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 6,
  },
  weightLifted: {
    fontSize: 18,
    fontWeight: '300',
    color: '#111827',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});