import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";

type TeacherHeaderProps = {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
};

export default function TeacherHeader({
  onMenuPress,
  onNotificationPress,
  onProfilePress,
}: TeacherHeaderProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("Welcome back,");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      setGreeting(
        hour >= 5 && hour < 12 ? "Good Morning," :
        hour >= 12 && hour < 17 ? "Good Afternoon," :
        hour >= 17 && hour < 21 ? "Good Evening," : "Good Night,"
      );
    };
    updateGreeting();
    const timer = setInterval(updateGreeting, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 2 }]}>
      <View style={styles.topRow}>
        <Pressable onPress={onMenuPress} style={styles.menuButton}
          accessibilityRole="button" accessibilityLabel="Open navigation menu">
          <Ionicons name="menu" size={29} color="#FFFFFF" />
        </Pressable>
        <View style={styles.heading}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.welcome} numberOfLines={2}>
            {greeting}{''}{user?.fullName || "Teacher"}
          </Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={onNotificationPress} style={styles.notificationButton}
            accessibilityRole="button" accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={27} color="#FFFFFF" />
            <View style={styles.notificationBadge}><View style={styles.notificationDot} /></View>
          </Pressable>
          <Pressable onPress={onProfilePress} style={styles.avatar}
            accessibilityRole="button" accessibilityLabel="Profile">
            <Ionicons name="person" size={25} color="#7040D5" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#5122C8",
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topRow: { minHeight: 82, flexDirection: "row", alignItems: "center" },
  menuButton: {
    width: 42, height: 48, alignItems: "flex-start",
    justifyContent: "center", marginRight: 8, marginTop: 0,
  },
  heading: { flex: 1, minWidth: 0, paddingTop: 0 },
  title: { color: "#FFFFFF", fontFamily: "PoppinsSemiBold", fontSize: 20, lineHeight: 25 },
  welcome: { color: "#E9DFFF", fontFamily: "PoppinsMedium", fontSize: 11, lineHeight: 15, marginTop: 3 },
  actions: { flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 6, marginTop: 0 },
  notificationButton: {
    width: 40, height: 40, borderRadius: 12, borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute", right: 0, top: -4, width: 17, height: 17,
    borderRadius: 9, backgroundColor: "#F04444", alignItems: "center", justifyContent: "center",
  },
  notificationDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFFF" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
});
