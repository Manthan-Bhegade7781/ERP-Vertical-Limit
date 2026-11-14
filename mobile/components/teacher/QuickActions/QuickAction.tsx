import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type QuickActionProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  background: string;
  onPress?: () => void;
};

export default function QuickAction({
  icon,
  label,
  color,
  background,
  onPress,
}: QuickActionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: background,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={color}
        />
      </View>

      <Text
        style={styles.label}
        numberOfLines={2}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48.5%",
    minHeight: 68,
    borderRadius: 15,
    backgroundColor: "#F8F8FB",
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
    flexShrink: 0,
  },

  label: {
    flex: 1,
    color: "#242637",
    fontSize: 11,
    lineHeight: 15,
    fontFamily: "PoppinsSemiBold",
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
