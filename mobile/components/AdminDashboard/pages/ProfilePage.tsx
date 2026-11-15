import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useAuth } from '@/context/AuthContext';
import { getCurrentUser, getToken, updateCurrentUser } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';

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
  branch: 'Assigned Branch',
  access: 'Assigned Branch Only',
  status: 'Active',
};

export default function ProfilePage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const isDesktop = width >= 900;

  const { user, updateUser, logout } = useAuth();

  const [profile, setProfile] = useState<AdminProfile>(initialProfile);
  const [editVisible, setEditVisible] = useState(false);
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);

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

  // Fetch active branches to resolve branch name if only branchId was provided
  const fetchBranches = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/branches/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (json.success && Array.isArray(json.data?.branches)) {
        setBranches(
          json.data.branches.map((b: any) => ({
            id: String(b._id ?? b.id ?? ''),
            name: String(b.name ?? ''),
          }))
        );
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  // Sync profile state with live user data from backend
  useEffect(() => {
    if (!user) return;

    let bName = 'Assigned Branch';
    if (user.branchId && typeof user.branchId === 'object' && (user.branchId as any).name) {
      bName = (user.branchId as any).name;
    } else {
      const bId = typeof user.branchId === 'string' ? user.branchId : (user.branchId as any)?._id;
      if (bId) {
        const match = branches.find((b) => b.id === bId);
        if (match) bName = match.name;
      }
    }

    setProfile({
      profileTitle: user.fullName || 'Admin',
      email: user.email || '',
      role: 'Administrator',
      branch: bName,
      access: 'Assigned Branch Only',
      status: user.status === 'active' ? 'Active' : 'Inactive',
    });
  }, [user, branches]);

  // Auto-refresh profile on screen focus
  useFocusEffect(
    useCallback(() => {
      const refreshMe = async () => {
        try {
          const freshUser = await getCurrentUser();
          if (freshUser) {
            updateUser(freshUser);
          }
        } catch {
          // Ignore
        }
      };
      void refreshMe();
    }, [updateUser])
  );

  const openEditProfile = () => {
    setEditTitle(profile.profileTitle);
    setEditEmail(profile.email);
    setEditVisible(true);
  };

  const saveProfile = async () => {
    const trimmedTitle = editTitle.trim();
    const trimmedEmail = editEmail.trim().toLowerCase();

    if (!trimmedTitle || !trimmedEmail) {
      Alert.alert('Required Fields', 'Profile Title and Email are required.');
      return;
    }

    if (trimmedTitle.length < 2) {
      Alert.alert('Invalid Name', 'Profile Title must contain at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const response = await updateCurrentUser(
        trimmedTitle,
        trimmedEmail,
        user?.mobileNumber || ''
      );

      if (!response.success || !response.data?.user) {
        Alert.alert('Update Failed', response.message || 'Unable to update profile.');
        return;
      }

      const updatedUserData = response.data.user;
      updateUser(updatedUserData);
      setProfile((current) => ({
        ...current,
        profileTitle: updatedUserData.fullName,
        email: updatedUserData.email,
      }));
      setEditVisible(false);
      Alert.alert('Profile Updated', 'Your profile information has been updated successfully.');
    } catch (error: any) {
      Alert.alert('Update Failed', error?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLogoutVisible(false);
    try {
      if (router.canDismiss?.()) {
        router.dismissAll();
      }
      await logout();
      router.replace('/(auth)');
    } catch {
      Alert.alert('Logout Failed', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />

      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 8, minHeight: insets.top + 66 },
          isMobile && styles.headerMobile,
          isTablet && styles.headerTablet,
        ]}
      >
        <Pressable
          style={[styles.backButton, isMobile && styles.backButtonMobile]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={21} color="#FFFFFF" />
        </Pressable>

        <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]} numberOfLines={1}>
          Profile
        </Text>

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

            <Pressable
              style={styles.primaryButton}
              onPress={openEditProfile}
              accessibilityRole="button"
              accessibilityLabel="Edit Profile"
            >
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

              {/* CHANGE PASSWORD */}
              <Pressable
                style={styles.accountOption}
                onPress={() => {
                  router.push({
                    pathname: '/(admin)/explore',
                    params: { feature: 'Change Password' },
                  });
                }}
              >
                <View style={styles.optionIcon}>
                  <MaterialCommunityIcons
                    name="shield-lock-outline"
                    size={20}
                    color="#7040D5"
                  />
                </View>

                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>Change Password</Text>
                  <Text style={styles.optionSubtitle}>
                    Update your account password
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
                You can access and manage data only for your assigned branch.
              </Text>
            </View>
          </View>

          <View style={styles.brandingFooter}>
            <Image
              source={require('@/assets/images/android-icon-foreground.png')}
              style={styles.brandingLogo}
              resizeMode="contain"
            />
            <Text style={styles.brandingTitle}>VERTICAL LIMIT</Text>
            <Text style={styles.brandingSubtitle}>Admin Portal • Coaching Institute ERP</Text>
          </View>
        </View>
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
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
              editable={!saving}
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
              editable={!saving}
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
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={() => void saveProfile()}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* LOGOUT CONFIRMATION MODAL */}
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
                onPress={() => void handleLogout()}
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
    width: '100%',
    backgroundColor: '#6D35D8',
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerMobile: { height: 80, paddingHorizontal: 14 },
  headerTablet: { height: 64, paddingHorizontal: 20 },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonMobile: { width: 36, height: 36, borderRadius: 10, marginRight: 12 },

  headerTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  headerTitleMobile: { fontSize: 20 },

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
    marginBottom: 14,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 14,
    color: '#7B8496',
    marginTop: 2,
  },

  mainLayout: {
    width: '100%',
  },

  desktopMainLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  desktopProfileCard: {
    width: '49%',
    marginBottom: 16,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  profileIdentity: {
    flex: 1,
  },

  profileName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    lineHeight: 17,
    color: '#172033',
  },

  profileRole: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    lineHeight: 13,
    color: '#7040D5',
    marginTop: 1,
  },

  profileEmail: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 12,
    color: '#8A93A4',
    marginTop: 1,
  },

  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F8EF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },

  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#22945F',
  },

  activeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#22945F',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F1F5',
    marginVertical: 12,
  },

  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },

  detailItem: {
    width: '48%',
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    lineHeight: 11,
    color: '#8A93A4',
  },

  detailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    lineHeight: 13,
    color: '#172033',
    marginTop: 1,
  },

  primaryButton: {
    backgroundColor: '#7040D5',
    borderRadius: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  primaryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  desktopAccountCard: {
    width: '49%',
    marginBottom: 16,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 12,
    color: '#8A93A4',
    marginTop: 1,
  },

  accountOptions: {
    marginTop: 10,
    gap: 8,
  },

  accountOption: {
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  logoutIcon: {
    backgroundColor: '#FFE9F0',
  },

  optionTextContainer: {
    flex: 1,
  },

  optionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    lineHeight: 14,
    color: '#172033',
  },

  logoutTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    lineHeight: 14,
    color: '#E95386',
  },

  optionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    lineHeight: 11,
    color: '#8A93A4',
    marginTop: 1,
  },

  accessCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  desktopAccessCard: {
    width: '100%',
    marginBottom: 16,
  },

  accessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  accessIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  accessHeaderText: {
    flex: 1,
  },

  accessTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    lineHeight: 16,
    color: '#172033',
  },

  accessSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 12,
    color: '#8A93A4',
    marginTop: 1,
  },

  accessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  accessLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#687386',
  },

  branchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EAFF',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    gap: 4,
  },

  branchBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#7040D5',
  },

  accessValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#172033',
  },

  accessNotice: {
    marginTop: 10,
    backgroundColor: '#F8F9FC',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  accessNoticeText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    lineHeight: 12,
    color: '#7040D5',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 24, 35, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    lineHeight: 18,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 12,
    color: '#8A93A4',
    marginTop: 1,
  },

  modalClose: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#59657A',
    marginBottom: 4,
    marginTop: 7,
  },

  input: {
    minHeight: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 10,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#172033',
    backgroundColor: '#FFFFFF',
  },

  readOnlyField: {
    minHeight: 38,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#EAECEF',
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  readOnlyText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#7040D5',
  },

  readOnlyHint: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8A93A4',
    marginTop: 4,
    marginBottom: 10,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },

  cancelButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E5EC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#687386',
  },

  saveButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#FFFFFF',
  },

  logoutModal: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },

  logoutModalIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFE9F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  logoutModalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    lineHeight: 18,
    color: '#172033',
    marginBottom: 4,
  },

  logoutModalText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 13,
    color: '#7B8496',
    textAlign: 'center',
    marginBottom: 14,
  },

  logoutConfirmButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#E95386',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandingFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 8,
    opacity: 0.88,
  },
  brandingLogo: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  brandingTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#21104F',
    letterSpacing: 0.5,
  },
  brandingSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8792A4',
    marginTop: 2,
  },
});
