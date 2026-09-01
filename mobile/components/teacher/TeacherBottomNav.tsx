import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabName =
  | 'home'
  | 'batches'
  | 'students'
  | 'profile';

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
        styles.navItem,
        active && styles.activeItem,
        pressed && styles.pressed,
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
          styles.navLabel,
          active && styles.activeLabel,
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

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
        },
      ]}
    >

      <BottomNavItem
        icon="home"
        label="Home"
        active={activeTab === 'home'}
        onPress={() => onTabChange('home')}
      />

      <BottomNavItem
        icon="people-outline"
        label="Batches"
        active={activeTab === 'batches'}
        onPress={() => onTabChange('batches')}
      />

      {/* Center Add Button */}
      <Pressable
        style={({ pressed }) => [
          styles.addContainer,
          pressed && styles.addPressed,
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

        <Text style={styles.addLabel}>
          Add
        </Text>
      </Pressable>

      <BottomNavItem
        icon="school-outline"
        label="Students"
        active={activeTab === 'students'}
        onPress={() => onTabChange('students')}
      />

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
  container: {
    position: 'absolute',

    left: 0,
    right: 0,
    bottom: 0,

    minHeight: 82,

    backgroundColor: '#FFFFFF',

    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',

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

    zIndex: 100,
  },

  navItem: {
    width: '18%',
    height: 62,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  activeItem: {
    backgroundColor: '#F0E7FF',
  },

  navLabel: {
    color: '#687080',
    fontSize: 12,
    fontFamily: 'Poppins',

    marginTop: 3,
  },

  activeLabel: {
    color: '#5420D8',
    fontWeight: '700',
  },

  addContainer: {
    width: '20%',
    height: 78,

    alignItems: 'center',

    marginTop: -28,
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

  addLabel: {
    color: '#687080',
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',

    marginTop: 5,
  },

  pressed: {
    opacity: 0.7,
  },

  addPressed: {
    transform: [{ scale: 0.96 }],
  },
});