import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AuthLogo() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.logoMark}>
        <MaterialCommunityIcons name="school-outline" size={76} color="#2E155E" />
        <View style={styles.bookLine} />
        <MaterialCommunityIcons
          name="book-open-page-variant"
          size={70}
          color="#5A2EC4"
          style={styles.book}
        />
        <View style={styles.goldAccent} />
      </View>
      <Text style={styles.brand}>VERTICAL CLASSES</Text>
      <Text style={styles.tagline}>Coaching Institute ERP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  logoMark: {
    width: 112,
    height: 108,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  book: {
    position: 'absolute',
    bottom: 3,
  },
  bookLine: {
    position: 'absolute',
    width: 62,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#5A2EC4',
    bottom: 15,
  },
  goldAccent: {
    position: 'absolute',
    right: 17,
    top: 29,
    width: 7,
    height: 38,
    borderRadius: 2,
    backgroundColor: '#F0B323',
  },
  brand: {
    marginTop: 5,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: 0.2,
    color: '#21104F',
  },
  tagline: {
    marginTop: 2,
    fontSize: 16,
    color: '#88858F',
    fontWeight: '500',
  },
});
