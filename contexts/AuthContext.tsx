import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { app } from "../utils/firebaseConfig";

// Define user type from Web SDK
type FirebaseUser = User | null;

// Context shape
interface AuthContextType {
  user: FirebaseUser;
  setUser: React.Dispatch<React.SetStateAction<FirebaseUser>>;
  initializing: boolean;
  signInMethod: string | null;
  setSignInMethod: React.Dispatch<React.SetStateAction<string | null>>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => null,
  initializing: true,
  signInMethod: null,
  setSignInMethod: () => null,
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser>(null);
  const [initializing, setInitializing] = useState(true);
  const [signInMethod, setSignInMethod] = useState<string | null>(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      // Check if it's a password user AND not verified
      if (
        firebaseUser &&
        !firebaseUser.emailVerified &&
        firebaseUser.providerData[0]?.providerId === "password"
      ) {
        await signOut(authInstance);
        setUser(null);
        setInitializing(false);
        return;
      }

      setUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Only run navigation AFTER initializing is done
    if (!initializing) {
      if (user) {
        router.replace("/(tabs)/home");
      }
    }
  }, [initializing, user]);

  if (initializing) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, signInMethod, setSignInMethod }}>
      {children}
    </AuthContext.Provider>
  );
}
