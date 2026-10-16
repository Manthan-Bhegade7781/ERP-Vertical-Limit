
import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

/* =========================================================
   TYPES
========================================================= */

type ColorType =
  | 'purple'
  | 'blue'
  | 'green'
  | 'orange'
  | 'pink';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  type: ColorType;
  onPress?: () => void;
};

/* =========================================================
   COLORS
========================================================= */

const colors = {
  purple: {
    background: '#F1EAFF',
    icon: '#7040D5',
  },
  blue: {
    background: '#EAF2FF',
    icon: '#2675E8',
  },
  green: {
    background: '#E7F8EF',
    icon: '#35B878',
  },
  orange: {
    background: '#FFF1E2',
    icon: '#F7941D',
  },
  pink: {
    background: '#FFE9F0',
    icon: '#E95386',
  },
};

/* =========================================================
   COMPONENT
========================================================= */

export default function StatCard({
  title,
  value,
  change,
  icon,
  type,
  onPress,
}: StatCardProps) {
  const color = colors[type];

  // Preserve compatibility with the existing dashboard.
  void change;

  return (
    <TouchableOpacity
      style={styles.statCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${title}: ${value}`}
    >
      {/* TOP ROW */}

      <View style={styles.statTopRow}>
        {/* STATISTIC ICON */}

        <View
          style={[
            styles.statIconBox,
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        {/* MATCHING COLOR ARROW BUTTON */}

        <View
          style={[
            styles.arrowButton,
            { backgroundColor: color.icon },
          ]}
        >
          <MaterialCommunityIcons
            name="arrow-right"
            size={18}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* STATISTIC DETAILS */}

      <View>
        <Text style={styles.statTitle}>
          {title}
        </Text>

        <Text
          style={styles.statValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {value}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  statCard: {
    width: '100%',
    height: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    justifyContent: 'space-between',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    color: '#748096',
    marginBottom: 3,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },
});
