import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Create a user document when first signing up
export const createUserProfile = async (user) => {
    const userCollection = firestore().collection(userData).doc(user.uid);

    await userCollection.set({
        uid: user.uid,
        email: user.email,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastLogin: firestore.FieldValue.serverTimestamp(),
    });

    // Setup workout collection for each user
    firestore().collection(userData).doc(user.uid).collection(workoutData);

    return userCollection;
};

// Get user data
export const getUserData = async (userId) => {
  const snapshot = await firestore()
    .collection('userData')
    .doc(userId)
    .get();
    
  return snapshot.exists ? snapshot.data() : null;
};

// Add user Workout data
export const addWorkoutData = 
    async (userId, workoutName, duration, sets, reps) => {
    const workoutRef = firestore()
        .collection(userData)
        .doc(userId)
        .collection(workouts)
        .doc(workoutName);

    const snapshot = await workoutRef.get();
    if (snapshot.exists) { // E.g If benching collection already exists / workout logged before
        await workoutRef.update({
            Name: workoutName,
            Duration: duration,
            Sets: sets,
            Reps: reps
        })
    } else {
        await workoutRef.set({
            Name: workoutName,
            Duration: duration,
            Sets: sets,
            Reps: reps
        });
    }
}