import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { app } from "./firebaseConfig";
import { User } from "firebase/auth";


// Init Firestore
export const db = getFirestore(app);

// Utility for testing data insert
export const dataTest = async () => {
  console.log("running test");

  try {
    await setDoc(doc(collection(db, "Users")), {
      name: "Test",
      age: 30,
    });
    console.log("User added!");
  } catch (error) {
    console.error("Data test failed:", error);
  }
};

// Create a user document
export const createUserProfile = async (user: User) => {
  const userRef = doc(db, "userData", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    // Profile already exists — skip creation
    return userRef;
  }

  const userData = {
    uid: user.uid,
    email: user.email || "",
    username: user.displayName || "",
    photoURL: user.photoURL || "",
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp(),
    friends: [],
    sentRequests: [],
    receivedRequests: [],
  };

  await setDoc(userRef, userData);
  return userRef;
};

// Get user document
export const getUserData = async (userId: string) => {
  const userRef = doc(db, "userData", userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// Add/update a workout
export const addWorkoutData = async (
  userId: string,
  workoutName: string,
  duration: string,
  sets: string,
  reps: string,
  weight: string
) => {
  const workoutRef = doc(db, "userData", userId, "workouts", workoutName);
  const snapshot = await getDoc(workoutRef);

  const data = {
    Name: workoutName,
    Duration: duration,
    Sets: sets,
    Reps: reps,
    Weight: weight,
  };

  if (snapshot.exists()) {
    await updateDoc(workoutRef, data);
  } else {
    await setDoc(workoutRef, data);
  }
};




