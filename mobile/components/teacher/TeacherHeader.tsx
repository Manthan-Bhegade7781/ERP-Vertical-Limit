import React from 'react';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';


type TeacherHeaderProps = {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
};

export default function TeacherHeader({
  onMenuPress,
  onNotificationPress,
  onProfilePress,
}: TeacherHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();

      if (hour >= 5 && hour < 12) {
        setGreeting('Good Morning');
      } else if (hour >= 12 && hour < 17) {
        setGreeting('Good Afternoon');
      } else if (hour >= 17 && hour < 21) {
        setGreeting('Good Evening');
      } else {
        setGreeting('Good Night');
      }
    };

    updateGreeting();

    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <View style={styles.headerContent}>

        {/* Menu */}
        <Pressable
          style={styles.menuButton}
          onPress={onMenuPress}
          hitSlop={8}
        >
          <Ionicons
            name="menu-outline"
            size={34}
            color="#FFFFFF"
          />
        </Pressable>

        {/* Teacher Information */}
        <View style={styles.teacherInfo}>
          <Text style={styles.greeting}>
            {greeting}, 👋
          </Text>

          <Text
            style={styles.teacherName}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {user?.fullName || 'Teacher Name'}
          </Text>

        </View>

        {/* Header Actions */}
        <View style={styles.actions}>

          <Pressable
            style={styles.notificationButton}
            onPress={onNotificationPress}
            hitSlop={8}
          >
            <Ionicons
              name="notifications-outline"
              size={30}
              color="#FFFFFF"
            />

            <View style={styles.notificationDot} />
          </Pressable>

          <Pressable
            style={styles.avatar}
            onPress={onProfilePress}
          >
            <Ionicons
              name="person-outline"
              size={36}
              color="#111528"
            />
          </Pressable>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#5122C8',
    paddingHorizontal: 20,
    paddingBottom: 3,
  },

  headerContent: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuButton: {
    width: 42,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  teacherInfo: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'PoppinsRegular',
    marginBottom: 3,
  },

  teacherName: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 32,
    fontFamily: 'PoppinsSemiBold',
  },

  teacherRole: {
    textTransform: 'capitalize',
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    lineHeight: 21,
    marginTop: 1,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  notificationButton: {
    width: 38,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    right: 2,
    top: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6464',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});