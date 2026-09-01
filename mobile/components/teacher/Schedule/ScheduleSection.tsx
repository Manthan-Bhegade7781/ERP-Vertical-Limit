import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import ScheduleItem from './ScheduleItem';

type ScheduleSectionProps = {
  onViewAllPress?: () => void;
};

export default function ScheduleSection({
  onViewAllPress,
}: ScheduleSectionProps) {
  return (
    <View style={styles.section}>

      <View style={styles.header}>

        <Text style={styles.title}>
          Today's Schedule
        </Text>

        <Pressable
          onPress={onViewAllPress}
          hitSlop={8}
        >
          <Text style={styles.viewAll}>
            View All
          </Text>
        </Pressable>

      </View>

      <View style={styles.list}>

        <ScheduleItem
          color="#6630D7"
          iconBackground="#EEE7FF"
          iconColor="#6630D7"
          time="09:30 AM - 10:30 AM"
          className="12th Science A"
          room="Room 101"
          onPress={() => {
            console.log('12th Science A pressed');
          }}
        />

        <ScheduleItem
          color="#1670E8"
          iconBackground="#E6F0FF"
          iconColor="#1670E8"
          time="11:00 AM - 12:00 PM"
          className="11th Science B"
          room="Room 102"
          onPress={() => {
            console.log('11th Science B pressed');
          }}
        />

        <ScheduleItem
          color="#22A55A"
          iconBackground="#E3F7EB"
          iconColor="#22A55A"
          time="02:00 PM - 03:00 PM"
          className="12th Science B"
          room="Room 101"
          onPress={() => {
            console.log('12th Science B pressed');
          }}
        />

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,

    padding: 16,
    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 14,
  },

  title: {
    color: '#111528',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  viewAll: {
    color: '#5420D8',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
  },

  list: {
    gap: 10,
  },
});