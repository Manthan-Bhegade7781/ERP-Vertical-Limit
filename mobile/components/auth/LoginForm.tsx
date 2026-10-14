import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AuthInput from './AuthInput';
import { AuthScreen } from './AuthScreen';
import { useAuth } from '@/context/AuthContext';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
  // Required fields
  if (!email.trim() || !password) {
    Alert.alert(
      'Missing details',
      'Please enter your email and password.'
    );
    return;
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    Alert.alert(
      'Invalid Email',
      'Please enter a valid email address.'
    );
    return;
  }

  try {
    const result = await login(
      email.trim(),
      password
    );

    if (!result.success) {
      Alert.alert(
        'Login failed',
        result.message || 'Unable to login.'
      );
      return;
    }

    Alert.alert(
      'Login successful',
      `Welcome back, ${result.data?.user.fullName || 'User'}!`,
      [
        {
          text: 'Continue',
          onPress: () => {
            router.replace('/(tabs)');
          },
        },
      ]
    );
  } catch (error) {
    console.error('Login error:', error);

    Alert.alert(
      'Connection error',
      'Unable to connect to the server. Please try again.'
    );
  }
};

  return (
    <AuthScreen footer={false}>
      {/* =========================
          HEADING
      ========================== */}

      <View style={styles.heading}>
        <Text style={styles.title}>
          Welcome Back!
        </Text>

        <Text style={styles.subtitle}>
          Login to continue to your account
        </Text>
      </View>

      {/* =========================
          EMAIL
      ========================== */}

      <AuthInput
        label="Email"
        icon="mail-outline"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* =========================
          PASSWORD
      ========================== */}

      <AuthInput
        label="Password"
        icon="lock-closed-outline"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
      />

      {/* =========================
          FORGOT PASSWORD
      ========================== */}

      <TouchableOpacity
        style={styles.forgotButton}
        activeOpacity={0.7}
        onPress={() => {
          Alert.alert(
            'Forgot Password',
            'Password reset functionality will be added here.'
          );
        }}
      >
        <Text style={styles.forgotText}>
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* =========================
          LOGIN BUTTON
      ========================== */}

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.primaryButton}
        onPress={handleLogin}
      >
        <Text style={styles.primaryText}>
          Login
        </Text>
      </TouchableOpacity>

      {/* =========================
          OR
      ========================== */}

      <View style={styles.orContainer}>
        <View style={styles.orLine} />

        <Text style={styles.orText}>
          OR
        </Text>

        <View style={styles.orLine} />
      </View>

      {/* =========================
          REGISTER
      ========================== */}

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerLink}>
            {' '}Register
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreen>
  );
}

/* =========================================
   STYLES
========================================= */

const styles = StyleSheet.create({
  heading: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 27,
    color: '#202126',
  },

  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'PoppinsRegular',
    fontSize: 14,
    color: '#77767D',
    paddingHorizontal: 20,
  },

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -6,
    marginBottom: 5,
  },

  forgotText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#5A2EC4',
    fontSize: 13,
  },

  primaryButton: {
    height: 55,
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: '#5A2EC4',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#5A2EC4',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 5,
  },

  primaryText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
    fontSize: 17,
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#DDDBE3',
  },

  orText: {
    marginHorizontal: 16,
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#88858F',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  registerText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#77767D',
  },

  registerLink: {
    fontFamily: 'PoppinsSemiBold',
    color: '#5A2EC4',
    fontSize: 13,
  },
});