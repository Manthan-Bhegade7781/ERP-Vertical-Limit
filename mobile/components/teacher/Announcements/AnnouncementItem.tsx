import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type AnnouncementItemProps = {
  title: string;
  description: string;
  date: string;
  author: string;
  onPress?: () => void;
};

export default function AnnouncementItem({
  title,
  description,
  date,
  author,
  onPress,
}: AnnouncementItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.iconBox}>
        <Ionicons
          name="megaphone-outline"
          size={30}
          color="#6630D7"
        />
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          {title}
        </Text>

        <Text
          style={styles.description}
          numberOfLines={2}
        >
          {description}
        </Text>

        <Text style={styles.meta}>
          {date} • {author}
        </Text>

      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#6630D7"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FF',
    borderRadius: 14,
    padding: 12,
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 13,
    backgroundColor: '#EDE4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    color: '#171A2B',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },

  description: {
    color: '#303545',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 2,
  },

  meta: {
    color: '#666C7A',
    fontSize: 12,
  },

  pressed: {
    opacity: 0.72,
  },
});