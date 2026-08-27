import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const HORIZONTAL_PADDING = 10;
const CARD_GAP = 10;

const CARD_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - CARD_GAP * 12) / 4;

type IconName = keyof typeof Ionicons.glyphMap;

type OverviewCardProps = {
  icon: IconName;
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
      style={styles.card}
      onPress={onPress}
    >
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
          size={30}
          color={iconColor}
        />
      </View>

      <Text
        style={styles.title}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {title}
      </Text>

      <Text
        style={[
          styles.value,
          value === 'Present' && styles.present,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>

      <Text style={styles.subtitle}>
        {subtitle}
      </Text>

      {extra && (
        <Text style={styles.extra}>
          {extra}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    minHeight: 238,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E8E8EE',
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 6,
    paddingBottom: 12,
  },

  iconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  title: {
    color: '#171A2B',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 7,
  },

  value: {
    color: '#111528',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 7,
  },

  present: {
    color: '#22A55A',
    fontSize: 20,
  },

  subtitle: {
    color: '#454A5A',
    fontSize: 12,
    textAlign: 'center',
  },

  extra: {
    color: '#171A2B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});