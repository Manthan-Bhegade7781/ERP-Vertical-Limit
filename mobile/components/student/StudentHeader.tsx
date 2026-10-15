import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StudentHeaderProps = {
  onNotificationPress?: () => void;
  onMenuPress?: () => void;
};

export default function StudentHeader({
  onNotificationPress,
  onMenuPress,
}: StudentHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <StatusBar
        style="light"
        backgroundColor="#6630D7"
      />

      <View style={styles.headerRow}>

        {/* MENU */}
        <Pressable
          onPress={onMenuPress}
          style={styles.menuButton}
          hitSlop={8}
        >
          <Ionicons
            name="menu-outline"
            size={28}
            color="#FFFFFF"
          />
        </Pressable>

        {/* STUDENT INFORMATION */}
        <View style={styles.studentContainer}>
          <Text style={styles.greeting}>
            Good Morning, 👋
          </Text>

          <Text style={styles.studentName}>
            Aarav Mehta
          </Text>

          <Text style={styles.studentDetails}>
            10th Standard • Student
          </Text>
        </View>

        {/* NOTIFICATION */}
        <Pressable
          onPress={onNotificationPress}
          style={styles.notificationButton}
          hitSlop={8}
        >
          <Ionicons
            name="notifications-outline"
            size={27}
            color="#FFFFFF"
          />

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              5
            </Text>
          </View>
        </Pressable>

        {/* PROFILE */}
        <View style={styles.profileCircle}>
          <Ionicons
            name="person"
            size={25}
            color="#6630D7"
          />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#6630D7',
     marginTop: 17,
    paddingHorizontal: 17,
    paddingVertical: 20,

    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'center',
  },

  /* =========================
     MENU
  ========================= */

  menuButton: {
    width: 46,
    height: 46,

    borderRadius: 14,

    backgroundColor:
      'rgba(255,255,255,0.10)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 9,

    flexShrink: 0,
  },

  /* =========================
     STUDENT INFO
  ========================= */

  studentContainer: {
    flex: 1,

    minWidth: 0,

    justifyContent: 'center',

    marginRight: 5,
  },

  greeting: {
    fontFamily: 'PoppinsRegular',

    fontSize: 15,

    color: '#E9DDFF',

    lineHeight: 17,
  },

  studentName: {
    fontFamily: 'PoppinsBold',

    fontSize: 21,

    color: '#FFFFFF',

    lineHeight: 27,

    includeFontPadding: false,
  },

  studentDetails: {
    fontFamily: 'PoppinsMedium',

    fontSize: 10,

    color: '#DCCBFF',

    lineHeight: 14,

    marginTop: 1,
  },

  /* =========================
     NOTIFICATION
  ========================= */

  notificationButton: {
    width: 44,
    height: 44,

    borderRadius: 14,

    backgroundColor:
      'rgba(255,255,255,0.10)',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 7,

    position: 'relative',

    flexShrink: 0,
  },

  badge: {
    position: 'absolute',

    top: -3,
    right: -2,

    width: 18,
    height: 18,

    borderRadius: 9,

    backgroundColor: '#FF4D67',

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 2,
    borderColor: '#6630D7',
  },

  badgeText: {
    fontFamily: 'PoppinsBold',

    fontSize: 7,

    lineHeight: 9,

    color: '#FFFFFF',

    textAlign: 'center',
  },

  /* =========================
     PROFILE
  ========================= */

  profileCircle: {
    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },
});