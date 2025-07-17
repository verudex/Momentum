import React, { useState, useContext, useCallback, useEffect } from "react";
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from "react-native";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  Timestamp,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { AuthContext } from "../../contexts/AuthContext";
import { app } from "../../utils/firebaseConfig";
import { useRouter } from "expo-router";
import { useDisableBack } from "hooks/useDisableBack";
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import WorkoutOptions from "utils/workoutOptions";

type FriendEntry = {
  id: string;
  name: string;
  value: string;
}

type RecentItem = {
  id: string;
  name: string;
  timestamp: any;
};

const tempFriends = [
  { id: 1, name: "Alice", value: 45 },
  { id: 2, name: "Bob", value: 70 },
  { id: 3, name: "Charlie", value: 65 },
  { id: 4, name: "Diana", value: 80 },
  { id: 5, name: "Ethan", value: 60 },
  { id: 6, name: "Fay", value: 90 },
  { id: 7, name: "George", value: 50 },
  { id: 8, name: "Hannah", value: 75 },
  { id: 9, name: "Ian", value: 55 },
  { id: 10, name: "Jane", value: 85 },
  { id: 11, name: "Kyle", value: 68 },
  { id: 12, name: "Lily", value: 78 },
  { id: 13, name: "Mike", value: 73 },
  { id: 14, name: "Nora", value: 88 },
  { id: 15, name: "Oscar", value: 63 },
];

