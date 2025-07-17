// components/FriendsPage.tsx
import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { AuthContext } from "../../contexts/AuthContext";
import {
  searchUserByUsername,
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getFriendsList,
  getUserData,
} from "../../utils/friendsLogic";
import { useRouter } from "expo-router";

type UserSummary = {
  uid: string;
  username: string;
  photoURL?: string;
};

const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // fallback avatar

const FriendsPage = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [usernameInput, setUsernameInput] = useState("");
  const [searchResult, setSearchResult] = useState<UserSummary | null>(null);
  const [friends, setFriends] = useState<UserSummary[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<UserSummary[]>([]);

  const fetchFriends = async () => {
    if (!user) return;
    const friendUids = await getFriendsList(user.uid);
    const profiles = await Promise.all(
      friendUids.map(async (uid) => {
        const data = await getUserData(uid);
        return data ? { uid, username: data.username, photoURL: data.photoURL } : null;
      })
    );
    setFriends(profiles.filter(Boolean) as UserSummary[]);
  };

  const fetchReceivedRequests = async () => {
    if (!user) return;
    const data = await getUserData(user.uid);
    const requestUids = data?.receivedRequests || [];

    const profiles = await Promise.all(
      requestUids.map(async (uid: string) => {
        const data = await getUserData(uid);
        return data ? { uid, username: data.username, photoURL: data.photoURL } : null;
      })
    );
    setReceivedRequests(profiles.filter(Boolean) as UserSummary[]);
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
    await removeFriend(user.uid, friendUid); // same function removes both sides
    Alert.alert("Unfriended");
    fetchFriends();
  };

  useEffect(() => {
    fetchFriends();
    fetchReceivedRequests();
  }, [user]);

  const renderUserCard = (
    item: UserSummary,
    actions: React.ReactNode
  ) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.profileInfo}
        onPress={() => router.push({ pathname: "/(popups)/friendProfile", params: { uid: item.uid, name: item.username, photo: item.photoURL } })}
      >
        <Image
          source={{ uri: item.photoURL || DEFAULT_AVATAR }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{item.username}</Text>
      </TouchableOpacity>
      <View style={styles.cardButtons}>{actions}</View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Friends</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by username"
        value={usernameInput}
        onChangeText={setUsernameInput}
      />

      <TouchableOpacity style={styles.button} onPress={handleSearch}>
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>

      {searchResult && (
        <View style={styles.card}>
          <Image
            source={{ uri: searchResult.photoURL || DEFAULT_AVATAR }}
            style={styles.avatar}
          />
          <Text style={styles.username}>{searchResult.username}</Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleSendRequest}>
            <Text style={styles.actionText}>Send Friend Request</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.subHeader}>Your Friends:</Text>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) =>
          renderUserCard(item, (
            <TouchableOpacity onPress={() => handleUnfriend(item.uid)}>
              <Text style={styles.actionText}>Unfriend</Text>
            </TouchableOpacity>
          ))
        }
      />

      <Text style={styles.subHeader}>Received Requests:</Text>
      <FlatList
        data={receivedRequests}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) =>
          renderUserCard(item, (
            <>
              <TouchableOpacity onPress={() => handleAcceptRequest(item.uid)}>
                <Text style={[styles.actionText, { color: "green" }]}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRejectRequest(item.uid)}>
                <Text style={[styles.actionText, { color: "red" }]}>Reject</Text>
              </TouchableOpacity>
            </>
          ))
        }
      />
    </View>
  );
};

export default FriendsPage;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  subHeader: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#aaa",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 12,
  },
  actionBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  actionText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
