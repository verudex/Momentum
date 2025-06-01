import { createContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router'; // Add this import

// Create context with proper initial value
export const AuthContext = createContext({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }) {
  const router = useRouter(); // Initialize router here
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      
      // Handle navigation inside the provider
      if (user) {
        router.replace("/(tabs)/home");
      } else {
        router.replace("/login");
      }
    });
    return subscriber; // Unsubscribe on unmount
  }, [initializing, router]); // Add router to dependencies

  const value = {
    user,
    initializing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}