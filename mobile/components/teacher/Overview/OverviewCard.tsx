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
  iconBackground: string;
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
  title,
  value,
  subtitle,
  extra,
  onPress,
}: OverviewCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text
    style={[
      styles.title,
      title === 'My Attendance' && styles.attendanceTitle,
    ]}
    numberOfLines={2}
    minimumFontScale={0.8}
  >
    {title}
  </Text>
      </View>

      {/* Value */}
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.value,
            value === 'Present' && styles.presentValue,
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text
          style={styles.subtitle}
          numberOfLines={2}
        >
          {subtitle}
        </Text>
      </View>

      {/* Extra */}
      {extra ? (
        <Text
          style={styles.extra}
          numberOfLines={1}
        >
          {extra}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,

    height: 220,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E3E3E8',

    alignItems: 'center',

    paddingTop: 12,
    paddingHorizontal: 5,
    paddingBottom: 8,

    marginHorizontal: 2,
  },

  iconCircle: {
    width: 54,
    height: 54,

    borderRadius: 27,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 7,

    flexShrink: 0,
  },

 titleContainer: {
  width: '100%',
  height: 34,

  alignItems: 'center',
  justifyContent: 'center',

  marginBottom: 5,
},

title: {
  width: '100%',

  color: '#171A2B',

  fontSize: 11.2,
  lineHeight: 16,

  fontWeight: '600',

  textAlign: 'center',
},

attendanceTitle: {
  fontSize: 11.5,
  lineHeight: 15,
},

  valueContainer: {
    width: '100%',
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,

    flexShrink: 0,
  },

  value: {
    color: '#111528',

    fontSize: 20,
    lineHeight: 36,

    fontWeight: '700',

    textAlign: 'center',
  },

  presentValue: {
    color: '#22A55A',

    fontSize: 15,
    lineHeight: 25,

    fontWeight: '700',
  },

  subtitleContainer: {
    width: '100%',
    minHeight: 34,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 4,

    flexShrink: 0,
  },

  subtitle: {
    width: '100%',

    color: '#4F5565',

    fontSize: 12.5,
    lineHeight: 17,

    textAlign: 'center',
  },

  extra: {
    color: '#171A2B',

    fontSize: 12.5,
    lineHeight: 17,

    fontWeight: '600',

    textAlign: 'center',

    marginTop: 2,

    flexShrink: 0,
  },

  pressed: {
    opacity: 0.75,
  },
});