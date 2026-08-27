import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TeacherHeaderProps = {
  onMenuPress?: () => void;
  onProfilePress?: () => void;
};

export default function TeacherHeader({
  onMenuPress,
  onProfilePress,
}: TeacherHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 10,
        },
      ]}
    >
      <View style={styles.headerTop}>

        <Pressable
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Ionicons
            name="menu-outline"
            size={35}
            color="#FFFFFF"
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.greeting}>
            Good Morning, 👋
          </Text>

          <Text style={styles.teacherName}>
            Priya Sharma
          </Text>

          <Text style={styles.teacherRole}>
            Physics Teacher
          </Text>
        </View>

        <View style={styles.headerRight}>

          <Pressable
            style={styles.notificationButton}
            onPress={() => {
              console.log('Notifications pressed');
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={31}
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
              size={39}
              color="#171B2D"
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
    paddingBottom: 18,
  },

  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 116,
  },

  menuButton: {
    width: 45,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    paddingLeft: 2,
  },

  greeting: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 2,
  },

  teacherName: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },

  teacherRole: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  notificationButton: {
    width: 42,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  notificationDot: {
    position: 'absolute',
    right: 5,
    top: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A5F',
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