import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ScheduleItemProps = {
  color: string;
  iconBackground: string;
  iconColor: string;
  time: string;
  className: string;
  room: string;
  onPress?: () => void;
};

export default function ScheduleItem({
  color,
  iconBackground,
  iconColor,
  time,
  className,
  room,
  onPress,
}: ScheduleItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        {
          borderLeftColor: color,
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Book Icon */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name="book-outline"
          size={32}
          color={iconColor}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Time + Lecture */}
        <View style={styles.topRow}>
          <Text
            style={styles.time}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {time}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Lecture
            </Text>
          </View>
        </View>

        {/* Class Name */}
        <Text
          style={styles.className}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {className}
        </Text>

        {/* Subject + Room */}
        <View style={styles.infoRow}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectLabel}>
              Subject:
            </Text>

            <Text
              style={styles.subject}
              numberOfLines={1}
            >
              Physics
            </Text>
          </View>

          <View style={styles.roomContainer}>
            <Ionicons
              name="location-outline"
              size={17}
              color="#5B6272"
            />

            <Text
              style={styles.room}
              numberOfLines={1}
            >
              {room}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 112,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#E1E2E8',

    borderLeftWidth: 4,
    borderRadius: 14,

    paddingVertical: 11,
    paddingHorizontal: 10,
  },

  iconBox: {
    width: 58,
    height: 58,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,

    flexShrink: 0,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',

    width: '100%',

    marginBottom: 3,
  },

  time: {
    flex: 1,

    color: '#5B6272',

    fontSize: 14,
    lineHeight: 19,

    marginRight: 8,
  },

  badge: {
    flexShrink: 0,

    backgroundColor: '#F0E9FF',

    paddingHorizontal: 12,
    paddingVertical: 8,

    borderRadius: 10,
  },

  badgeText: {
    color: '#5420D8',

    fontSize: 13,
    fontWeight: '700',
  },

  className: {
    color: '#171A2B',

    fontSize: 17,
    lineHeight: 22,

    fontWeight: '700',

    marginBottom: 5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    width: '100%',
  },

  subjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    flex: 1,
    minWidth: 0,
  },

  subjectLabel: {
    color: '#5B6272',

    fontSize: 13,
  },

  subject: {
    color: '#5420D8',

    fontSize: 13,
    fontWeight: '600',

    marginLeft: 3,

    flexShrink: 1,
  },

  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    flexShrink: 0,

    marginLeft: 8,
  },

  room: {
    color: '#5B6272',

    fontSize: 12.5,

    marginLeft: 3,
  },

  pressed: {
    opacity: 0.7,
  },
});