import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AuthFooter() {
  return (
    <View style={styles.footer}>
      <Text style={styles.copyright}>© 2026 Vertical Limit. All rights reserved.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.85,
  },
  copyright: {
    fontSize: 12,
    color: '#77747E',
    fontFamily: 'PoppinsRegular',
  },
});
