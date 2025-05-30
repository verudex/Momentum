import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import MomentumLogo from "../../assets/images/MomentumLogo.png";

export const navigationOptions = {
  headerShown: false,
};

const Login = () => {
  return (
    <View className="flex-1 h-full justify-center items-center bg-white px-6">
      <View className="w-full max-w-sm">
        <Image className="h-10 w-auto mx-auto" source={MomentumLogo} />
        <Text className="text-center text-2xl font-bold tracking-tight text-gray-900 mt-4">
          Sign in to your account
        </Text>

        <View className="mt-6 space-y-6">
          <View>
            <Text className="text-sm font-medium text-gray-900">
              Email address
            </Text>
            <TextInput
              className="mt-2 px-3 py-2 bg-white text-base text-gray-900 rounded-md border border-gray-300 placeholder:text-gray-400 focus:border-indigo-600"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View>
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
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
            />
          </View>

          <TouchableOpacity className="w-full bg-indigo-600 py-3 rounded-md shadow-sm items-center hover:bg-indigo-500">
            <Text className="text-white font-semibold text-sm">Sign in</Text>
          </TouchableOpacity>

          <Text className="text-center text-sm text-gray-500">
            Not a member?{" "}
            <Text className="font-semibold text-indigo-600">
              Start a 14 day free trial
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default Login;
