import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NextClassCardProps = {
  subject: string;
  batch: string;
  teacher: string;
  time: string;
  room: string;
  onPress?: () => void;
};

export default function NextClassCard({
  subject,
  batch,
  teacher,
  time,
  room,
  onPress,
}: NextClassCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Ionicons
            name="calendar-outline"
            size={23}
            color="#1670E8"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.label}>
            NEXT CLASS
          </Text>

          <Text style={styles.subject}>
            {subject}
          </Text>

          <Text style={styles.batch}>
            {batch} • {teacher}
          </Text>

          <View style={styles.timeRow}>
            <Ionicons
              name="time-outline"
              size={13}
              color="#7A7A87"
            />

            <Text style={styles.time}>
              {time}
            </Text>

            <Text style={styles.separator}>
              •
            </Text>

            <Text style={styles.room}>
              {room}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9A9AA5"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    flex: 1,
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#E6F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  content: {
    flex: 1,
  },

  label: {
    color: '#1670E8',
    fontSize: 8.5,
    fontFamily: 'PoppinsBold',
    letterSpacing: 0.4,
  },

  subject: {
    color: '#171A2B',
    fontSize: 14,
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },

  batch: {
    color: '#747481',
    fontSize: 9.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  time: {
    color: '#70707D',
    fontSize: 9,
    fontFamily: 'PoppinsMedium',
    marginLeft: 3,
  },

  separator: {
    color: '#A0A0AA',
    fontSize: 9,
    marginHorizontal: 5,
  },

  room: {
    color: '#70707D',
    fontSize: 9,
    fontFamily: 'PoppinsRegular',
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
});