import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabName = 'home' | 'batches' | 'students' | 'profile';

type TeacherBottomNavProps = {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  onAddPress?: () => void;
};

type BottomNavItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
};

function BottomNavItem({
  icon,
  label,
  active,
  onPress,
}: BottomNavItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.bottomNavItem,
        active && styles.bottomNavActive,
        pressed && styles.bottomNavPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={27}
        color={active ? '#5420D8' : '#687080'}
      />

      <Text
        style={[
          styles.bottomNavLabel,
          active && styles.bottomNavActiveLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function TeacherBottomNav({
  activeTab,
  onTabChange,
  onAddPress,
}: TeacherBottomNavProps) {
  const insets = useSafeAreaInsets();

  const bottomNavHeight = 74 + insets.bottom;

  return (
    <View
      style={[
        styles.bottomNav,
        {
          height: bottomNavHeight,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* HOME */}
      <BottomNavItem
        icon="home"
        label="Home"
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      />

      {/* BATCHES */}
      <BottomNavItem
        icon="people-outline"
        label="Batches"
        active={activeTab === 'batches'}
        onPress={() => onTabChange('batches')}
      />

      {/* ADD */}
      <Pressable
        style={({ pressed }) => [
          styles.addButtonContainer,
          pressed && styles.addButtonPressed,
        ]}
        onPress={onAddPress}
      >
        <View style={styles.addButton}>
          <Ionicons
            name="add"
            size={42}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.addButtonLabel}>
          Add
        </Text>
      </Pressable>

      {/* STUDENTS */}
      <BottomNavItem
        icon="school-outline"
        label="Students"
        active={activeTab === 'students'}
        onPress={() => onTabChange('students')}
      />

      {/* PROFILE */}
      <BottomNavItem
        icon="person-outline"
        label="Profile"
        active={activeTab === 'profile'}
        onPress={() => onTabChange('profile')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E6E6EA',

    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',

    paddingTop: 7,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,

    elevation: 12,
  },

  bottomNavItem: {
    width: '18%',
    height: 64,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
  },

  /*
   * This is the active grey/purple box.
   *
   * Because activeTab comes from TeacherDashboard,
   * this box automatically moves between:
   *
   * Home → Batches → Students → Profile
   */
  bottomNavActive: {
    backgroundColor: '#F0E7FF',
  },

  bottomNavPressed: {
    opacity: 0.65,
  },

  bottomNavLabel: {
    color: '#687080',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  bottomNavActiveLabel: {
    color: '#5420D8',
    fontWeight: '700',
  },

  /* ADD BUTTON */

  addButtonContainer: {
    width: '20%',
    height: 72,

    alignItems: 'center',
    justifyContent: 'flex-start',

    marginTop: -27,
  },

  addButton: {
    width: 66,
    height: 66,

    borderRadius: 33,

    backgroundColor: '#5420D8',

    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#5420D8',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,

    elevation: 8,
  },

  addButtonLabel: {
    color: '#687080',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },

  addButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});