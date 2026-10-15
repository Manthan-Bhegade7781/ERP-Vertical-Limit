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
  | 'classes'
  | 'tests'
  | 'fees'
  | 'profile';

type StudentBottomNavProps = {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
};

type NavItemProps = {
  tab: TabName;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  activeTab: TabName;
  onPress: () => void;
};

export default function StudentBottomNav({
  activeTab,
  onTabChange,
}: StudentBottomNavProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.navBar}>
        <NavItem
          tab="home"
          label="Home"
          activeIcon="home"
          inactiveIcon="home-outline"
          activeTab={activeTab}
          onPress={() => onTabChange('home')}
        />

        <NavItem
          tab="classes"
          label="Classes"
          activeIcon="book"
          inactiveIcon="book-outline"
          activeTab={activeTab}
          onPress={() => onTabChange('classes')}
        />

        <NavItem
          tab="tests"
          label="Tests"
          activeIcon="clipboard"
          inactiveIcon="clipboard-outline"
          activeTab={activeTab}
          onPress={() => onTabChange('tests')}
        />

        <NavItem
          tab="fees"
          label="Fees"
          activeIcon="wallet"
          inactiveIcon="wallet-outline"
          activeTab={activeTab}
          onPress={() => onTabChange('fees')}
        />

        <NavItem
          tab="profile"
          label="Profile"
          activeIcon="person"
          inactiveIcon="person-outline"
          activeTab={activeTab}
          onPress={() => onTabChange('profile')}
        />
      </View>
    </View>
  );
}

function NavItem({
  tab,
  label,
  activeIcon,
  inactiveIcon,
  activeTab,
  onPress,
}: NavItemProps) {
  const isActive = activeTab === tab;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.navItem,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,
          isActive && styles.activeIconContainer,
        ]}
      >
        <Ionicons
          name={isActive ? activeIcon : inactiveIcon}
          size={21}
          color={isActive ? '#6630D7' : '#858592'}
        />
      </View>

      <Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 10,
    paddingBottom: 8,
    marginBottom: 30,
    backgroundColor: 'transparent',
  },

  navBar: {
    height: 66,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 1,
    shadowRadius: 8,

    elevation: 10,
  },

  navItem: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    width: 34,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeIconContainer: {
    backgroundColor: '#EEE7FF',
    borderRadius: 10,
  },

  label: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsMedium',
    marginTop: 2,
  },

  activeLabel: {
    color: '#6630D7',
    fontFamily: 'PoppinsSemiBold',
  },

  pressed: {
    opacity: 0.65,
  },
});