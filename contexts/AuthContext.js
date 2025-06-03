import { createContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { useRouter } from 'expo-router'; // Add this import

// Create context with proper initial value
export const AuthContext = createContext({
  user: null,
  initializing: true,
  signInMethod: null,
});

export function AuthProvider({ children }) {
  const router = useRouter(); // Initialize router here
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [signInMethod, setSignInMethod] = useState(null);

useEffect(() => {
    const subscriber = auth().onAuthStateChanged((authUser) => {
      setUser(authUser);
      if (initializing) setInitializing(false);
      if (authUser) router.replace("/(tabs)/home");
    });
    return subscriber;
  }, [initializing, router]);

  const value = {
    user,
    initializing,
    signInMethod,
    setSignInMethod,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}