import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile'
  | 'attendance';

type TeacherBottomNavProps = {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
};

export default function TeacherBottomNav({
  activeTab,
  onTabChange,
}: TeacherBottomNavProps) {
  const tabs: {
    name: TabName;
    label: string;
    activeIcon: keyof typeof Ionicons.glyphMap;
    inactiveIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      name: 'home',
      label: 'Home',
      activeIcon: 'home',
      inactiveIcon: 'home-outline',
    },
    {
      name: 'batches',
      label: 'Batches',
      activeIcon: 'layers',
      inactiveIcon: 'layers-outline',
    },
    {
      name: 'students',
      label: 'Students',
      activeIcon: 'people',
      inactiveIcon: 'people-outline',
    },
    {
      name: 'profile',
      label: 'Profile',
      activeIcon: 'person',
      inactiveIcon: 'person-outline',
    },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;

        return (
          <Pressable
            key={tab.name}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.pressed,
            ]}
            onPress={() => onTabChange(tab.name)}
          >
            <View
              style={[
                styles.iconContainer,
                isActive && styles.activeIconContainer,
              ]}
            >
              <Ionicons
                name={
                  isActive
                    ? tab.activeIcon
                    : tab.inactiveIcon
                }
                size={25}
                color={isActive ? '#5420D8' : '#8A8E99'}
              />
            </View>

            <Text
              style={[
                styles.navLabel,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  container: {
    height: 82,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    marginHorizontal: 18,
    marginBottom: 8,

    paddingHorizontal: 8,

    borderRadius: 28,

    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,

    borderWidth: 1,
    borderColor: '#F1EFF5',
  },

  navItem: {
    flex: 1,
    height: 72,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 44,
    height: 38,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 15,
  },

  activeIconContainer: {
    backgroundColor: '#F0E8FF',
  },

  navLabel: {
    marginTop: 3,

    color: '#8A8E99',
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
  },

  activeLabel: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  pressed: {
    opacity: 0.65,
  },
});