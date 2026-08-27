import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AnnouncementItem from './AnnouncementItem';

type AnnouncementsSectionProps = {
  onViewAllPress?: () => void;
};

export default function AnnouncementsSection({
  onViewAllPress,
}: AnnouncementsSectionProps) {
  return (
    <View style={styles.section}>

      <View style={styles.header}>

        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Recent Announcements
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

      <AnnouncementItem
        title="Staff Meeting"
        description="Meeting scheduled on 24 May 2025 at 04:00 PM"
        date="22 May 2025"
        author="Admin"
        onPress={() => {
          console.log('Staff Meeting pressed');
        }}
      />

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

    marginBottom: 14,
  },

  title: {
    flex: 1,
    color: '#111528',
    fontSize: 21,
    fontWeight: '700',
  },

  viewAll: {
    color: '#5420D8',
    fontSize: 16,
    fontWeight: '700',

    marginLeft: 10,
  },
});