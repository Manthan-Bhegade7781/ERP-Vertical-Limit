import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const DATA = [
  350,
  560,
  780,
  1010,
  1200,
  1360,
  1550,
  1750,
  1920,
  2110,
  2300,
  2640,
];

const MONTHS = [
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
];

export default function StudentGrowth() {
  const max = 3000;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Student Growth
        </Text>

        <View style={styles.yearSelector}>
          <Text style={styles.yearText}>
            This Year
          </Text>

          <MaterialCommunityIcons
            name="chevron-down"
            size={17}
            color="#59677B"
          />
        </View>
      </View>

      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>3K</Text>
          <Text style={styles.axisText}>2.5K</Text>
          <Text style={styles.axisText}>2K</Text>
          <Text style={styles.axisText}>1.5K</Text>
          <Text style={styles.axisText}>1K</Text>
          <Text style={styles.axisText}>500</Text>
          <Text style={styles.axisText}>0</Text>
        </View>

        <View style={styles.graph}>
          {[0, 1, 2, 3, 4, 5, 6].map(
            (item) => (
              <View
                key={item}
                style={[
                  styles.gridLine,
                  {
                    top: `${item * 16.66}%`,
                  },
                ]}
              />
            )
          )}

          <View style={styles.barsContainer}>
            {DATA.map((value, index) => {
              const height =
                (value / max) * 100;

              return (
                <View
                  key={index}
                  style={styles.barColumn}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${height}%`,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.monthRow}>
            {MONTHS.map((month) => (
              <Text
                key={month}
                style={styles.monthText}
              >
                {month}
              </Text>
            ))}
          </View>
        </View>
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
  },

  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#182131',
  },

  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  yearText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#25334A',
  },

  chartArea: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
  },

  yAxis: {
    width: 35,
    justifyContent: 'space-between',
    paddingBottom: 28,
  },

  axisText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#738096',
  },

  graph: {
    flex: 1,
    position: 'relative',
    marginLeft: 5,
    marginBottom: 2,
  },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#EEF1F5',
  },

  barsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 30,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  barColumn: {
    width: 10,
    height: '100%',
    justifyContent: 'flex-end',
  },

  bar: {
    width: 7,
    backgroundColor: '#2878DF',
    borderRadius: 5,
    opacity: 0.75,
  },

  monthRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  monthText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#738096',
  },
});