import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
} from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const PasswordResetButton = () => {
  const [email, setEmail] = useState('');
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === 'dark';

  const auth = getAuth();

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email Sent', 'Check your inbox to reset your password.');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message);
    }
  };

  const styles = getStyles(isDark);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Reset Your Password</Text>

        <TextInput
          placeholder="example@email.com"
          placeholderTextColor={isDark ? '#aaa' : '#666'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={handlePasswordReset}>
          <Text style={styles.buttonText}>Send Reset Email</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PasswordResetButton;

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      width: '100%',
      maxWidth: 400,
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
      color: isDark ? '#f1f5f9' : '#1e293b',
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? '#334155' : '#cbd5e1',
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      color: isDark ? '#f8fafc' : '#0f172a',
    },
    button: {
      backgroundColor: '#3b82f6',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 16,
    },
  });
