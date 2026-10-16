
import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, usePathname } from 'expo-router';

type Props = {
  collapsed?: boolean;
  onClose?: () => void;
};

const menu = [
  { label: 'Dashboard', icon: 'home-outline' },
  { label: 'Students', icon: 'account-outline' },
  { label: 'Teachers', icon: 'account-tie-outline' },
  { label: 'Subjects', icon: 'book-outline' },
  { label: 'Batches', icon: 'account-group-outline' },
  { label: 'Attendance', icon: 'calendar-check-outline' },
  { label: 'Examinations', icon: 'file-document-outline' },
  { label: 'Assignments', icon: 'clipboard-outline' },
  { label: 'Performance', icon: 'chart-line' },
  { label: 'Announcements', icon: 'bullhorn-outline' },
  { label: 'Messages', icon: 'message-outline' },
  { label: 'Reports', icon: 'file-chart-outline' },
  { label: 'Timetable', icon: 'calendar-outline' },
  { label: 'Staff on Leave', icon: 'calendar-account-outline' },
  { label: 'PTG', icon: 'account-group-outline' },
  { label: 'Student Complaint', icon: 'alert-circle-outline' },
  { label: 'Feedback', icon: 'message-text-outline' },
  { label: 'Profile', icon: 'account-circle-outline' },
  { label: 'Settings', icon: 'cog-outline' },
] as const;

export default function AdminSidebar({ collapsed = false, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  function openFeature(feature: string) {
    onClose?.();

    if (feature === 'Dashboard') {
      router.push('/(admin)');
      return;
    }

    router.push({
      pathname: '/(admin)/explore',
      params: { feature },
    });
  }

  const activeFeature =
    pathname === '/(admin)'
      ? 'Dashboard'
      : undefined;

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <MaterialCommunityIcons
            name="school-outline"
            size={27}
            color="#FFF"
          />
        </View>

        {!collapsed && (
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Coaching ERP</Text>
            <Text style={styles.brandSubtitle}>ADMIN PANEL</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.menuScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuContent}
      >
        {menu.map((item) => {
          const isActive =
            activeFeature === item.label ||
            (pathname.includes('/explore') && false);

          return (
            <Pressable
              key={item.label}
              onPress={() => openFeature(item.label)}
              style={[
                styles.menuItem,
                isActive && styles.menuItemActive,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  item.icon as React.ComponentProps<
                    typeof MaterialCommunityIcons
                  >['name']
                }
                size={25}
                color={isActive ? '#7040D5' : '#7B8498'}
              />

              {!collapsed && (
                <Text
                  style={[
                    styles.menuText,
                    isActive && styles.menuTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {!collapsed && (
        <View style={styles.accessBox}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={22}
            color="#7040D5"
          />

          <View style={styles.accessText}>
            <Text style={styles.accessTitle}>Branch Access</Text>
            <Text style={styles.accessSubtitle}>
              Assigned branch only
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 270,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#EEF0F5',
    paddingTop: 18,
  },

  sidebarCollapsed: {
    width: 80,
    alignItems: 'center',
  },

  brand: {
    height: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  brandText: {
    marginLeft: 10,
  },

  brandTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  brandSubtitle: {
    marginTop: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#8792A4',
    letterSpacing: 0.5,
  },

  menuScroll: {
    flex: 1,
  },

  menuContent: {
    paddingHorizontal: 10,
    paddingBottom: 15,
  },

  menuItem: {
    minHeight: 48,
    borderRadius: 10,
    paddingHorizontal: 11,
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemActive: {
    backgroundColor: '#F1EAFF',
  },

  menuText: {
    marginLeft: 11,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#7B8498',
  },

  menuTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  accessBox: {
    margin: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#F7F4FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  accessText: {
    flex: 1,
    marginLeft: 8,
  },

  accessTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#202B3E',
  },

  accessSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8792A4',
  },
});
