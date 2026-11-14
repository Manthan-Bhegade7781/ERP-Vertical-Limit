import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

type SidebarProps = {
  activeItem?: string;
  teacherName?: string;
  onItemPress?: (item: string) => void;
};

const groups = [
  {
    heading: "TEACHING",
    items: [
      ["Batches", "account-multiple-outline"],
      ["Students", "account-group-outline"],
      ["Attendance", "calendar-check-outline"],
      ["PTG Schedule", "account-voice"],
      ["Examinations", "file-document-edit-outline"],
      ["Assignments", "clipboard-text-outline"],
      ["Academic Calendar", "calendar-month-outline"],
    ],
  },
  {
    heading: "PERSONAL",
    items: [
      ["My Leave", "calendar-clock-outline"],
    ],
  },
  {
    heading: "COMMUNICATION",
    items: [
      ["Messages", "message-text-outline"],
    ],
  },
] as const;

const routeLabels: Record<string, string> = {
  home: "Dashboard",
  batches: "Batches",
  students: "Students",
  attendance: "Attendance",
  ptg: "PTG Schedule",
  examinations: "Examinations",
  assignments: "Assignments",
  academicCalendar: "Academic Calendar",
  "my-leave": "My Leave",
  messages: "Messages",
  profile: "Profile",
  reports: "Students",
};

export default function TeacherSidebar({
  activeItem = "home",
  teacherName,
  onItemPress,
}: SidebarProps) {
  const { user } = useAuth();

  const activeLabel = routeLabels[activeItem] || activeItem;

  const renderItem = (label: string, icon: string) => {
    const active = activeLabel === label;

    return (
      <TouchableOpacity
        key={label}
        style={[styles.menuItem, active && styles.activeMenuItem]}
        activeOpacity={0.72}
        onPress={() => onItemPress?.(label)}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={22}
          color={active ? "#7040D5" : "#66768A"}
        />

        <Text style={[styles.menuText, active && styles.activeText]}>
          {label}
        </Text>

        {active && <View style={styles.activeIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* BRAND */}

      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons
            name="school-outline"
            size={32}
            color="#7040D5"
          />
        </View>

        <View>
          <Text style={styles.brandTitle}>VLCC ERP</Text>
          <Text style={styles.brandSubtitle}>Teacher Portal</Text>
        </View>
      </View>

      {/* NAVIGATION */}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {renderItem("Dashboard", "view-dashboard-outline")}

        {groups.map((group) => (
          <View key={group.heading}>
            <Text style={styles.sectionTitle}>{group.heading}</Text>

            {group.items.map(([label, icon]) =>
              renderItem(label, icon)
            )}
          </View>
        ))}
      </ScrollView>

      {/* PROFILE */}

      <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => onItemPress?.("Profile")}
        >
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={25}
              color="#7040D5"
            />
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {teacherName || user?.fullName || "Teacher"}
            </Text>

            <Text style={styles.profileRole}>Teacher</Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={23}
            color="#9AA8B8"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  brand: {
    height: 145,
    paddingHorizontal: 28,
    paddingTop: 25,
    flexDirection: "row",
    alignItems: "center",
  },

  brandIcon: {
    width: 55,
    height: 55,
    borderRadius: 16,
    backgroundColor: "#F0ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  brandTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 21,
    color: "#7040D5",
  },

  brandSubtitle: {
    fontFamily: "PoppinsMedium",
    fontSize: 14,
    color: "#7040D5",
  },

  scroll: {
    flex: 1,
  },

  menuContent: {
    paddingHorizontal: 29,
    paddingBottom: 12,
  },

  menuItem: {
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    borderRadius: 9,
  },

  activeMenuItem: {
    backgroundColor: "#F5F1FF",
  },

  menuText: {
    marginLeft: 16,
    flex: 1,
    fontFamily: "PoppinsMedium",
    fontSize: 15,
    color: "#4D5B6D",
  },

  activeText: {
    color: "#7040D5",
    fontFamily: "PoppinsSemiBold",
  },

  activeIndicator: {
    width: 4,
    height: 25,
    backgroundColor: "#7040D5",
    borderRadius: 5,
  },

  sectionTitle: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 11,
    letterSpacing: 0.7,
    color: "#9AA8B8",
    marginTop: 16,
    marginBottom: 6,
    paddingHorizontal: 5,
  },

  profileContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E8ED",
    paddingHorizontal: 20,
    paddingVertical: 13,
  },

  profileCard: {
    minHeight: 82,
    borderWidth: 1,
    borderColor: "#E1E3E8",
    borderRadius: 17,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#F0ECFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  profileInfo: {
    flex: 1,
    minWidth: 0,
  },

  profileName: {
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    color: "#202A3A",
  },

  profileRole: {
    fontFamily: "PoppinsRegular",
    fontSize: 11.5,
    color: "#9AA8B8",
    marginTop: 2,
  },
});