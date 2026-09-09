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
  onAddPress: () => void;
};

export default function TeacherBottomNav({
  activeTab,
  onTabChange,
  onAddPress,
}: TeacherBottomNavProps) {
  return (
    <View style={styles.container}>
      {/* ================= HOME ================= */}

      <Pressable
        style={styles.navItem}
        onPress={() =>
          onTabChange('home')
        }
      >
        <Ionicons
          name={
            activeTab === 'home'
              ? 'home'
              : 'home-outline'
          }
          size={22}
          color={
            activeTab === 'home'
              ? '#5420D8'
              : '#8A8E99'
          }
        />

        <Text
          style={[
            styles.navLabel,
            activeTab === 'home' &&
              styles.activeLabel,
          ]}
        >
          Home
        </Text>
      </Pressable>

      {/* ================= BATCHES ================= */}

      <Pressable
        style={styles.navItem}
        onPress={() =>
          onTabChange('batches')
        }
      >
        <Ionicons
          name={
            activeTab === 'batches'
              ? 'layers'
              : 'layers-outline'
          }
          size={22}
          color={
            activeTab === 'batches'
              ? '#5420D8'
              : '#8A8E99'
          }
        />

        <Text
          style={[
            styles.navLabel,
            activeTab === 'batches' &&
              styles.activeLabel,
          ]}
        >
          Batches
        </Text>
      </Pressable>

      {/* ================= CENTER ADD BUTTON ================= */}

      <View style={styles.addContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.pressed,
          ]}
          onPress={onAddPress}
        >
          <Ionicons
            name="add"
            size={28}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* ================= STUDENTS ================= */}

      <Pressable
        style={styles.navItem}
        onPress={() =>
          onTabChange('students')
        }
      >
        <Ionicons
          name={
            activeTab === 'students'
              ? 'people'
              : 'people-outline'
          }
          size={22}
          color={
            activeTab === 'students'
              ? '#5420D8'
              : '#8A8E99'
          }
        />

        <Text
          style={[
            styles.navLabel,
            activeTab === 'students' &&
              styles.activeLabel,
          ]}
        >
          Students
        </Text>
      </Pressable>

      {/* ================= PROFILE ================= */}

      <Pressable
        style={styles.navItem}
        onPress={() =>
          onTabChange('profile')
        }
      >
        <Ionicons
          name={
            activeTab === 'profile'
              ? 'person'
              : 'person-outline'
          }
          size={22}
          color={
            activeTab === 'profile'
              ? '#5420D8'
              : '#8A8E99'
          }
        />

        <Text
          style={[
            styles.navLabel,
            activeTab === 'profile' &&
              styles.activeLabel,
          ]}
        >
          Profile
        </Text>
      </Pressable>
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
    paddingHorizontal: 8,
  },

  navItem: {
    flex: 1,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navLabel: {
    marginTop: 3,
    color: '#8A8E99',
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
  },

  activeLabel: {
    color: '#5420D8',
    fontFamily: 'PoppinsSemiBold',
  },

  /* ================= ADD BUTTON ================= */

  addContainer: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#5420D8',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  pressed: {
    opacity: 0.7,
  },
});