import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const announcements = [
  {
    title: 'Summer Classes Schedule',
    description:
      'Summer batch timing starts from 1st June 2025.',
    time: '2 hours ago',
    icon: 'bullhorn-outline' as const,
    type: 'purple',
  },
  {
    title: 'Exam Form Fill-up',
    description:
      'Mid-term exam form will be available from 5th June.',
    time: '1 day ago',
    icon: 'bullhorn-outline' as const,
    type: 'green',
  },
  {
    title: 'Fee Reminder',
    description:
      'Please clear pending fees before 10th June to avoid late fees.',
    time: '2 days ago',
    icon: 'bullhorn-outline' as const,
    type: 'orange',
  },
];

export default function RecentAnnouncements() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Recent Announcements
        </Text>

        <TouchableOpacity>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View>
        {announcements.map((item) => (
          <View
            key={item.title}
            style={styles.item}
          >
            <View
              style={[
                styles.iconBox,
                item.type === 'purple' &&
                  styles.purple,
                item.type === 'green' &&
                  styles.green,
                item.type === 'orange' &&
                  styles.orange,
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={19}
                color={
                  item.type === 'purple'
                    ? '#7650DA'
                    : item.type === 'green'
                    ? '#35B87B'
                    : '#F39A2C'
                }
              />
            </View>

            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>
                {item.title}
              </Text>

              <Text style={styles.description}>
                {item.description}
              </Text>

              <Text style={styles.time}>
                {item.time}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 330,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 10,
    padding: 17,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#182131',
  },

  viewAll: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#1666DB',
  },

  item: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
  },

  iconBox: {
    width: 37,
    height: 37,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  purple: {
    backgroundColor: '#F0EBFF',
  },

  green: {
    backgroundColor: '#E8F8F0',
  },

  orange: {
    backgroundColor: '#FFF2E3',
  },

  itemContent: {
    flex: 1,
    marginLeft: 10,
  },

  itemTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#202A3A',
  },

  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#68768C',
    lineHeight: 14,
    marginTop: 2,
  },

  time: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#7E8A9B',
    marginTop: 3,
  },
});