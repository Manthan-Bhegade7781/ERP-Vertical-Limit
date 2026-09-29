import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type QuickAccessCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  background: string;
  onPress?: () => void;
};

export default function QuickAccessCard({
  icon,
  label,
  color,
  background,
  onPress,
}: QuickAccessCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
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
          size={22}
          color={color}
        />
      </View>

      <Text
        style={styles.label}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 72,
    borderRadius: 15,
    backgroundColor: '#F8F8FB',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  label: {
    flex: 1,
    color: '#242637',
    fontSize: 10.5,
    lineHeight: 14,
    fontFamily: 'PoppinsSemiBold',
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});