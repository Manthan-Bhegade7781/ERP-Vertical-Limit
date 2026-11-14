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
  iconBackground?: string;
  background?: string;
  title: string;
  value: string;
  subtitle: string;
  extra?: string;
  onPress?: () => void;
};

export default function OverviewCard({
  icon,
  iconColor,
  iconBackground,
  background,
  title,
  value,
  subtitle,
  extra,
  onPress,
}: OverviewCardProps) {
  const bg = background || iconBackground || '#EEE7FF';

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
            backgroundColor: bg,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={iconColor}
        />
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title.replace('\n', ' ')}
      </Text>

      <Text style={styles.value} numberOfLines={1}>
        {value}
      </Text>

      <Text style={styles.subtitle} numberOfLines={1}>
        {subtitle}
      </Text>

      {extra ? (
        <Text style={styles.extra} numberOfLines={1}>
          {extra}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    minHeight: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    shadowColor: '#202124',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
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

  extra: {
    color: '#171A2B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    marginTop: 2,
  },

  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
