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
  subject: string;
  room: string;
  type: string;
  onPress?: () => void;
};

export default function ScheduleItem({
  color,
  iconBackground,
  iconColor,
  time,
  className,
  subject,
  room,
  type,
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
          size={23}
          color={iconColor}
        />
      </View>

      <View style={styles.content}>
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
            <Text style={styles.badgeText} numberOfLines={1}>
              {type}
            </Text>
          </View>
        </View>

        <Text
          style={styles.className}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {className}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.subjectContainer}>
            <Text style={styles.subjectLabel} numberOfLines={1}>
              Subject:
            </Text>

            <Text
              style={styles.subject}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subject}
            </Text>
          </View>

          <View style={styles.roomContainer}>
            <Ionicons
              name="location-outline"
              size={14}
              color="#5B6272"
            />

            <Text
              style={styles.room}
              numberOfLines={1}
              ellipsizeMode="tail"
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
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E2E8',
    borderLeftWidth: 4,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 9,
  },

  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
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
    marginBottom: 2,
  },

  time: {
    flex: 1,
    minWidth: 0,
    color: '#5B6272',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    lineHeight: 17,
    marginRight: 6,
  },

  badge: {
    flexShrink: 1,
    maxWidth: 82,
    backgroundColor: '#F0E9FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  badgeText: {
    color: '#5420D8',
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    textTransform: 'capitalize',
  },

  className: {
    color: '#171A2B',
    fontSize: 14,
    lineHeight: 19,
    fontFamily: 'PoppinsSemiBold',
    marginBottom: 4,
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
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    flexShrink: 0,
  },

  subject: {
    color: '#5420D8',
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
    marginLeft: 3,
    flex: 1,
    minWidth: 0,
  },

  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    minWidth: 0,
    maxWidth: '42%',
    marginLeft: 7,
  },

  room: {
    flexShrink: 1,
    minWidth: 0,
    color: '#5B6272',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    marginLeft: 2,
  },

  pressed: {
    opacity: 0.7,
  },
});
