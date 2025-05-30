import React, { useState } from "react";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import MomentumLogo from "../../assets/images/MomentumLogo.png";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

const Login = () => {
  const router = useRouter();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={{ marginTop: -useHeaderHeight() / 2 }} className="flex-1 h-full justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm">
        <Image className="h-32 w-32 mx-auto" source={MomentumLogo} />
        <Text className="text-center text-2xl font-bold tracking-tight text-gray-900 mt-4">
          Sign in to your account
        </Text>

        <View className="mt-6 space-y-6">
          <View className="pb-3">
            <Text className="text-sm font-medium text-gray-900">
              Username
            </Text>
            <TextInput
              className="mt-2 px-3 py-2 bg-white text-base text-gray-900 rounded-md border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600"
              placeholder="Username"
              autoCapitalize="none"
              onChangeText={(name) => {setUsername(name)}}
            />
          </View>

          <View className="pb-4">
            <View className="flex flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-900">
                Password
              </Text>
              <TouchableOpacity>
                <Text className="text-sm font-semibold text-indigo-600">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              className="mt-2 px-3 py-2 bg-white text-base text-gray-900 rounded-md border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              onChangeText={(pw) => {setPassword(pw)}}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            disabled={!username || !password }
            onPress={() => {
              router.replace("/(tabs)");
            }}
            className={`w-full bg-indigo-600 py-3 rounded-lg shadow-sm items-center hover:bg-indigo-500
              ${!username || !password ? "opacity-50" : ""}
              `}>
            <Text className="text-white font-semibold text-sm">Sign in</Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
};

export default Login;
