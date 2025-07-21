import React, { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Animated, { FadeInUp, FadeInLeft } from 'react-native-reanimated';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../../contexts/AuthContext';
import { getAuth, updatePassword } from 'firebase/auth';

const ChangePassword = () => {
  const { user } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth();

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("Please fill in both fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (!user || !user.uid) {
      Alert.alert('You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(auth.currentUser!, newPassword);
      Alert.alert('Success', 'Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Animated.Text entering={FadeInUp.springify()} style={styles.title}>Change Password</Animated.Text>

      <Animated.View entering={FadeInLeft.delay(200).springify()} style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={(pw) => {
            setNewPassword(pw);
            if (passwordError) setPasswordError('');
            if (confirmPassword) {
              setPasswordError(pw !== confirmPassword ? "Passwords do not match." : "");
            }
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInLeft.delay(300).springify()} style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!showPassword}
          value={confirmPassword}
          onChangeText={(pw) => {
            setConfirmPassword(pw);
            if (passwordError) setPasswordError('');
            setPasswordError(newPassword && pw !== newPassword ? "Passwords do not match." : "");
          }}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.eyeIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
        </TouchableOpacity>
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
      </Animated.View>

      <Animated.View entering={FadeInLeft.delay(400).springify()}>
        <TouchableOpacity onPress={handlePasswordChange} style={styles.submitButton} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  contentContainer: {
    paddingTop: hp(15),
    paddingHorizontal: wp(8),
  },
  title: {
    fontSize: hp(4.5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(3)
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: hp(2),
  },
  input: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(2.7),
    borderRadius: 30,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: hp(2),
    color: '#111827',
    backgroundColor: 'white'
  },
  eyeIcon: {
    position: 'absolute',
    right: wp(6),
    top: hp(4),
    transform: [{ translateY: -10 }],
  },
  error: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    marginLeft: wp(2),
  },
  submitButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: hp(2),
    borderRadius: 30,
    alignItems: 'center'
  },
  submitButtonText: {
    color: 'white',
    fontSize: hp(2.5),
    fontWeight: 'bold'
  }
});

export default ChangePassword;
