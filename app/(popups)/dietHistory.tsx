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
} from "react-native";
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
} from "firebase/firestore";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import { app } from "../../utils/firebaseConfig";
import Animated, { FadeInUp, FadeInLeft } from "react-native-reanimated";
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
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const [foods, setFoods] = useState<Food[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const { user } = useContext(AuthContext);
  const { uid } = useLocalSearchParams();

  const effectiveUid = typeof uid === "string" ? uid : user?.uid;

  if (!effectiveUid) {
    Alert.alert("Error", "No user ID provided.");
    return null;
  }

  const fetchFoods = async (loadMore = false) => {
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    if (loadMore && endReached) return;

    const baseQuery = query(
      collection(db, "Users", effectiveUid!, "diet"),
      orderBy("timestamp", "desc"),
      ...(loadMore && lastDoc ? [startAfter(lastDoc)] : []),
      limit(10)
    );

    const snapshot = await getDocs(baseQuery);
    const newFoods: Food[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Food, "id">),
    }));

    setFoods((prev) => (loadMore ? [...prev, ...newFoods] : newFoods));
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setEndReached(snapshot.empty);
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const bottomReached =
      nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
      nativeEvent.contentSize.height - 60;

    if (bottomReached && !loadingMore && !endReached) {
      setLoadingMore(true);
      fetchFoods(true);
    }
  };

  const getShiftedDayKey = (timestamp: any) => {
    const date = new Date(timestamp.seconds * 1000);
    const clone = new Date(date);
    if (clone.getHours() < 5) clone.setDate(clone.getDate() - 1);
    return clone.toDateString();
  };

  let lastDayKey: string | null = null;

  const renderedFoodList = () =>
    foods.map((food, idx) => {
      const currentDayKey = getShiftedDayKey(food.timestamp);
      const showDivider = currentDayKey !== lastDayKey;
      lastDayKey = currentDayKey;

      return (
        <React.Fragment key={food.id}>
          {showDivider && <Text style={[styles.dateDivider, isDarkMode && styles.dateDividerDark]}>{currentDayKey}</Text>}

          <Animated.View
            entering={FadeInLeft.delay((idx % 10) * 200).duration(500).springify()}
            style={[styles.card, isDarkMode && styles.cardDark]}
          >
            <View style={styles.cardHeader}>
              <View style={{ width: "85%" }}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.foodName, isDarkMode && styles.foodNameDark]}
                >
                  {food.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert("Delete Entry", "Are you sure you want to delete this meal?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteDoc(doc(db, "Users", effectiveUid!, "diet", food.id));
                          setFoods((prev) => prev.filter((f) => f.id !== food.id));
                        } catch (error) {
                          Alert.alert("Error", "Failed to delete food entry.");
                          console.error("Delete error:", error);
                        }
                      },
                    },
                  ]);
                }}
              >
                <Text style={[styles.deleteIcon, isDarkMode && styles.deleteIconDark]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.foodAmount, isDarkMode && styles.foodAmountDark]}>Amount: {food.amount}</Text>
            <Text style={[styles.foodCalories, isDarkMode && styles.foodCaloriesDark]}>Calories: {food.calories}</Text>
            <Text style={[styles.timestamp, isDarkMode && styles.timestampDark]}>
              {new Date(food.timestamp.seconds * 1000).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }) +
                " at " +
                new Date(food.timestamp.seconds * 1000).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
            </Text>
          </Animated.View>
        </React.Fragment>
      );
    });

  return (
    <View style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
      <View style={[styles.headerContainer, isDarkMode && styles.headerContainerDark]}>
        <Animated.Text
          adjustsFontSizeToFit
          numberOfLines={1}
          entering={FadeInUp.duration(500).springify()}
          style={[styles.header, isDarkMode && styles.headerDark]}
        >
          Food History
        </Animated.Text>
        <Animated.Text
          entering={FadeInUp.delay(200).duration(500).springify()}
          style={[styles.subHeader, isDarkMode && styles.subHeaderDark]}
        >
          Keep up the momentum!
        </Animated.Text>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "white" : "rgb(146, 136, 136)"}
          style={{ marginTop: hp(30) }}
        />
      ) : foods.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Animated.Text entering={FadeInUp.delay(300).duration(500).springify()} style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
            Nothing but crickets here... 🧇
          </Animated.Text>
          <Animated.Text entering={FadeInUp.delay(500).duration(500).springify()} style={[styles.emptyText, isDarkMode && styles.emptyTextDark]}>
            Start tracking by recording a meal! 🍎
          </Animated.Text>
        </View>
      ) : (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={[styles.scrollArea, isDarkMode && styles.scrollAreaDark]}>
          {renderedFoodList()}
          {loadingMore && (
            <ActivityIndicator
              size="small"
              color={isDarkMode ? "white" : "rgb(146, 136, 136)"}
              style={{ marginVertical: hp(5) }}
            />
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default DietHistory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "white",
  },
  containerDark: {
    backgroundColor: "#121212",
  },
  headerContainer: {
    paddingBottom: wp(4),
    backgroundColor: "white",
  },
  headerContainerDark: {
    backgroundColor: "#121212",
  },
  header: {
    fontSize: hp(5),
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(57, 53, 53)",
  },
  headerDark: {
    color: "white",
  },
  subHeader: {
    textAlign: "center",
    color: "rgb(146, 136, 136)",
    fontSize: hp(3),
  },
  subHeaderDark: {
    color: "#aaa",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: hp(18),
    gap: hp(3),
  },
  emptyText: {
    fontSize: hp(2.7),
    color: "#888",
    textAlign: "center",
    paddingHorizontal: wp(5),
  },
  emptyTextDark: {
    color: "#bbb",
  },
  scrollArea: {
    paddingHorizontal: wp(6),
    backgroundColor: "white",
  },
  scrollAreaDark: {
    backgroundColor: "#121212",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginVertical: hp(1.5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardDark: {
    backgroundColor: "#1E1E1E",
    shadowColor: "#000",
    shadowOpacity: 0.5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deleteIcon: {
    fontSize: hp(3),
    color: "#cfd2d8ff",
    paddingHorizontal: wp(2),
    paddingBottom: hp(1.5),
    fontWeight: "bold",
  },
  deleteIconDark: {
    color: "#ff6b6b",
  },
  foodName: {
    fontSize: hp(3.5),
    fontWeight: "600",
    color: "#111827",
    marginBottom: hp(1),
  },
  foodNameDark: {
    color: "white",
  },
  foodAmount: {
    fontSize: hp(2.7),
    fontWeight: "300",
    color: "#111827",
    marginBottom: hp(1),
  },
  foodAmountDark: {
    color: "#ddd",
  },
  foodCalories: {
    fontSize: hp(2.7),
    fontWeight: "300",
    color: "#111827",
    marginBottom: hp(1),
  },
  foodCaloriesDark: {
    color: "#ddd",
  },
  dateDivider: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: "#4B5563",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.6),
    borderRadius: 9999,
    alignSelf: "center",
    marginVertical: hp(1),
    overflow: "hidden",
  },
  dateDividerDark: {
    color: "#ddd",
    backgroundColor: "#333",
  },
  timestamp: {
    fontSize: hp(2),
    color: "#9CA3AF",
  },
  timestampDark: {
    color: "#bbb",
  },
});
