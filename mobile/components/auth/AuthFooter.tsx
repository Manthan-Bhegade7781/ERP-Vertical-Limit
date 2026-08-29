import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AuthFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.school}>
        <MaterialCommunityIcons name="school-outline" size={62} color="#DCD5F6" />
        <View style={styles.schoolBase} />
      </View>
      <Text style={styles.copyright}>© 2024 Vertical Classes. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 38,
    minHeight: 115,
    alignItems: 'center',
    justifyContent: 'flex-end',
    opacity: 0.8,
  },
  school: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 68,
    width: 130,
  },
  schoolBase: {
    width: 110,
    height: 10,
    borderRadius: 8,
    backgroundColor: '#E6E1F8',
    marginTop: -10,
  },
  copyright: {
    marginTop: 16,
    fontSize: 13,
    color: '#77747E',
  },
});
