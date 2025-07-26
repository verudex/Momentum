// components/FriendsPage.tsx
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import { ThemeContext } from "../../contexts/ThemeContext";
import {
  searchUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendsList,
  getUserData,
} from "../../utils/friendsLogic";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";
import { useRouter } from "expo-router";

const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

type UserSummary = {
  uid: string;
  username: string;
  photoURL?: string;
};

const FriendsPage = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === "dark";

  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [friendInput, setFriendInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [searchResult, setSearchResult] = useState<UserSummary | null>(null);
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<UserSummary[]>([]);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchReceivedRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;
    setIsLoadingFriends(true);
    const friendUids = await getFriendsList(user.uid);
    const profiles = await Promise.all(
      friendUids.map(async (uid) => {
        const data = await getUserData(uid);
        return data ? { uid, username: data.username, photoURL: data.photoURL } : null;
      })
    );
    setFriends(profiles.filter(Boolean) as UserSummary[]);
    setIsLoadingFriends(false);
  };

  const fetchReceivedRequests = async () => {
    if (!user) return;
    setIsLoadingRequests(true);
    const data = await getUserData(user.uid);
    const requestUids = data?.receivedRequests || [];
    const profiles = await Promise.all(
      requestUids.map(async (uid: string) => {
        const data = await getUserData(uid);
        return data ? { uid, username: data.username, photoURL: data.photoURL } : null;
      })
    );
    setReceivedRequests(profiles.filter(Boolean) as UserSummary[]);
    setIsLoadingRequests(false);
  };

  const handleSearch = async () => {
    if (!usernameInput) return;
    const found = await searchUserByUsername(usernameInput.trim());
    if (!found) {
      Alert.alert("User not found");
      return;
    }
    setSearchResult({ uid: found.uid, username: found.username, photoURL: found.photoURL });
  };

  const handleSendRequest = async () => {
    if (!user || !searchResult) return;
    await sendFriendRequest(user.uid, searchResult.uid);
    Alert.alert("Friend request sent!");
    setSearchResult(null);
  };

  const handleAcceptRequest = async (senderUid: string) => {
    if (!user) return;
    await acceptFriendRequest(user.uid, senderUid);
    Alert.alert("Friend request accepted!");
    fetchFriends();
    fetchReceivedRequests();
  };

  const handleRejectRequest = async (senderUid: string) => {
    if (!user) return;
    await cancelFriendRequest(senderUid, user.uid);
    Alert.alert("Friend request rejected");
    fetchReceivedRequests();
  };

  const handleUnfriend = async (friendUid: string) => {
    if (!user) return;
    await removeFriend(user.uid, friendUid);
    Alert.alert("Unfriended");
    fetchFriends();
  };

  const renderUserCard = (item: UserSummary, actions: React.ReactNode) => (
    <View
      style={[
        styles.card,
        { backgroundColor: isDarkMode ? "#1E1E1E" : "white", borderColor: isDarkMode ? "#333" : "rgba(0,0,0,0.1)" },
      ]}
    >
      <TouchableOpacity
        style={styles.profileInfo}
        onPress={() =>
          router.push({
            pathname: "/(popups)/friendProfile",
            params: { uid: item.uid, name: item.username, photo: item.photoURL },
          })
        }
      >
        <Image source={{ uri: item.photoURL || DEFAULT_AVATAR }} style={styles.avatar} />
        <Text style={[styles.username, { color: isDarkMode ? "#E0E0E0" : "#111827" }]}>{item.username}</Text>
      </TouchableOpacity>
      <View style={styles.cardButtons}>{actions}</View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#F9FAFB" }]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "friends" && {
              borderBottomColor: "#7C3AED",
              backgroundColor: isDarkMode ? "#2A2A2A" : undefined,
            },
          ]}
          onPress={() => {
            setActiveTab('friends');
            fetchFriends(); // Manually Trigger
          }}
        >
          <Text style={[styles.tabText, { color: isDarkMode ? "#E0E0E0" : "#111827" }]}>Your Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "requests" && {
              borderBottomColor: "#7C3AED",
              backgroundColor: isDarkMode ? "#2A2A2A" : undefined,
            },
          ]}
          onPress={() => {
            setActiveTab("requests");
            fetchReceivedRequests(); // Manually Trigger 
            }}
        >
          <Text style={[styles.tabText, { color: isDarkMode ? "#E0E0E0" : "#111827" }]}>Friend Requests</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "friends" ? (
        isLoadingFriends ? (
          <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: hp(2) }} />
        ) : (
          <>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                  color: isDarkMode ? "#E0E0E0" : "#111827",
                  borderColor: isDarkMode ? "#444" : "#ccc",
                },
              ]}
              placeholder="Search Friend..."
              placeholderTextColor={isDarkMode ? "#888" : "#999"}
              value={friendInput}
              onChangeText={setFriendInput}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: hp(10) }}>
              {friends.filter((friend) => friend.username.toLowerCase().includes(friendInput.trim().toLowerCase())).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: isDarkMode ? "#9CA3AF" : "#6B7280" }]}>
                    You have no friends 😢
                  </Text>
                  <Text style={[styles.emptyText, { color: isDarkMode ? "#9CA3AF" : "#6B7280" }]}>
                    Start by adding some! 😊
                  </Text>
                </View>
              ) : (
                friends
                  .filter((friend) => friend.username.toLowerCase().includes(friendInput.trim().toLowerCase()))
                  .map((item) => (
                    <View key={item.uid}>
                      {renderUserCard(item, (
                        <TouchableOpacity onPress={() => handleUnfriend(item.uid)}>
                          <Text style={[styles.actionText, { color: "red" }]}>Unfriend</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))
              )}
            </ScrollView>
          </>
        )
      ) : (
        <>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? "#1E1E1E" : "#fff",
                color: isDarkMode ? "#E0E0E0" : "#111827",
                borderColor: isDarkMode ? "#444" : "#ccc",
              },
            ]}
            placeholder="Search Username..."
            placeholderTextColor={isDarkMode ? "#888" : "#999"}
            value={usernameInput}
            onChangeText={setUsernameInput}
          />
          <TouchableOpacity style={[styles.button, { backgroundColor: "#7C3AED" }]} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>

          {searchResult && (
            <View
              style={[
                styles.card,
                { backgroundColor: isDarkMode ? "#1E1E1E" : "white", borderColor: isDarkMode ? "#333" : "rgba(0,0,0,0.1)" },
              ]}
            >
              <Image source={{ uri: searchResult.photoURL || DEFAULT_AVATAR }} style={styles.avatar} />
              <Text style={[styles.username, { color: isDarkMode ? "#E0E0E0" : "#111827" }]}>{searchResult.username}</Text>
              <TouchableOpacity style={styles.actionBtn} onPress={handleSendRequest}>
                <Text style={styles.actionText}>Send Friend Request</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.subHeader, { color: isDarkMode ? "#9CA3AF" : "#4B5563", backgroundColor: isDarkMode ? "#2A2A2A" : "#E5E7EB" }]}>
            Received Requests:
          </Text>

          {isLoadingRequests ? (
            <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: hp(2) }} />
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: hp(10) }}>
              {receivedRequests.map((item) => (
                <View key={item.uid}>
                  {renderUserCard(item, (
                    <>
                      <TouchableOpacity onPress={() => handleAcceptRequest(item.uid)}>
                        <Text style={[styles.actionText, { color: "green" }]}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleRejectRequest(item.uid)}>
                        <Text style={[styles.actionText, { color: "red" }]}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

export default FriendsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  tab: {
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(6),
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#7C3AED",
  },
  tabText: {
    fontSize: wp(4),
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: hp(1.8),
    paddingHorizontal: wp(5),
    marginTop: hp(2),
    marginBottom: hp(1),
    fontSize: hp(1.7),
  },
  button: {
    backgroundColor: "#7C3AED",
    paddingVertical: hp(1),
    borderRadius: 20,
    alignItems: "center",
    marginHorizontal: wp(1),
  },
  buttonText: {
    fontSize: wp(4),
    color: "white",
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: hp(2),
    fontWeight: "bold",
    paddingHorizontal: wp(8),
    paddingVertical: hp(0.8),
    borderRadius: 9999,
    alignSelf: "center",
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: hp(20),
    paddingHorizontal: wp(10),
  },
  emptyText: {
    fontSize: wp(5.5),
    textAlign: "center",
    marginBottom: hp(1),
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    marginVertical: hp(1.5),
    marginHorizontal: wp(3),
    shadowColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.1,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
    marginBottom: hp(3),
  },
  avatar: {
    width: wp(18),
    height: hp(8),
    borderRadius: 999,
  },
  username: {
    fontSize: wp(4),
    fontWeight: "500",
    marginTop: hp(1),
    marginBottom: hp(1.5),
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: wp(6),
  },
  actionBtn: {
    width: "100%",
    backgroundColor: "#007AFF",
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    marginLeft: wp(2),
  },
  actionText: {
    color: "white",
    fontWeight: "600",
    fontSize: wp(4),
    alignSelf: "center",
  },
});
