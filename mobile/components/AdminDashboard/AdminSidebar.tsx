import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter, usePathname } from 'expo-router';

type Props = {
  collapsed?: boolean;
  onClose?: () => void;
};

type MenuItem = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const managementItems: MenuItem[] = [
  { label: 'Students', icon: 'account-group-outline' },
  { label: 'Teachers', icon: 'account-tie-outline' },
  { label: 'Subjects', icon: 'book-open-outline' },
  { label: 'Batches', icon: 'account-multiple-outline' },
  { label: 'Attendance', icon: 'calendar-check-outline' },
  { label: 'Examinations', icon: 'file-document-edit-outline' },
  { label: 'Assignments', icon: 'clipboard-text-outline' },
  { label: 'Timetable', icon: 'calendar-clock-outline' },
  { label: 'Staff on Leave', icon: 'account-off-outline' },
  { label: 'PTG', icon: 'account-group-outline' },
  { label: 'Feedback', icon: 'message-text-outline' },
];

const communicationItems: MenuItem[] = [
  { label: 'Announcements', icon: 'bullhorn-outline' },
  { label: 'Messages', icon: 'message-text-outline' },
];

const settingsItems: MenuItem[] = [
  { label: 'Profile', icon: 'account-circle-outline' }
];

export default function AdminSidebar({ collapsed = false, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const handleItemPress = (feature: string) => {
    onClose?.();

    if (feature === 'Dashboard') {
      router.push('/(admin)');
      return;
    }

    if (feature === 'Profile') {
      router.push({ pathname: '/(admin)/explore', params: { feature: 'Profile' } });
      return;
    }

    router.push({ pathname: '/(admin)/explore', params: { feature } });
  };

  const isActive = (feature: string) => {
    if (feature === 'Dashboard') return pathname === '/(admin)' || pathname === '/(admin)/';
    return pathname.includes('/explore') && false;
  };

  const renderMenuItem = (item: MenuItem) => {
    const active = isActive(item.label);

    return (
      <Pressable
        key={item.label}
        onPress={() => handleItemPress(item.label)}
        style={[styles.menuItem, active && styles.menuItemActive, collapsed && styles.menuItemCollapsed]}
        accessibilityRole="button"
        accessibilityLabel={item.label}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={22}
          color={active ? '#7040D5' : '#66768A'}
        />
        {!collapsed && (
          <Text numberOfLines={1} style={[styles.menuText, active && styles.menuTextActive]}>
            {item.label}
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.sidebar, collapsed && styles.sidebarCollapsed]}>
      <View style={[styles.brandContainer, collapsed && styles.brandContainerCollapsed]}>
        <View style={styles.brandIcon}>
          <MaterialCommunityIcons name="school-outline" size={25} color="#FFFFFF" />
        </View>
        {!collapsed && (
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandTitle} numberOfLines={1}>VLCC ERP</Text>
            <Text style={styles.brandSubtitle}>ADMIN PANEL</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={[styles.menuContent, collapsed && styles.menuContentCollapsed]}
        showsVerticalScrollIndicator={false}
      >
        {renderMenuItem({ label: 'Dashboard', icon: 'view-dashboard-outline' })}

        {!collapsed && <Text style={styles.sectionTitle}>MANAGEMENT</Text>}
        {managementItems.map(renderMenuItem)}

        {!collapsed && <Text style={styles.sectionTitle}>COMMUNICATION</Text>}
        {communicationItems.map(renderMenuItem)}

        {!collapsed && <Text style={styles.sectionTitle}>PREFERENCES</Text>}
        {settingsItems.map(renderMenuItem)}
      </ScrollView>

      {!collapsed && (
        <View style={styles.accessBox}>
          <MaterialCommunityIcons name="shield-check-outline" size={22} color="#7040D5" />
          <View style={styles.accessText}>
            <Text style={styles.accessTitle}>Branch Access</Text>
            <Text style={styles.accessSubtitle}>Assigned branch only</Text>
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
    flexDirection: 'column',
  },
  sidebarCollapsed: {
    width: 80,
    alignItems: 'center',
  },
  brandContainer: {
    height: 70,
    width: '100%',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  brandContainerCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  brandIcon: {
    width: 50,
    height: 50,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandTextContainer: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
  },
  brandTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#172033',
  },
  brandSubtitle: {
    marginTop: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#8792A4',
    letterSpacing: 0.6,
  },
  menuScroll: { flex: 1, width: '100%' },
  menuContent: { paddingHorizontal: 10, paddingBottom: 15 },
  menuContentCollapsed: { paddingHorizontal: 8, width: '100%' },
  sectionTitle: {
    marginTop: 17,
    marginBottom: 7,
    paddingHorizontal: 10,
    color: '#9AA8B8',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  menuItem: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 11,
    marginBottom: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  menuItemActive: { backgroundColor: '#F1EAFF' },
  menuText: {
    flex: 1,
    marginLeft: 11,
    fontFamily: 'PoppinsMedium',
    fontSize: 14,
    color: '#66768A',
  },
  menuTextActive: { fontFamily: 'PoppinsSemiBold', color: '#7040D5' },
  accessBox: {
    margin: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#F7F4FF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessText: { flex: 1, marginLeft: 8 },
  accessTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 9, color: '#202B3E' },
  accessSubtitle: { marginTop: 2, fontFamily: 'PoppinsRegular', fontSize: 8, color: '#8792A4' },
});
