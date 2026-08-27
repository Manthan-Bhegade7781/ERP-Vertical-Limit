import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  background: string;
  onPress?: () => void;
};

export default function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.action,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={color}
        />
      </View>

      <Text
        style={styles.label}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  action: {
    flex: 1,
    alignItems: 'center',
    minWidth: 0,
  },

  iconBox: {
    width: 60,
    height: 60,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 8,
  },

  label: {
    color: '#171A2B',
    fontSize: 11.5,
    lineHeight: 16,

    fontWeight: '600',
    textAlign: 'center',

    minHeight: 32,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});