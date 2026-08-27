import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import OverviewCard from './OverviewCard';

export default function OverviewSection() {
  return (
    <View style={styles.card}>

      <View style={styles.header}>
        <Text style={styles.title}>
          Today's Overview
        </Text>

        <View style={styles.date}>
          <Ionicons
            name="calendar-outline"
            size={22}
            color="#5420D8"
          />

          <Text style={styles.dateText}>
            22 May 2025
          </Text>
        </View>
      </View>

      <View style={styles.row}>

        <OverviewCard
          icon="calendar-outline"
          iconColor="#6630D7"
          iconBackground="#EEE7FF"
          title="My Attendance"
          value="Present"
          subtitle="Checked in"
          extra="09:15 AM"
        />

        <OverviewCard
          icon="people-outline"
          iconColor="#1670E8"
          iconBackground="#E6F0FF"
          title="Classes Today"
          value="3"
          subtitle="Total Classes"
        />

        <OverviewCard
          icon="people-outline"
          iconColor="#22A55A"
          iconBackground="#E3F7EB"
          title="Students"
          value="68"
          subtitle="Total Students"
        />

        <OverviewCard
          icon="calendar-outline"
          iconColor="#F28A17"
          iconBackground="#FFF0DF"
          title="Lectures Today"
          value="3"
          subtitle="Total Lectures"
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  title: {
    color: '#111528',
    fontSize: 21,
    fontWeight: '700',
  },

  date: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    color: '#5420D8',
    fontSize: 15,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    gap: 10,
  },
});