import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type OverviewCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  background: string;
  title: string;
  value: string;
  subtitle: string;
  onPress?: () => void;
};

export default function OverviewCard({
  icon,
  iconColor,
  background,
  title,
  value,
  subtitle,
  onPress,
}: OverviewCardProps) {
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
          color={iconColor}
        />
      </View>

      <Text style={styles.title}>
        {title}
      </Text>

      <Text style={styles.value}>
        {value}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    minHeight: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  title: {
    color: '#6E6E7D',
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
  },

  value: {
    color: '#171A2B',
    fontSize: 19,
    fontFamily: 'PoppinsBold',
    marginTop: 2,
  },

  subtitle: {
    color: '#92929E',
    fontSize: 9.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});