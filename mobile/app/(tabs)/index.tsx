import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="school-outline" size={52} color="#5A2EC4" />
      </View>
      <Text style={styles.title}>Vertical Classes</Text>
      <Text style={styles.subtitle}>Welcome to your dashboard</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    fontSize: 28,
    fontWeight: '800',
    color: '#21104F',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#77767D',
  },
});
