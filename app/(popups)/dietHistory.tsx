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

type Food = {
  id: string;
  name: string;
  amount: string;
  calories: string;
  timestamp: any;
};

const DietHistory = () => {
  const db = getFirestore(app);
  const [foods, setFoods] = useState<Food[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const { user } = useContext(AuthContext);

  const fetchFood = async (loadMore = false) => {
    if (user == null) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (loadMore && endReached) return;

    const baseQuery = query(
      collection(db, 'Users', user.uid, 'diet'),
      orderBy('timestamp', 'desc'),
      ...(loadMore && lastDoc ? [startAfter(lastDoc)] : []),
      limit(10)
    );

    const snapshot = await getDocs(baseQuery);
    const newFoods: Food[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Food, 'id'>)
    }));

    setFoods(prev => (loadMore ? [...prev, ...newFoods] : newFoods));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setEndReached(snapshot.empty);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchFood();
  }, []);

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const bottomReached =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - 60;

    if (bottomReached && !loadingMore && !endReached) {
      setLoadingMore(true);
      fetchFood(true);
    }
  };

  const getShiftedDayKey = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    const clone = new Date(date); // clone to avoid mutation

    // If before 5AM, treat it as part of the *previous day*
    if (clone.getHours() < 5) {
      clone.setDate(clone.getDate() - 1);
    }

    return clone.toDateString(); // e.g., "Wed Jun 26 2025"
  };

  const renderedFoodList = () => {
    let lastDayKey: string | null = null;

    return foods.map((food, idx) => {
      const currentDayKey = getShiftedDayKey(food.timestamp);
      const showDivider = currentDayKey !== lastDayKey;
      lastDayKey = currentDayKey;

      return (
        <React.Fragment key={food.id}>
          {showDivider && (
            <Text style={styles.dateDivider}>{currentDayKey}</Text>
          )}

          <Animated.View
            entering={FadeInLeft.delay(idx % 10 * 200).duration(500).springify()}
            style={styles.card}
          >
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.foodName}>
              {food.name}
            </Text>
            <Text style={styles.foodAmount}>Amount: {food.amount}</Text>
            <Text style={styles.foodCalories}>Calories: {food.calories}</Text>
            <Text style={styles.timestamp}>
              {new Date(food.timestamp.seconds * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }) + ' at ' + new Date(food.timestamp.seconds * 1000).toLocaleTimeString('en-US', {
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
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.headerContainer}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={styles.header}
        >
          Food History
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
      ) : foods.length === 0 ? (
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
            Start tracking by recording a meal! 🍎
          </Animated.Text>
        </View>
      ) : (
        <ScrollView
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.scrollArea}
        >
          {renderedFoodList()}
          {loadingMore && (
            <ActivityIndicator size="small" color="rgb(146, 136, 136)" style={{ marginVertical: hp(5) }} />
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default DietHistory

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
    backgroundColor: 'white',
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
  foodName: {
    fontSize: hp(3.5),
    fontWeight: '600',
    color: '#111827',
    marginBottom: hp(1),
  },
  foodAmount: {
    fontSize: hp(2.7),
    fontWeight: '300',
    color: '#111827',
    marginBottom: hp(1),
  },
  foodCalories: {
    fontSize: hp(2.7),
    fontWeight: '300',
    color: '#111827',
    marginBottom: hp(1),
  },
  dateDivider: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: '#4B5563', // soft grey text
    backgroundColor: '#E5E7EB', // light grey background
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: 9999, // fully rounded
    alignSelf: "center",
    marginVertical: hp(1),
    overflow: 'hidden',
  },
  timestamp: {
    fontSize: hp(2),
    color: '#9CA3AF',
  },
});