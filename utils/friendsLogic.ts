import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from './userFirestore';

// Search for users by exact username match
export const searchUserByUsername = async (username: string) => {
  const usersRef = collection(db, "userData");
  const q = query(usersRef, where("username", "==", username));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) return null;

  const userDoc = querySnapshot.docs[0];
  return { uid: userDoc.id, username: userDoc.data().username, photoURL: userDoc.data().photoURL ?? null };
};

// Send a friend request from 'fromUid' to 'toUid'
export const sendFriendRequest = async (fromUid: string, toUid: string) => {
  if (fromUid === toUid) throw new Error("Cannot send friend request to yourself");

  const fromRef = doc(db, "userData", fromUid);
  const toRef = doc(db, "userData", toUid);

  const fromSnap = await getDoc(fromRef);
  const toSnap = await getDoc(toRef);

  if (!fromSnap.exists() || !toSnap.exists()) throw new Error("User not found");

  const fromData = fromSnap.data()!;
  const toData = toSnap.data()!;

  // Add toUid to fromUser's sentRequests, avoiding duplicates
  const newSentRequests = Array.from(new Set([...(fromData.sentRequests || []), toUid]));

  // Add fromUid to toUser's receivedRequests, avoiding duplicates
  const newReceivedRequests = Array.from(new Set([...(toData.receivedRequests || []), fromUid]));

  await updateDoc(fromRef, {
    sentRequests: newSentRequests,
  });

  await updateDoc(toRef, {
    receivedRequests: newReceivedRequests,
  });
};

// Get full user data from uid
export const getUserData = async (uid: string) => {
  const userRef = doc(db, "userData", uid);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// Accept a friend request: currentUid accepts senderUid's request
export const acceptFriendRequest = async (currentUid: string, senderUid: string) => {
  if (currentUid === senderUid) throw new Error("Invalid operation");

  const currentRef = doc(db, "userData", currentUid);
  const senderRef = doc(db, "userData", senderUid);

  const currentSnap = await getDoc(currentRef);
  const senderSnap = await getDoc(senderRef);

  if (!currentSnap.exists() || !senderSnap.exists()) throw new Error("User not found");

  const currentData = currentSnap.data()!;
  const senderData = senderSnap.data()!;

  // Remove senderUid from current user's receivedRequests
  const updatedReceivedRequests = (currentData.receivedRequests || []).filter(
    (id: string) => id !== senderUid
  );

  // Add senderUid to current user's friends list (avoid duplicates)
  const updatedFriendsCurrent = Array.from(new Set([...(currentData.friends || []), senderUid]));

  // Remove currentUid from sender user's sentRequests
  const updatedSentRequests = (senderData.sentRequests || []).filter(
    (id: string) => id !== currentUid
  );

  // Add currentUid to sender user's friends list (avoid duplicates)
  const updatedFriendsSender = Array.from(new Set([...(senderData.friends || []), currentUid]));

  // Update both documents atomically (not a transaction, but sequential)
  await updateDoc(currentRef, {
    receivedRequests: updatedReceivedRequests,
    friends: updatedFriendsCurrent,
  });

  await updateDoc(senderRef, {
    sentRequests: updatedSentRequests,
    friends: updatedFriendsSender,
  });
};

// Reject/cancel friend request from 'fromUid' to 'toUid'
export const cancelFriendRequest = async (fromUid: string, toUid: string) => {
  if (fromUid === toUid) throw new Error("Invalid operation");

  const fromRef = doc(db, "userData", fromUid);
  const toRef = doc(db, "userData", toUid);

  const fromSnap = await getDoc(fromRef);
  const toSnap = await getDoc(toRef);

  if (!fromSnap.exists() || !toSnap.exists()) throw new Error("User not found");

  const fromData = fromSnap.data()!;
  const toData = toSnap.data()!;

  // Remove toUid from fromUser's sentRequests
  const updatedSentRequests = (fromData.sentRequests || []).filter(
    (id: string) => id !== toUid
  );

  // Remove fromUid from toUser's receivedRequests
  const updatedReceivedRequests = (toData.receivedRequests || []).filter(
    (id: string) => id !== fromUid
  );

  await updateDoc(fromRef, { sentRequests: updatedSentRequests });
  await updateDoc(toRef, { receivedRequests: updatedReceivedRequests });
};

// Get friend list
export const getFriendsList = async (uid: string): Promise<string[]> => {
  const userRef = doc(db, "userData", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return [];

  const data = snapshot.data()!;
  return data.friends ?? [];
};

// Unfriend
export const removeFriend = async (uid1: string, uid2: string) => {
  if (uid1 === uid2) throw new Error("Cannot remove yourself as a friend");

  const user1Ref = doc(db, "userData", uid1);
  const user2Ref = doc(db, "userData", uid2);

  const user1Snap = await getDoc(user1Ref);
  const user2Snap = await getDoc(user2Ref);

  if (!user1Snap.exists() || !user2Snap.exists()) {
    throw new Error("One or both users not found");
  }

  const user1Data = user1Snap.data()!;
  const user2Data = user2Snap.data()!;

  const updatedUser1Friends = (user1Data.friends || []).filter(
    (id: string) => id !== uid2
  );
  const updatedUser2Friends = (user2Data.friends || []).filter(
    (id: string) => id !== uid1
  );

  await updateDoc(user1Ref, { friends: updatedUser1Friends });
  await updateDoc(user2Ref, { friends: updatedUser2Friends });
};

