import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import OverviewCard from './OverviewCard';

export default function OverviewSection() {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  return (
    <View
      style={[
        styles.section,
        isSmallScreen && styles.smallSection,
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            isSmallScreen && styles.smallTitle,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          Today's Overview
        </Text>

        <View style={styles.dateContainer}>
          <Ionicons
            name="calendar-outline"
            size={isSmallScreen ? 18 : 20}
            color="#5420D8"
          />

          <Text
            style={[
              styles.date,
              isSmallScreen && styles.smallDate,
            ]}
            numberOfLines={1}
          >
            22 May 2025
          </Text>
        </View>
      </View>

      {/* Cards */}
      <View style={styles.cardsRow}>
        <OverviewCard
          icon="calendar-outline"
          iconColor="#6630D7"
          iconBackground="#EEE7FF"
          title={"My \nAttendance"}
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
  section: {
    backgroundColor: '#FFFFFF',

    borderRadius: 22,

    paddingTop: 17,
    paddingHorizontal: 12,
    paddingBottom: 14,

    marginBottom: 16,
  },

  smallSection: {
    paddingHorizontal: 9,
    paddingTop: 14,
    paddingBottom: 12,
  },

  header: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'space-between',

    marginBottom: 12,

    paddingHorizontal: 1,
  },

  title: {
    flex: 1,

    color: '#111528',

    fontSize: 23,
    lineHeight: 28,

    fontWeight: '700',

    marginRight: 8,

    includeFontPadding: false,
  },

  smallTitle: {
    fontSize: 20,
    lineHeight: 25,
  },

  dateContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    flexShrink: 0,
  },

  date: {
    color: '#5420D8',

    fontSize: 13.5,
    lineHeight: 18,

    fontWeight: '600',

    marginLeft: 5,

    includeFontPadding: false,
  },

  smallDate: {
    fontSize: 11.5,
  },

  cardsRow: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'stretch',

    marginHorizontal: -2,
  },
});