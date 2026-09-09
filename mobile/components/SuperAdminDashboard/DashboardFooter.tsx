import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function DashboardFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.text}>
        © 2025 Coaching ERP Portal. All rights reserved.
      </Text>

      <Text style={styles.version}>
        Version 1.0.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    minHeight: 55,
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#E6EAF0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  text: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#65738A',
  },

  version: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#65738A',
  },
});