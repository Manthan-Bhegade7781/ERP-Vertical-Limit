import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const batches = [
  ['JEE Advanced 2025', '156', 'purple'],
  ['NEET 2025 Target', '142', 'blue'],
  ['Class 10th CBSE', '120', 'green'],
  ['Class 12th Science', '98', 'orange'],
  ['Foundation 8-9', '75', 'purple'],
];

export default function BatchOverview() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Batch Overview
        </Text>

        <TouchableOpacity>
          <Text style={styles.viewAll}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      {batches.map(
        ([name, students, type]) => (
          <View
            key={name}
            style={styles.row}
          >
            <View
              style={[
                styles.iconBox,
                type === 'purple' &&
                  styles.purple,
                type === 'blue' &&
                  styles.blue,
                type === 'green' &&
                  styles.green,
                type === 'orange' &&
                  styles.orange,
              ]}
            >
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={
                  type === 'purple'
                    ? '#7040D6'
                    : type === 'blue'
                    ? '#2878DF'
                    : type === 'green'
                    ? '#39B97B'
                    : '#F49A2D'
                }
              />
            </View>

            <Text
              style={styles.batchName}
              numberOfLines={1}
            >
              {name}
            </Text>

            <Text style={styles.studentCount}>
              Students: {students}
            </Text>

            <View style={styles.active}>
              <Text style={styles.activeText}>
                Active
              </Text>
            </View>
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 10,
    padding: 17,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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

  row: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    gap: 7,
  },

  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  purple: {
    backgroundColor: '#F0EBFF',
  },

  blue: {
    backgroundColor: '#EAF2FF',
  },

  green: {
    backgroundColor: '#E8F8F0',
  },

  orange: {
    backgroundColor: '#FFF3E4',
  },

  batchName: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#253044',
  },

  studentCount: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#65738A',
  },

  active: {
    backgroundColor: '#E8F8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },

  activeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#26A96B',
  },
});