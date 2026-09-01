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
            title === 'My\nAttendance' &&
              styles.attendanceTitle,
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
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
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text
          style={styles.subtitle}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
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
    width: 150,
    height: 220,

    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#E3E3E8',

    alignItems: 'center',

    paddingTop: 12,
    paddingHorizontal: 10,
    paddingBottom: 8,
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
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 1,
  },

  title: {
    width: '100%',
    color: '#171A2B',

    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    lineHeight: 19,

    textAlign: 'center',
  },

  attendanceTitle: {
    fontSize: 14,
    lineHeight: 18,
  },

  valueContainer: {
    width: '100%',
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 2,

    flexShrink: 0,
  },

  value: {
    color: '#111528',

    fontFamily: 'PoppinsBold',
    fontSize: 28,
    lineHeight: 36,

    textAlign: 'center',
  },

  presentValue: {
    color: '#22A55A',

    fontFamily: 'PoppinsBold',
    fontSize: 18,
    lineHeight: 26,

    textAlign: 'center',
  },

  subtitleContainer: {
    width: '100%',
    minHeight: 34,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 1,

    flexShrink: 0,
  },

  subtitle: {
    width: '100%',
    color: '#4F5565',

    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    lineHeight: 18,

    textAlign: 'center',
  },

  extra: {
    color: '#171A2B',

    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 18,

    textAlign: 'center',
    marginTop: 2,
  },

  pressed: {
    opacity: 0.75,
  },
});