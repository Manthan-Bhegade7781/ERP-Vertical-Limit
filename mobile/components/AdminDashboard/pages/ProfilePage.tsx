import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type AdminProfile = {
  profileTitle: string;
  email: string;
  role: string;
  branch: string;
  access: string;
  status: 'Active' | 'Inactive';
};

const initialProfile: AdminProfile = {
  profileTitle: 'Admin',
  email: 'admin@coachingerp.com',
  role: 'Administrator',
  branch: 'Pune Branch',
  access: 'Assigned Branch Only',
  status: 'Active',
};

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [profile, setProfile] = useState<AdminProfile>(initialProfile);
  const [editVisible, setEditVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const [editTitle, setEditTitle] = useState(initialProfile.profileTitle);
  const [editEmail, setEditEmail] = useState(initialProfile.email);

  useEffect(() => {
    const configureNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('transparent');
        await NavigationBar.setButtonStyleAsync('dark');
        await NavigationBar.setPositionAsync('absolute');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
      } catch (error) {
        console.log('Navigation bar configuration error:', error);
      }
    };

    configureNavigationBar();
  }, []);

  const openEditProfile = () => {
    setEditTitle(profile.profileTitle);
    setEditEmail(profile.email);
    setEditVisible(true);
  };

  const saveProfile = () => {
    setProfile((current) => ({
      ...current,
      profileTitle: editTitle.trim() || current.profileTitle,
      email: editEmail.trim() || current.email,
    }));
    setEditVisible(false);
  };

  const handleLogout = () => {
    setLogoutVisible(false);
    console.log('Admin logout');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={21} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          isDesktop && styles.desktopContent,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>My Profile</Text>
          <Text style={styles.pageSubtitle}>
            View and manage your admin profile
          </Text>
        </View>

        <View
          style={[
            styles.mainLayout,
            isDesktop && styles.desktopMainLayout,
          ]}
        >
          <View
            style={[
              styles.profileCard,
              isDesktop && styles.desktopProfileCard,
            ]}
          >
            <View style={styles.profileTop}>
              <View style={styles.avatar}>
                <MaterialCommunityIcons
                  name="account"
                  size={30}
                  color="#7040D5"
                />
              </View>

              <View style={styles.profileIdentity}>
                <Text style={styles.profileName}>
                  {profile.profileTitle}
                </Text>
                <Text style={styles.profileRole}>{profile.role}</Text>
                <Text style={styles.profileEmail}>{profile.email}</Text>
              </View>

              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>{profile.status}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsGrid}>
              <DetailItem
                icon="account-outline"
                label="Profile Title"
                value={profile.profileTitle}
              />
              <DetailItem
                icon="email-outline"
                label="Email"
                value={profile.email}
              />
              <DetailItem
                icon="shield-account-outline"
                label="Role"
                value={profile.role}
              />
              <DetailItem
                icon="office-building-outline"
                label="Branch"
                value={profile.branch}
              />
              <DetailItem
                icon="lock-outline"
                label="Access"
                value={profile.access}
              />
              <DetailItem
                icon="check-circle-outline"
                label="Account Status"
                value={profile.status}
              />
            </View>

            <Pressable style={styles.primaryButton} onPress={openEditProfile}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.primaryButtonText}>Edit Profile</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.accountCard,
              isDesktop && styles.desktopAccountCard,
            ]}
          >
            <Text style={styles.sectionTitle}>Account</Text>
            <Text style={styles.sectionSubtitle}>
              Manage your account
            </Text>

            <View style={styles.accountOptions}>
              {/* WORKING MY PROFILE BUTTON */}
              <Pressable
                style={styles.accountOption}
                onPress={openEditProfile}
              >
                <View style={styles.optionIcon}>
                  <MaterialCommunityIcons
                    name="account-outline"
                    size={20}
                    color="#7040D5"
                  />
                </View>

                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>My Profile</Text>
                  <Text style={styles.optionSubtitle}>
                    View your profile information
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9AA2B1"
                />
              </Pressable>

              {/* LOGOUT */}
              <Pressable
                style={styles.accountOption}
                onPress={() => setLogoutVisible(true)}
              >
                <View style={[styles.optionIcon, styles.logoutIcon]}>
                  <MaterialCommunityIcons
                    name="logout"
                    size={20}
                    color="#E95386"
                  />
                </View>

                <View style={styles.optionTextContainer}>
                  <Text style={styles.logoutTitle}>Logout</Text>
                  <Text style={styles.optionSubtitle}>
                    Sign out from your admin account
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#9AA2B1"
                />
              </Pressable>
            </View>
          </View>

          <View
            style={[
              styles.accessCard,
              isDesktop && styles.desktopAccessCard,
            ]}
          >
            <View style={styles.accessHeader}>
              <View style={styles.accessIcon}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={22}
                  color="#7040D5"
                />
              </View>

              <View style={styles.accessHeaderText}>
                <Text style={styles.accessTitle}>Admin Access</Text>
                <Text style={styles.accessSubtitle}>
                  Your account is restricted to the assigned branch.
                </Text>
              </View>
            </View>

            <View style={styles.accessRow}>
              <Text style={styles.accessLabel}>Assigned Branch</Text>

              <View style={styles.branchBadge}>
                <MaterialCommunityIcons
                  name="office-building-outline"
                  size={14}
                  color="#7040D5"
                />
                <Text style={styles.branchBadgeText}>
                  {profile.branch}
                </Text>
              </View>
            </View>

            <View style={styles.accessRow}>
              <Text style={styles.accessLabel}>Access Level</Text>
              <Text style={styles.accessValue}>
                Assigned Branch Only
              </Text>
            </View>

            <View style={styles.accessNotice}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color="#7040D5"
              />
              <Text style={styles.accessNoticeText}>
                You can access and manage data only for your assigned
                branch.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* EDIT PROFILE */}
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update your profile information
                </Text>
              </View>

              <Pressable
                style={styles.modalClose}
                onPress={() => setEditVisible(false)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#667085"
                />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Profile Title</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter profile title"
              placeholderTextColor="#A2A9B7"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="Enter email"
              placeholderTextColor="#A2A9B7"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.inputLabel}>Assigned Branch</Text>
            <View style={styles.readOnlyField}>
              <MaterialCommunityIcons
                name="office-building-outline"
                size={17}
                color="#7040D5"
              />
              <Text style={styles.readOnlyText}>
                {profile.branch}
              </Text>
              <MaterialCommunityIcons
                name="lock-outline"
                size={15}
                color="#98A2B3"
              />
            </View>

            <Text style={styles.readOnlyHint}>
              Branch access is assigned by Super Admin.
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOGOUT */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <View style={styles.logoutModalIcon}>
              <MaterialCommunityIcons
                name="logout"
                size={25}
                color="#E95386"
              />
            </View>

            <Text style={styles.logoutModalTitle}>Logout</Text>

            <Text style={styles.logoutModalText}>
              Are you sure you want to logout from your admin account?
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setLogoutVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.logoutConfirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.saveButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

type DetailItemProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  value: string;
};

function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color="#7040D5"
        />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    height: 64,
    backgroundColor: '#6D35D8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },

  headerTitle: {
    marginLeft: 12,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 25,
    color: '#FFFFFF',
  },

  headerSpacer: {
    flex: 1,
  },

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  desktopContent: {
    paddingHorizontal: 32,
    paddingTop: 22,
    maxWidth: 1250,
    width: '100%',
    alignSelf: 'center',
  },

  pageHeading: {
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 25,
    color: '#172033',
  },

  pageSubtitle: {
    marginTop: 3,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
    color: '#8792A4',
  },

  mainLayout: {
    width: '100%',
  },

  desktopMainLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 18,
  },

  profileCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },

  desktopProfileCard: {
    width: '58%',
    marginBottom: 0,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIdentity: {
    flex: 1,
    marginLeft: 13,
  },

  profileName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: '#172033',
  },

  profileRole: {
    marginTop: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#7040D5',
  },

  profileEmail: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8792A4',
  },

  activeBadge: {
    minWidth: 64,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#35B878',
    marginRight: 5,
  },

  activeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#26945F',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F5',
    marginTop: 17,
    marginBottom: 15,
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  detailItem: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  detailIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    flex: 1,
    marginLeft: 8,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 13,
    color: '#8792A4',
  },

  detailValue: {
    marginTop: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    lineHeight: 15,
    color: '#202B3E',
  },

  primaryButton: {
    height: 34,
    borderRadius: 8,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 4,
  },

  primaryButtonText: {
    marginLeft: 6,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  accountCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },

  desktopAccountCard: {
    width: '40%',
    marginBottom: 0,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 20,
    color: '#172033',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8792A4',
  },

  accountOptions: {
    marginTop: 13,
  },

  accountOption: {
    minHeight: 58,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIcon: {
    backgroundColor: '#FFE9F0',
  },

  optionTextContainer: {
    flex: 1,
    marginLeft: 10,
  },

  optionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#202B3E',
  },

  logoutTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#E95386',
  },

  optionSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 13,
    color: '#8792A4',
  },

  accessCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  desktopAccessCard: {
    width: '58%',
    marginTop: 18,
  },

  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  accessIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  accessHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  accessTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  accessSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#8792A4',
  },

  accessRow: {
    minHeight: 42,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    marginTop: 13,
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  accessLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8792A4',
  },

  accessValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202B3E',
  },

  branchBadge: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  branchBadgeText: {
    marginLeft: 5,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  accessNotice: {
    marginTop: 13,
    padding: 10,
    borderRadius: 9,
    backgroundColor: '#F7F4FF',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  accessNoticeText: {
    flex: 1,
    marginLeft: 7,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#6F7788',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  modalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 21,
    color: '#172033',
  },

  modalSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8792A4',
  },

  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: {
    marginBottom: 6,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202B3E',
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#202B3E',
    backgroundColor: '#FFFFFF',
  },

  readOnlyField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FC',
  },

  readOnlyText: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202B3E',
  },

  readOnlyHint: {
    marginTop: 5,
    marginBottom: 4,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#98A2B3',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
  },

  cancelButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E3E6EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#667085',
  },

  saveButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  logoutModal: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  logoutModalIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#FFE9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  logoutModalTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  logoutModalText: {
    marginTop: 6,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#8792A4',
    textAlign: 'center',
  },

  logoutConfirmButton: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    backgroundColor: '#E95386',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
