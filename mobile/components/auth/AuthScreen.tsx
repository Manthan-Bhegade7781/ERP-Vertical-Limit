import React, { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthFooter } from './AuthFooter';
import { AuthLogo } from './AuthLogo';

type AuthScreenProps = PropsWithChildren<{
  footer?: boolean;
}>;

export function AuthScreen({
  children,
  footer = true,
}: AuthScreenProps) {
  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          scrollEventThrottle={16}
        >
          {/* Preserve the original background design */}
          <View style={styles.topCurve} />

          <AuthLogo />

          {children}

          {footer ? <AuthFooter /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 17,
    paddingBottom: 35,
  },

  topCurve: {
    position: 'absolute',
    top: -100,
    left: -95,
    width: 390,
    height: 170,
    borderBottomRightRadius: 210,
    backgroundColor: '#EEEAFB',
  },
});