const Home = () => {
  useDisableBack();
  const { user } = useContext(AuthContext);
  const db = getFirestore(app);
  const router = useRouter();

  // General States
  const [loading, setLoading] = useState(true);

  // States for Leaderboard
  const [leaderboardFilter, setLeaderboardFilter] = useState("Time Spent");
  const [sortedLeaderboard, setSortedLeaderboard] = useState(tempFriends.sort((a, b) => b.value - a.value).slice(0, 10));

  // States for Workout Summary
  const [numWorkoutsThisWeek, setNumWorkoutsThisWeek] = useState(0);
  const [totalWorkoutTimeThisWeek, setTotalWorkoutTimeThisWeek] = useState({ hours: 0, minutes: 0 });
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentItem[]>([]);

  // States for Diet Summary
  const [loadingDiet, setLoadingDiet] = useState(true);
  const [avgCalories, setAvgCalories] = useState(0);
  const [dietStreak, setDietStreak] = useState(0);
  const [mostOffDay, setMostOffDay] = useState<{ date: string; diff: string }>({ date: "", diff: "" });
  const [targetData, setTargetData] = useState<any>(null);
  const [goalType, setGoalType] = useState<string>("deficit");
  const [recentMeals, setRecentMeals] = useState<RecentItem[]>([]);

  const updateLeaderboard = async () => {
    const tempSortedLeaderboard = tempFriends
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
    setSortedLeaderboard(tempSortedLeaderboard);
  }

  useEffect(() => {
    updateLeaderboard();
  }, [leaderboardFilter])

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchData = async () => {
        setLoading(true);
        setLoadingDiet(true);

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

          const recentWorkoutSnap = await getDocs(
            query(
              collection(db, 'Users', user.uid, 'workouts'),
              orderBy('timestamp', 'desc'),
              limit(5)
            )
          );
          setRecentWorkouts(recentWorkoutSnap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name ?? "",
            timestamp: doc.data().timestamp ?? { seconds: 0 }
          })));

          // --------------------
          // DIET TARGET & DATA
          // --------------------
          const targetSnap = await getDocs(
            collection(db, 'Users', user.uid, 'targets')
          );
          const fetchedTargetData = targetSnap.docs[0]?.data();
          setTargetData(fetchedTargetData);
          const currentGoalType = fetchedTargetData?.goalType ?? "deficit";
          setGoalType(currentGoalType);
          const currentTargetCalories = parseInt(fetchedTargetData?.targetCalories ?? "2000");

          const dietQuery = query(
            collection(db, 'Users', user.uid, 'diet'),
            where("timestamp", ">=", Timestamp.fromDate(startOfWeek)),
            orderBy("timestamp", "desc")
          );
          const dietSnap = await getDocs(dietQuery);

          const dailyTotals: { [key: string]: number } = {};
          dietSnap.forEach(doc => {
            const data = doc.data();
            const cal = parseFloat(data.calories || "0");
            const date = new Date(data.timestamp.seconds * 1000);
            if (date.getHours() < 5) date.setDate(date.getDate() - 1);
            const key = date.toDateString();
            dailyTotals[key] = (dailyTotals[key] ?? 0) + cal;
          });

          // --------------------
          // AVG + MOST OFF DAY WITH +/- SIGN
          // --------------------
          const days = Object.keys(dailyTotals);
          const avg = days.length > 0 ? 
            days.reduce((sum, day) => sum + dailyTotals[day], 0) / days.length : 0;
          setAvgCalories(Math.round(avg));

          let extremeDay = "";
          let extremeDiff = currentGoalType === "deficit" ? -Infinity : Infinity;
          days.forEach(day => {
            const diff = dailyTotals[day] - currentTargetCalories;
            if (currentGoalType === "deficit") {
              if (diff > extremeDiff) {
                extremeDiff = diff;
                extremeDay = day;
              }
            } else {
              if (diff < extremeDiff) {
                extremeDiff = diff;
                extremeDay = day;
              }
            }
          });

          const signedDiff = extremeDiff > 0 ? `+${extremeDiff}` : `${extremeDiff}`;
          setMostOffDay({ date: extremeDay, diff: signedDiff });

          // --------------------
          // DIET STREAK LOGIC
          // --------------------
          const today = new Date();
          today.setHours(5, 0, 0, 0);
          const todayKey = today.toDateString();

          let newDietStreak = dietStreakFromDB;

          // If target changed, reset streak
          if (currentGoalType !== lastGoalTypeInDB || currentTargetCalories !== lastTargetCaloriesInDB) {
            newDietStreak = 0;
          }
          // Otherwise only if not checked today, verify yesterday met
          else if (lastDietChecked !== todayKey) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayTotal = dailyTotals[yesterday.toDateString()] ?? 0;

            const met = currentGoalType === "deficit"
              ? yesterdayTotal <= currentTargetCalories
              : yesterdayTotal >= currentTargetCalories;
            newDietStreak = met ? dietStreakFromDB + 1 : 0;
          }

          // Always update Firestore with latest tracking
          await setDoc(metaDocRef, {
            workoutStreak: workoutStreakFromDB,
            dietStreak: newDietStreak,
            lastDietChecked: todayKey,
            lastGoalType: currentGoalType,
            lastTargetCalories: currentTargetCalories
          }, { merge: true });

          setDietStreak(newDietStreak);

          // --------------------
          // RECENT MEALS
          // --------------------
          const recentMealsSnap = await getDocs(
            query(
              collection(db, 'Users', user.uid, 'diet'),
              orderBy('timestamp', 'desc'),
              limit(5)
            )
          );
          setRecentMeals(recentMealsSnap.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name ?? "",
            timestamp: doc.data().timestamp ?? { seconds: 0 }
          })));

          setLoading(false);
          setLoadingDiet(false);

        } catch (err) {
          console.error("Failed to fetch/update data:", err);
          setLoading(false);
          setLoadingDiet(false);
        }
      };

      fetchData();
    }, [user])
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.Text entering={FadeInDown.delay(200).duration(500).springify()} style={styles.title}>
          Welcome Back 👋
        </Animated.Text>

        {/* Leaderboard */}
        <Animated.View entering={FadeInUp.delay(400).duration(500).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Leaderboard</Text>
          {false ? (
            <ActivityIndicator size="large" color="rgb(146, 136, 136)" style={{ marginVertical: hp(4) }} />
          ) : (
            <>
              <View style={styles.leaderboardContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.leaderboardTitle}>Ranking for:</Text>
                  <Dropdown
                    data={WorkoutOptions.map(item => ({ label: item, value: item }))}
                    labelField="label"
                    valueField="value"
                    value={leaderboardFilter}
                    onChange={item => setLeaderboardFilter(item.value)}
                    style={{
                      width: wp(40),
                      backgroundColor: '#E5E7EB',
                      borderRadius: 30,
                      paddingHorizontal: wp(4),
                      paddingVertical: hp(0.4),
                      marginTop: -hp(1),
                    }}
                    placeholderStyle={{
                      fontSize: wp(4),
                      fontWeight: 'bold',
                      color: '#4B5563',
                    }}
                    selectedTextStyle={{
                      fontSize: wp(4),
                      fontWeight: 'bold',
                      color: '#4B5563',
                    }}
                    itemTextStyle={{
                      fontSize: wp(3.2),
                      lineHeight: hp(1.5), // close to font size
                      color: '#374151',
                    }}
                    containerStyle={{
                      width: wp(40),
                      paddingVertical: hp(0.5),
                      paddingHorizontal: wp(1),
                      borderRadius: 30,
                      elevation: 2,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.2,
                      shadowRadius: 1.41
                    }}
                    placeholder="Time Spent"
                    search
                    searchPlaceholder="Search"
                    inputSearchStyle={{
                      height: hp(4),
                      fontSize: hp(1.5),
                      borderRadius: 30,
                    }}
                    maxHeight={hp(25)}
                  />
                </View>


                {sortedLeaderboard.length === 0 ? (
                  <>
                    <Text style={styles.emptyLeaderboard}>Nothing Here!</Text>

                    <TouchableOpacity onPress={() => router.push("/(popups)/workoutSubmit")}>
                      <Text style={styles.viewMoreText}>Be the first one to start!</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {sortedLeaderboard.map((entry, index) => {
                      let placeIcon = ` ${index + 1}.`;
                      if (index === 0) placeIcon = '🥇';
                      else if (index === 1) placeIcon = '🥈';
                      else if (index === 2) placeIcon = '🥉';

                      return (
                        <View key={index} style={styles.leaderboardRow}>
                          <Text style={styles.leaderboardName} numberOfLines={1} ellipsizeMode="tail">
                            {placeIcon} {entry.name}
                          </Text>
                          <Text style={styles.leaderboardValue}>
                            {entry.value}
                          </Text>
                        </View>
                      );
                    })}
                    <TouchableOpacity onPress={() => { /* maybe router.push("/(popups)/fullLeaderboard") */ }}>
                      <Text style={styles.viewMoreText}>View more...</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </Animated.View>

        {/* Workout Summary */}
        <Animated.View entering={FadeInUp.delay(500).duration(500).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>💪 Workout Summary</Text>
          {loading ? (
            <ActivityIndicator size="large" color="rgb(146, 136, 136)" style={{ marginVertical: hp(4) }} />
          ) : (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{numWorkoutsThisWeek}</Text>
                  <Text style={styles.statLabel}>Workouts This Week</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{totalWorkoutTimeThisWeek.hours}h {totalWorkoutTimeThisWeek.minutes}m</Text>
                  <Text style={styles.statLabel}>Time Spent Grinding</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{workoutStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>

              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Workout History:</Text>

                {recentWorkouts.length === 0 ? (
                  <>
                    <Text style={styles.emptyHistory}>Nothing Here!</Text>

                    <TouchableOpacity onPress={() => router.push("/(popups)/workoutSubmit")}>
                      <Text style={styles.viewMoreText}>Start now!</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {recentWorkouts.map(workout => (
                      <View key={workout.id} style={styles.historyRow}>
                        <Text style={styles.historyWorkout} numberOfLines={1} ellipsizeMode="tail">
                          {workout.name}
                        </Text>

                        <Text style={styles.historyDate}>
                          {`${new Date(workout.timestamp.seconds * 1000).toLocaleDateString('en-GB', { weekday: 'short' })} • ${new Date(workout.timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                        </Text>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => router.push("/(popups)/workoutHistory")}>
                      <Text style={styles.viewMoreText}>View more...</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </Animated.View>

        {/* Diet Summary */}
        <Animated.View entering={FadeInUp.delay(600).duration(500).springify()} style={styles.card}>
          <Text style={styles.cardTitle}>🍎 Diet Summary</Text>
          {loadingDiet ? (
            <ActivityIndicator size="large" color="rgb(146, 136, 136)" style={{ marginVertical: hp(4) }} />
          ) : (
            <>
              <View style={[
                styles.statsContainer,
                !targetData && { justifyContent: 'space-evenly' } // if no target, center nicely
              ]}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{avgCalories}</Text>
                  <Text style={styles.statLabel}>Avg kcal/day this week</Text>
                </View>

                {targetData && recentMeals.length > 0 && (
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{mostOffDay.diff}</Text>
                    <Text style={styles.statLabel}>
                      {goalType === "deficit" ? "Greatest kcal Deficit" : "Greatest kcal Surplus"}
                    </Text>
                  </View>
                )}

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{dietStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
              </View>

              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Diet History:</Text>

                {recentMeals.length === 0 ? (
                  <>
                    <Text style={styles.emptyHistory}>Nothing Here!</Text>
                    <TouchableOpacity onPress={() => router.push("/(popups)/dietSubmit")}>
                      <Text style={styles.viewMoreText}>Start now!</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {recentMeals.map(meal => (
                      <View key={meal.id} style={styles.historyRow}>
                        <Text style={styles.historyWorkout} numberOfLines={1} ellipsizeMode="tail">
                          {meal.name}
                        </Text>

                        <Text style={styles.historyDate}>
                          {`${new Date(meal.timestamp.seconds * 1000).toLocaleDateString('en-GB', { weekday: 'short' })} • ${new Date(meal.timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                        </Text>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => router.push("/(popups)/dietHistory")}>
                      <Text style={styles.viewMoreText}>View more...</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: wp(5),
  },
  title: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp(3),
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: wp(5),
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(5),
    marginBottom: hp(2.5),
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: hp(0.5) },
    shadowOpacity: 0.1,
    shadowRadius: wp(3),
    elevation: 4,
  },
  cardTitle: {
    fontSize: wp(5.2),
    fontWeight: '600',
    color: '#4F46E5',
    alignSelf: 'center',
  },
  leaderboardContainer: {
    paddingTop: hp(1.2),
    borderTopWidth: wp(0.3),
    borderTopColor: '#E5E7EB',
    marginTop: hp(1)
  },
  leaderboardTitle: {
    fontSize: wp(4),
    marginBottom: hp(1),
    fontWeight: 'bold',
    color: '#4B5563',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.3),
    borderRadius: 9999,
    alignSelf: "center",
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(1),
  },
  leaderboardName: {
    maxWidth: "65%",
    fontSize: wp(3.7),
    color: '#374151',
  },
  leaderboardValue: {
    fontSize: wp(3.7),
    color: '#6B7280',
  },
  emptyLeaderboard: {
    fontSize: wp(4),
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: hp(2)
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: hp(1.5),
  },
  statItem: {
    width: "33%",
    alignItems: 'center',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
  },
  statValue: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: wp(3),
    color: '#6B7280',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  historyContainer: {
    paddingTop: hp(1.2),
    borderTopWidth: wp(0.3),
    borderTopColor: '#E5E7EB',
  },
  historyTitle: {
    fontSize: wp(4),
    marginBottom: hp(1),
    fontWeight: 'bold',
    color: '#4B5563', // soft grey text
    backgroundColor: '#E5E7EB', // light grey background
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.3),
    borderRadius: 9999, // fully rounded
    alignSelf: "center",
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.7),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  historyWorkout: {
    maxWidth: "65%",
    fontSize: wp(3.7),
    color: '#374151',
  },
  historyDate: {
    fontSize: wp(3.7),
    color: '#6B7280',
  },
  emptyHistory: {
    fontSize: wp(4),
    color: '#9CA3AF',
    textAlign: 'center',
  },
  viewMoreText: {
    marginTop: hp(1.5),
    fontSize: wp(3.7),
    color: '#7C3AED',
    fontWeight: '600',
    alignSelf: 'center',
  },
  itemText: {
    fontSize: wp(4.2),
    color: '#374151',
  },
});
