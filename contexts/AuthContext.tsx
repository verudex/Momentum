import React, { createContext, useEffect, useState, ReactNode } from "react";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";

// Define user type from Firebase
type FirebaseUser = FirebaseAuthTypes.User | null;

// Context shape
interface AuthContextType {
  user: FirebaseUser;
  setUser: React.Dispatch<React.SetStateAction<FirebaseUser>>;
  initializing: boolean;
  signInMethod: string | null;
  setSignInMethod: React.Dispatch<React.SetStateAction<string | null>>;
}

// Provide default values that match the type
export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => null,
  initializing: true,
  signInMethod: null,
  setSignInMethod: () => null,
});

// Props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializing, setInitializing] = useState(true);
  const [signInMethod, setSignInMethod] = useState<string | null>(null);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      setUser(user); // ✅ Now properly typed
      if (initializing) setInitializing(false);
    });
    return subscriber;
  }, [initializing]);

  const value: AuthContextType = {
    user,
    setUser,
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
