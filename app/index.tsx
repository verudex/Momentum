import { useEffect } from "react";
import { useRouter } from "expo-router";
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '12153493344-qbhdurglltd38a6boc6jke2vpnmgtmn0.apps.googleusercontent.com',
    });
    
    router.replace("/(auth)/startup");
  }, []);

  return null;
}
