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
      style={({ pressed }) => [
        styles.item,
        { borderLeftColor: color },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
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
          size={30}
          color={iconColor}
        />
      </View>

      <View style={styles.middle}>
        <Text style={styles.time}>
          {time}
        </Text>

        <Text
          style={styles.className}
          numberOfLines={1}
        >
          {className}
        </Text>

        <View style={styles.subjectRow}>
          <Text style={styles.subjectLabel}>
            Subject:{' '}
          </Text>

          <Text style={styles.subjectValue}>
            Physics
          </Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.lectureBadge}>
          <Text style={styles.lectureText}>
            Lecture
          </Text>
        </View>

        <View style={styles.roomRow}>
          <Ionicons
            name="location-outline"
            size={18}
            color="#596174"
          />

          <Text style={styles.room}>
            {room}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 108,
    borderWidth: 1,
    borderColor: '#E4E5EB',
    borderLeftWidth: 4,
    borderRadius: 13,
    paddingVertical: 12,
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 62,
    height: 62,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  middle: {
    flex: 1,
    minWidth: 0,
  },

  time: {
    color: '#5B6272',
    fontSize: 14,
    marginBottom: 3,
  },

  className: {
    color: '#171A2B',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectLabel: {
    color: '#5B6272',
    fontSize: 14,
  },

  subjectValue: {
    color: '#5420D8',
    fontSize: 14,
    fontWeight: '600',
  },

  right: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 72,
    marginLeft: 8,
  },

  lectureBadge: {
    backgroundColor: '#F0E9FF',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 10,
  },

  lectureText: {
    color: '#5420D8',
    fontSize: 14,
    fontWeight: '700',
  },

  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  room: {
    color: '#5B6272',
    fontSize: 13,
  },

  pressed: {
    opacity: 0.72,
  },
});