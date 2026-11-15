import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

export function AuthLogo() {
  return (
    <View style={styles.wrapper}>
      <View style={styles.logoMark}>
        <Image
          source={require('@/assets/images/android-icon-foreground.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.brand}>VERTICAL LIMIT</Text>
      <Text style={styles.tagline}>Coaching Institute ERP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  logoMark: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#2E155E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  logoImage: {
    width: 92,
    height: 92,
  },
  brand: {
    marginTop: 8,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#21104F',
    fontFamily: 'PoppinsBold',
  },
  tagline: {
    marginTop: 2,
    fontSize: 14,
    color: '#88858F',
    fontWeight: '500',
    fontFamily: 'PoppinsMedium',
  },
});
