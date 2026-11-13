import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type LearningTabKey = 'lectureNotes' | 'studyMaterials' | 'assignments';

type LearningTabNavProps = {
  activeTab: LearningTabKey;
  onNavigate?: (tab: LearningTabKey) => void;
};

export default function LearningTabNav({
  activeTab,
  onNavigate,
}: LearningTabNavProps) {
  const tabs: {
    key: LearningTabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { key: 'lectureNotes', label: 'Lecture Notes', icon: 'book-outline' },
    { key: 'studyMaterials', label: 'Materials', icon: 'library-outline' },
    { key: 'assignments', label: 'Assignments', icon: 'document-text-outline' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tabButton, isActive && styles.tabButtonActive]}
            onPress={() => onNavigate?.(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={isActive ? '#6630D7' : '#777'}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ECE7F6',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#6630D7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#666',
  },
  tabTextActive: {
    fontFamily: 'PoppinsBold',
    color: '#6630D7',
  },
});
