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
import { ThemeContext } from "../../contexts/ThemeContext";

type FriendEntry = {
  id: string; 
  name: string;
  value: number;
};


type RecentItem = {
  id: string;
  name: string;
  timestamp: any;
};

const Home = () => {
  useDisableBack();
  const { user } = useContext(AuthContext);
  const db = getFirestore(app);
  const router = useRouter();
  
  // Dark Mode
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  // Define colors depending on mode
  const colors = {
    background: isDarkMode ? '#121212' : '#F9FAFB',
    cardBackground: isDarkMode ? '#1E1E1E' : 'white',
    primaryText: isDarkMode ? '#F3F4F6' : '#1F2937',
    secondaryText: isDarkMode ? '#A1A1AA' : '#6B7280',
    tertiaryText: isDarkMode ? '#9CA3AF' : '#9CA3AF',
    borderColor: isDarkMode ? '#333' : '#E5E7EB',
    accentColor: '#7C3AED',
    shadowColor: isDarkMode ? '#000' : '#4F46E5',
  };

  // States for Leaderboard
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [leaderboardFilter, setLeaderboardFilter] = useState("");
  const [sortedLeaderboard, setSortedLeaderboard] = useState<FriendEntry[]>([]);


  // States for Workout Summary
  const [loadingWorkout, setLoadingWorkout] = useState(true);
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
  const [rankType, setRankType] = useState("");


  // const updateLeaderboard = async () => {
  //   const tempSortedLeaderboard = tempFriends
  //     .sort((a, b) => b.value - a.value)
  //     .slice(0, 10);
  //   setSortedLeaderboard(tempSortedLeaderboard);
  // }

  const updateLeaderboard = async () => {
  if (!user || !leaderboardFilter || !rankType) return;
  setLoadingLeaderboard(true);

  try {
    const currentUid = user.uid;

    const userDataRef = doc(db, "userData", currentUid);
    const userDataSnap = await getDoc(userDataRef);
    const userFriends: string[] = userDataSnap.data()?.friends || [];

    const allUids = [currentUid, ...userFriends];
    const leaderboardEntries: { id: string; name: string; value: any }[] = [];

    for (const uid of allUids) {
      const profileSnap = await getDoc(doc(db, "userData", uid));
      const username = profileSnap.data()?.username ?? "Unknown";

      const workoutsSnap = await getDocs(collection(db, "Users", uid, "workouts"));

      const filteredWorkouts = workoutsSnap.docs
        .map(doc => doc.data())
        .filter(workout => workout.name === leaderboardFilter);

      if (filteredWorkouts.length === 0) continue;

      let value: any = 0;

      if (rankType === "Time Spent") {
        let maxDuration = { hours: 0, minutes: 0, seconds: 0 };

        filteredWorkouts.forEach(w => {
          const h = parseInt(w.duration?.hours || "0");
          const m = parseInt(w.duration?.minutes || "0");
          const s = parseInt(w.duration?.seconds || "0");

          const totalSeconds = h * 3600 + m * 60 + s;
          const maxTotalSeconds =
            maxDuration.hours * 3600 + maxDuration.minutes * 60 + maxDuration.seconds;

          if (totalSeconds > maxTotalSeconds) {
            maxDuration = { hours: h, minutes: m, seconds: s };
          }
        });

        const { hours, minutes, seconds } = maxDuration;
        value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      } else if (rankType === "Max Weight") {
        value = Math.max(...filteredWorkouts.map(w => parseFloat(w.weight || "0")));
      }

      leaderboardEntries.push({ id: uid, name: username, value });
    }

    const sorted = leaderboardEntries
      .sort((a, b) => {
        if (rankType === "Time Spent") {
          const [ah, am, as] = a.value.split(":").map(Number);
          const [bh, bm, bs] = b.value.split(":").map(Number);
          return (bh * 3600 + bm * 60 + bs) - (ah * 3600 + am * 60 + as);
        } else {
          return b.value - a.value;
        }
      })
      .slice(0, 10);

    setSortedLeaderboard(
      sorted.map(entry => {
        if (rankType === "Max Weight") {
          return { ...entry, value: `${entry.value} kg` };
        } else if (rankType === "Time Spent") {
          const [h, m, s] = entry.value.split(":").map(Number);
          const parts = [];
          if (h) parts.push(`${h}h`);
          if (m) parts.push(`${m}m`);
          if (s) parts.push(`${s}s`);
          return { ...entry, value: parts.join(" ") };
        }
        return entry;
      })
    );
  } catch (err) {
    console.error("Failed to update leaderboard:", err);
  } finally {
    setLoadingLeaderboard(false);
  }
};



  useEffect(() => {
    updateLeaderboard();
  }, [leaderboardFilter, rankType]);


  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      if (!user) return;

      const fetchData = async () => {
        setLoadingWorkout(true);
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

          setLoadingWorkout(false);

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

          let signedDiff: string;

          if (!isFinite(extremeDiff)) {
            signedDiff = "None";
            extremeDay = ""; // optional: clear date as well
          } else {
            signedDiff = extremeDiff > 0 ? `+${extremeDiff}` : `${extremeDiff}`;
          }

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

          setLoadingDiet(false);

        } catch (err) {
          console.error("Failed to fetch/update data:", err);
        } finally {
          setLoadingWorkout(false);
          setLoadingDiet(false);
        }
      };

      fetchData();
    }, [user])
  );


  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
      <Animated.Text entering={FadeInDown.delay(200).duration(500).springify()} style={[styles.title, { color: colors.primaryText }]}>
        Welcome Back 👋
      </Animated.Text>

      {/* Leaderboard */}
      <Animated.View entering={FadeInUp.delay(400).duration(500).springify()} style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
        <Text style={[styles.cardTitle, { marginBottom: hp(1.5), color: colors.accentColor }]}>🏆 Leaderboard</Text>
        {false ? (
          <ActivityIndicator size="large" color={colors.secondaryText} style={{ marginVertical: hp(4) }} />
        ) : (
          <>
            <View style={[styles.leaderboardContainer, { borderTopColor: colors.borderColor }]}>
              {/* Ranking for - moved to top */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ paddingTop: hp(1) }}>
                  <Text style={[styles.leaderboardTitle, { color: colors.secondaryText, backgroundColor: isDarkMode ? '#333' : '#E5E7EB' }]}>Ranking for:</Text>
                </View>

                <Dropdown
                  data={WorkoutOptions.map(item => ({ label: item, value: item }))}
                  valueField="value"
                  labelField="label"
                  value={leaderboardFilter}
                  onChange={item => setLeaderboardFilter(item.value)}
                  style={[styles.dropdown, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                  placeholder="(Select Workout)"
                  placeholderStyle={[styles.dropdownText, { color: colors.secondaryText }]}
                  selectedTextStyle={[styles.dropdownText, { color: colors.primaryText }]}
                  itemTextStyle={[styles.dropdownItemText, { color: isDarkMode ? "#E5E7EB" : "black" }]}
                  containerStyle={[styles.dropdownContainer, { backgroundColor: colors.cardBackground }]}
                  search
                  searchPlaceholder="Search"
                  inputSearchStyle={{
                    fontSize: hp(1.5),
                    borderRadius: 30,
                    color: colors.primaryText,
                    backgroundColor: colors.cardBackground,
                  }}
                  maxHeight={hp(20)}
                />
              </View>

              {/* Ranking by - moved below */}
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                borderBottomWidth: wp(0.3), borderBottomColor: colors.borderColor, paddingBottom: hp(0.8)
              }}>
                <View style={{ paddingTop: hp(1) }}>
                  <Text style={[styles.leaderboardTitle, { color: colors.secondaryText, backgroundColor: isDarkMode ? '#333' : '#E5E7EB' }]}>Ranking by:</Text>
                </View>

                <Dropdown
                  data={[
                    { label: "Time Spent", value: "Time Spent" },
                    { label: "Max Weight", value: "Max Weight" },
                  ]}
                  valueField="value"
                  labelField="label"
                  value={rankType}
                  onChange={item => setRankType(item.value)}
                  style={[styles.dropdown, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                  placeholder="(Select Value)"
                  placeholderStyle={[styles.dropdownText, { color: colors.secondaryText }]}
                  selectedTextStyle={[styles.dropdownText, { color: colors.primaryText }]}
                  itemTextStyle={[styles.dropdownItemText, { color: isDarkMode ? "#E5E7EB" : "black" }]}
                  containerStyle={[styles.dropdownContainer, { backgroundColor: colors.cardBackground }]}
                />
              </View>

              {sortedLeaderboard.length === 0 ? (
                <>
                  <Text style={[styles.emptyLeaderboard, { color: colors.tertiaryText }]}>Nothing Here!</Text>
                  <TouchableOpacity onPress={() => router.push("/(popups)/workoutSubmit")}>
                    <Text style={[styles.viewMoreText, { color: colors.accentColor }]}>Be the first one to start!</Text>
                  </TouchableOpacity>
                </>
              ) : loadingLeaderboard ? (
                <ActivityIndicator size="small" color={colors.secondaryText} style={{ marginTop: 10 }} />
              ) : (
                <>
                  {sortedLeaderboard.map((entry, index) => {
                    let placeIcon = ` ${index + 1}.`;
                    if (index === 0) placeIcon = '🥇';
                    else if (index === 1) placeIcon = '🥈';
                    else if (index === 2) placeIcon = '🥉';

                    return (
                      <View key={index} style={styles.leaderboardRow}>
                        <Text style={[styles.leaderboardName, { color: colors.primaryText }]} numberOfLines={1} ellipsizeMode="tail">
                          {placeIcon} {entry.name}
                        </Text>
                        <Text style={[styles.leaderboardValue, { color: colors.secondaryText }]}>
                          {entry.value}
                        </Text>
                      </View>
                    );
                  })}
                </>
              )}
            </View>
          </>
        )}
      </Animated.View>

      {/* Workout Summary */}
      <Animated.View entering={FadeInUp.delay(500).duration(500).springify()} style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
        <Text style={[styles.cardTitle, { color: colors.accentColor }]}>💪 Workout Summary</Text>
        {loadingWorkout ? (
          <ActivityIndicator size="large" color={colors.secondaryText} style={{ marginVertical: hp(4) }} />
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentColor }]}>{numWorkoutsThisWeek}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Workouts This Week</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentColor }]}>{totalWorkoutTimeThisWeek.hours}h {totalWorkoutTimeThisWeek.minutes}m</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Time Spent Grinding</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentColor }]}>{workoutStreak}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Day Streak</Text>
              </View>
            </View>

            <View style={[styles.historyContainer, { borderTopColor: colors.borderColor }]}>
              <Text style={[styles.historyTitle, { color: colors.secondaryText, backgroundColor: isDarkMode ? '#333' : '#E5E7EB' }]}>Workout History:</Text>

              {recentWorkouts.length === 0 ? (
                <>
                  <Text style={[styles.emptyHistory, { color: colors.tertiaryText }]}>Nothing Here!</Text>

                  <TouchableOpacity onPress={() => router.push("/(popups)/workoutSubmit")}>
                    <Text style={[styles.viewMoreText, { color: colors.accentColor }]}>Start now!</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {recentWorkouts.map(workout => (
                    <View key={workout.id} style={styles.historyRow}>
                      <Text style={[styles.historyWorkout, { color: colors.primaryText }]} numberOfLines={1} ellipsizeMode="tail">
                        {workout.name}
                      </Text>

                      <Text style={[styles.historyDate, { color: colors.secondaryText }]}>
                        {`${new Date(workout.timestamp.seconds * 1000).toLocaleDateString('en-GB', { weekday: 'short' })} • ${new Date(workout.timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                      </Text>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => router.push("/(popups)/workoutHistory")}>
                    <Text style={[styles.viewMoreText, { color: colors.accentColor }]}>View more...</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </Animated.View>

      {/* Diet Summary */}
      <Animated.View entering={FadeInUp.delay(600).duration(500).springify()} style={[styles.card, { backgroundColor: colors.cardBackground, shadowColor: colors.shadowColor }]}>
        <Text style={[styles.cardTitle, { color: colors.accentColor }]}>🍎 Diet Summary</Text>
        {loadingDiet ? (
          <ActivityIndicator size="large" color={colors.secondaryText} style={{ marginVertical: hp(4) }} />
        ) : (
          <>
            <View style={[
              styles.statsContainer,
              !targetData && { justifyContent: 'space-evenly' } // if no target, center nicely
            ]}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentColor }]}>{avgCalories}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Avg kcal/day this week</Text>
              </View>

              {targetData && recentMeals.length > 0 && (
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.accentColor }]}>{mostOffDay.diff}</Text>
                  <Text style={[styles.statLabel, { color: colors.secondaryText }]}>
                    {goalType === "deficit" ? "Greatest kcal Deficit" : "Greatest kcal Surplus"}
                  </Text>
                </View>
              )}

              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.accentColor }]}>{dietStreak}</Text>
                <Text style={[styles.statLabel, { color: colors.secondaryText }]}>Day Streak</Text>
              </View>
            </View>

            <View style={[styles.historyContainer, { borderTopColor: colors.borderColor }]}>
              <Text style={[styles.historyTitle, { color: colors.secondaryText, backgroundColor: isDarkMode ? '#333' : '#E5E7EB' }]}>Diet History:</Text>

              {recentMeals.length === 0 ? (
                <>
                  <Text style={[styles.emptyHistory, { color: colors.tertiaryText }]}>Nothing Here!</Text>
                  <TouchableOpacity onPress={() => router.push("/(popups)/dietSubmit")}>
                    <Text style={[styles.viewMoreText, { color: colors.accentColor }]}>Start now!</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  {recentMeals.map(meal => (
                    <View key={meal.id} style={styles.historyRow}>
                      <Text style={[styles.historyWorkout, { color: colors.primaryText }]} numberOfLines={1} ellipsizeMode="tail">
                        {meal.name}
                      </Text>

                      <Text style={[styles.historyDate, { color: colors.secondaryText }]}>
                        {`${new Date(meal.timestamp.seconds * 1000).toLocaleDateString('en-GB', { weekday: 'short' })} • ${new Date(meal.timestamp.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`}
                      </Text>
                    </View>
                  ))}
                  <TouchableOpacity onPress={() => router.push("/(popups)/dietHistory")}>
                    <Text style={[styles.viewMoreText, { color: colors.accentColor }]}>View more...</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        )}
      </Animated.View>
    </ScrollView>
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
    paddingTop: hp(0.8),
    borderTopWidth: wp(0.3),
    borderTopColor: '#E5E7EB',
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
    marginTop: hp(2),

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
  dropdown: {
    height: hp(4),
    width: wp(45),
    borderColor: "#ccc",
    borderWidth: 0.5,
    borderRadius: 20,
    paddingLeft: wp(3),
    paddingRight: wp(1.5),
    backgroundColor: "#fff",
    },
  dropdownText: {
    fontSize: hp(1.5),
    color: "#333",
  },
  dropdownItemText: {
    fontSize: hp(1.5),
  },
  dropdownContainer: {
    borderRadius: 20,
    elevation: 3,
    backgroundColor: "#fff",
  },
});
