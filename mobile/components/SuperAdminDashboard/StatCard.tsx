import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  type: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  onPress?: () => void;
};

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

export default function StatCard({
  title,
  value,
  change,
  icon,
  type,
  onPress,
}: StatCardProps) {
  const color = colors[type];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconBox,
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        <View
          style={[
            styles.changeBadge,
            { backgroundColor: color.background },
          ]}
        >
          <MaterialCommunityIcons name="chevron-right" size={25} color="#A0A9B8" />
        </View>
      </View>

      <View>
        <Text style={styles.title}>{title}</Text>

        <Text
          style={styles.value}
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

const styles = StyleSheet.create({
  card: {
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

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    minHeight: 28,
    borderRadius: 16,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },

  change: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginLeft: 3,
  },

  title: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#748096',
    marginBottom: 3,
  },

  value: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },
});