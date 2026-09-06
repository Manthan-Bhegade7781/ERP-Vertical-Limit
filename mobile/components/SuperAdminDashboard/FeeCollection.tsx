import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function FeeCollection() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Fee Collection Overview
        </Text>

        <View style={styles.year}>
          <Text style={styles.yearText}>
            This Year
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={16}
            color="#59677B"
          />
        </View>
      </View>

      <View style={styles.content}>
        {/* Donut */}
        <View style={styles.donut}>
          <View style={styles.donutInner}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.total}>
              ₹ 45,78,000
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Legend
            color="#42C98B"
            title="Collected"
            value="₹ 45,78,000 (65%)"
          />

          <Legend
            color="#F4A12C"
            title="Pending"
            value="₹ 18,25,000 (25%)"
          />

          <Legend
            color="#E85A87"
            title="Overdue"
            value="₹ 6,20,000 (10%)"
          />
        </View>
      </View>
    </View>
  );
}

function Legend({
  color,
  title,
  value,
}: {
  color: string;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.dot,
          { backgroundColor: color },
        ]}
      />

      <View>
        <Text style={styles.legendTitle}>
          {title}
        </Text>

        <Text style={styles.legendValue}>
          {value}
        </Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#182131',
  },

  year: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  yearText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#25334A',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  donut: {
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 22,
    borderColor: '#42C98B',
    borderRightColor: '#F4A12C',
    borderBottomColor: '#F4A12C',
    borderLeftColor: '#E85A87',
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutInner: {
    alignItems: 'center',
  },

  totalLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#718097',
  },

  total: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#182131',
    marginTop: 2,
  },

  legend: {
    marginTop: 14,
    width: '100%',
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 8,
  },

  legendTitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#617087',
  },

  legendValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202A3A',
    marginTop: 2,
  },
});