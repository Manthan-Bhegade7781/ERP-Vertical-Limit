import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function TeacherProfile() {
    const router = useRouter();
    const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const role = user?.roles?.includes('teacher')
    ? 'Teacher'
    : user?.roles?.[0] || 'User';

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={48}
            color="#5420D8"
          />
        </View>

        <Text style={styles.name}>
          {user?.fullName || 'Teacher'}
        </Text>

        <Text style={styles.role}>
          {role}
        </Text>
      </View>

      {/* Account Information */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Account Information
        </Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="person-outline"
            size={22}
            color="#5420D8"
          />

          <View style={styles.infoContent}>
            <Text style={styles.label}>
              Full Name
            </Text>

            <Text style={styles.value}>
              {user?.fullName || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons
            name="mail-outline"
            size={22}
            color="#5420D8"
          />

          <View style={styles.infoContent}>
            <Text style={styles.label}>
              Email
            </Text>

            <Text style={styles.value}>
              {user?.email || '-'}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={22}
            color="#5420D8"
          />

          <View style={styles.infoContent}>
            <Text style={styles.label}>
              Role
            </Text>

            <Text style={styles.value}>
              {role}
            </Text>
          </View>
        </View>
      </View>

      {/* Logout */}
      <Pressable
        style={({ pressed }) => [
          styles.logoutButton,
          pressed && styles.logoutPressed,
        ]}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={24}
          color="#D32F2F"
        />

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    backgroundColor: '#F7F7FA',
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },

  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  name: {
    fontSize: 24,
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
  },

  role: {
    marginTop: 2,
    fontSize: 15,
    color: '#687080',
    fontFamily: 'PoppinsRegular',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },

  sectionTitle: {
    fontSize: 18,
    color: '#111528',
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 18,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 14,
  },

  label: {
    fontSize: 12,
    color: '#687080',
    fontFamily: 'PoppinsRegular',
  },

  value: {
    marginTop: 2,
    fontSize: 15,
    color: '#111528',
    fontFamily: 'PoppinsMedium',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEF2',
    marginVertical: 16,
  },

  logoutButton: {
    marginTop: 24,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1CACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  logoutText: {
    fontSize: 16,
    color: '#D32F2F',
    fontFamily: 'PoppinsSemiBold',
  },

  logoutPressed: {
    opacity: 0.7,
  },
});