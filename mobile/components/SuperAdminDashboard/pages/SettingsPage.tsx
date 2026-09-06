import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SettingItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  onPress: () => void;
};

type ToggleItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

const branches = [
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

const languages = [
  'English',
  'Hindi',
  'Marathi',
];

const dateFormats = [
  'DD MMM YYYY',
  'DD/MM/YYYY',
  'MM/DD/YYYY',
];

export default function SettingsPage() {
  const insets = useSafeAreaInsets();

  const [profileModalVisible, setProfileModalVisible] =
    useState(false);

  const [passwordModalVisible, setPasswordModalVisible] =
    useState(false);

  const [branchModalVisible, setBranchModalVisible] =
    useState(false);

  const [preferencesModalVisible, setPreferencesModalVisible] =
    useState(false);

  const [aboutModalVisible, setAboutModalVisible] =
    useState(false);

  const [fullName, setFullName] =
    useState('Super Admin');

  const [email, setEmail] =
    useState('admin@vlccerp.com');

  const [mobile, setMobile] =
    useState('+91 98765 43210');

  const [branch, setBranch] =
    useState('Main Branch');

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [selectedBranch, setSelectedBranch] =
    useState('Main Branch');

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [pushNotifications, setPushNotifications] =
    useState(true);

  const [announcementAlerts, setAnnouncementAlerts] =
    useState(true);

  const [feeAlerts, setFeeAlerts] =
    useState(true);

  const [attendanceAlerts, setAttendanceAlerts] =
    useState(true);

  const [examAlerts, setExamAlerts] =
    useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  const [autoLogout, setAutoLogout] =
    useState(true);

  const [selectedLanguage, setSelectedLanguage] =
    useState('English');

  const [selectedDateFormat, setSelectedDateFormat] =
    useState('DD MMM YYYY');

  const saveProfile = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert(
        'Required Fields',
        'Please enter your name and email.'
      );
      return;
    }

    setProfileModalVisible(false);

    Alert.alert(
      'Profile Updated',
      'Your profile information has been updated successfully.'
    );
  };

  const changePassword = () => {
    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      Alert.alert(
        'Required Fields',
        'Please fill in all password fields.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        'Password Mismatch',
        'New password and confirm password do not match.'
      );
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        'Invalid Password',
        'Password must contain at least 6 characters.'
      );
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(false);

    Alert.alert(
      'Password Changed',
      'Your password has been changed successfully.'
    );
  };

  const saveBranch = () => {
    setBranch(selectedBranch);
    setBranchModalVisible(false);

    Alert.alert(
      'Branch Updated',
      `Your active branch has been changed to ${selectedBranch}.`
    );
  };

  const savePreferences = () => {
    setPreferencesModalVisible(false);

    Alert.alert(
      'Preferences Saved',
      'Your system preferences have been saved successfully.'
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to restore the default settings?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setEmailNotifications(true);
            setPushNotifications(true);
            setAnnouncementAlerts(true);
            setFeeAlerts(true);
            setAttendanceAlerts(true);
            setExamAlerts(true);
            setDarkMode(false);
            setAutoLogout(true);
            setSelectedLanguage('English');
            setSelectedDateFormat('DD MMM YYYY');

            Alert.alert(
              'Settings Reset',
              'Default settings have been restored.'
            );
          },
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Settings
        </Text>

        <TouchableOpacity
          style={styles.saveHeaderButton}
          onPress={() => {
            Alert.alert(
              'Settings Saved',
              'Your current settings have been saved.'
            );
          }}
        >
          <MaterialCommunityIcons
            name="content-save-outline"
            size={15}
            color="#7040D5"
          />

          <Text style={styles.saveHeaderText}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.managementTitle}>
          Settings Management
        </Text>

        <Text style={styles.managementSubtitle}>
          Manage your account, notifications, security and system preferences
        </Text>

        {/* ACCOUNT */}

        <SectionTitle
          icon="account-circle-outline"
          title="Account"
        />

        <View style={styles.settingsCard}>
          <SettingItem
            icon="account-outline"
            iconColor="#7040D5"
            title="Profile Settings"
            description="Manage your name, email, mobile number and profile information."
            onPress={() =>
              setProfileModalVisible(true)
            }
          />

          <SettingItem
            icon="office-building-outline"
            iconColor="#2675E8"
            title="Branch Settings"
            description={`Current branch: ${branch}`}
            onPress={() => {
              setSelectedBranch(branch);
              setBranchModalVisible(true);
            }}
          />
        </View>

        {/* NOTIFICATIONS */}

        <SectionTitle
          icon="bell-outline"
          title="Notifications"
        />

        <View style={styles.settingsCard}>
          <ToggleItem
            icon="email-outline"
            iconColor="#2675E8"
            title="Email Notifications"
            description="Receive important ERP updates through email."
            value={emailNotifications}
            onValueChange={setEmailNotifications}
          />

          <ToggleItem
            icon="bell-outline"
            iconColor="#7040D5"
            title="Push Notifications"
            description="Receive notifications on your device."
            value={pushNotifications}
            onValueChange={setPushNotifications}
          />

          <ToggleItem
            icon="bullhorn-outline"
            iconColor="#35B878"
            title="Announcement Alerts"
            description="Get notified when new announcements are published."
            value={announcementAlerts}
            onValueChange={setAnnouncementAlerts}
          />

          <ToggleItem
            icon="cash-alert"
            iconColor="#F7941D"
            title="Fee Alerts"
            description="Receive alerts for fee collections and pending payments."
            value={feeAlerts}
            onValueChange={setFeeAlerts}
          />

          <ToggleItem
            icon="calendar-alert"
            iconColor="#E95386"
            title="Attendance Alerts"
            description="Receive attendance-related notifications."
            value={attendanceAlerts}
            onValueChange={setAttendanceAlerts}
          />

          <ToggleItem
            icon="school-outline"
            iconColor="#7040D5"
            title="Examination Alerts"
            description="Receive examination and result notifications."
            value={examAlerts}
            onValueChange={setExamAlerts}
          />
        </View>

        {/* SECURITY */}

        <SectionTitle
          icon="shield-lock-outline"
          title="Security"
        />

        <View style={styles.settingsCard}>
          <SettingItem
            icon="lock-reset"
            iconColor="#D84B63"
            title="Change Password"
            description="Update your account password."
            onPress={() =>
              setPasswordModalVisible(true)
            }
          />

          <ToggleItem
            icon="logout-variant"
            iconColor="#F7941D"
            title="Automatic Logout"
            description="Automatically sign out after a period of inactivity."
            value={autoLogout}
            onValueChange={setAutoLogout}
          />
        </View>

        {/* APPEARANCE */}

        <SectionTitle
          icon="palette-outline"
          title="Appearance"
        />

        <View style={styles.settingsCard}>
          <ToggleItem
            icon="theme-light-dark"
            iconColor="#7040D5"
            title="Dark Mode"
            description="Use dark appearance throughout the ERP portal."
            value={darkMode}
            onValueChange={(value) => {
              setDarkMode(value);

              if (value) {
                Alert.alert(
                  'Dark Mode',
                  'Dark mode preference has been enabled. Full theme support can be connected later.'
                );
              }
            }}
          />
        </View>

        {/* SYSTEM */}

        <SectionTitle
          icon="tune-variant"
          title="System Preferences"
        />

        <View style={styles.settingsCard}>
          <SettingItem
            icon="cog-outline"
            iconColor="#2675E8"
            title="Language & Date Format"
            description={`${selectedLanguage} • ${selectedDateFormat}`}
            onPress={() =>
              setPreferencesModalVisible(true)
            }
          />

          <SettingItem
            icon="database-outline"
            iconColor="#35B878"
            title="Data & Backup"
            description="Manage system data and backup preferences."
            onPress={() =>
              Alert.alert(
                'Data & Backup',
                'Backup and data-management options can be connected to the backend here.'
              )
            }
          />

          <SettingItem
            icon="history"
            iconColor="#F7941D"
            title="Activity Logs"
            description="Review recent account and system activities."
            onPress={() =>
              router.push({
                pathname: '/(tabs)/explore',
                params: {
                  feature: 'Audit Logs',
                },
              })
            }
          />
        </View>

        {/* SYSTEM ACTIONS */}

        <SectionTitle
          icon="application-cog-outline"
          title="System"
        />

        <View style={styles.settingsCard}>
          <SettingItem
            icon="information-outline"
            iconColor="#7040D5"
            title="About VLCC ERP"
            description="Application version, information and support."
            onPress={() =>
              setAboutModalVisible(true)
            }
          />

          <SettingItem
            icon="restore"
            iconColor="#D84B63"
            title="Reset Settings"
            description="Restore your preferences to their default values."
            onPress={resetSettings}
            danger
          />
        </View>

        {/* ACCOUNT SUMMARY */}

        <View style={styles.accountSummary}>
          <View style={styles.accountAvatar}>
            <MaterialCommunityIcons
              name="account"
              size={27}
              color="#7040D5"
            />
          </View>

          <View style={styles.accountSummaryContent}>
            <Text style={styles.accountName}>
              {fullName}
            </Text>

            <Text style={styles.accountEmail}>
              {email}
            </Text>

            <View style={styles.accountRoleBadge}>
              <Text style={styles.accountRoleText}>
                Super Admin
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() =>
              setProfileModalVisible(true)
            }
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={19}
              color="#7040D5"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* PROFILE MODAL */}

      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setProfileModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.largeModal}>
            <ModalHeader
              title="Profile Settings"
              subtitle="Update your profile information"
              onClose={() =>
                setProfileModalVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <InputField
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter full name"
              />

              <InputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter email"
                keyboardType="email-address"
              />

              <InputField
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
              />

              <InputField
                label="Branch"
                value={branch}
                onChangeText={setBranch}
                placeholder="Enter branch"
              />

              <View style={styles.infoBox}>
                <MaterialCommunityIcons
                  name="shield-account-outline"
                  size={20}
                  color="#7040D5"
                />

                <Text style={styles.infoBoxText}>
                  Role: Super Admin
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={saveProfile}
              >
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryButtonText}>
                  Save Profile
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PASSWORD MODAL */}

      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPasswordModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.largeModal}>
            <ModalHeader
              title="Change Password"
              subtitle="Update your account password"
              onClose={() =>
                setPasswordModalVisible(false)
              }
            />

            <ScrollView
              showsVerticalScrollIndicator={false}
            >
              <InputField
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                secureTextEntry
              />

              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                secureTextEntry
              />

              <InputField
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />

              <View style={styles.passwordInfo}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={18}
                  color="#2675E8"
                />

                <Text style={styles.passwordInfoText}>
                  Use at least 6 characters for your password.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={changePassword}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={19}
                  color="#FFFFFF"
                />

                <Text style={styles.primaryButtonText}>
                  Change Password
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* BRANCH MODAL */}

      <Modal
        visible={branchModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setBranchModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.largeModal}>
            <ModalHeader
              title="Branch Settings"
              subtitle="Select your active branch"
              onClose={() =>
                setBranchModalVisible(false)
              }
            />

            {branches.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.selectionRow,
                  selectedBranch === item &&
                    styles.selectionRowActive,
                ]}
                onPress={() =>
                  setSelectedBranch(item)
                }
              >
                <View
                  style={[
                    styles.selectionIcon,
                    selectedBranch === item &&
                      styles.selectionIconActive,
                  ]}
                >
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={19}
                    color={
                      selectedBranch === item
                        ? '#7040D5'
                        : '#7B8496'
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.selectionText,
                    selectedBranch === item &&
                      styles.selectionTextActive,
                  ]}
                >
                  {item}
                </Text>

                {selectedBranch === item && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color="#7040D5"
                  />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={saveBranch}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                Save Branch
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PREFERENCES MODAL */}

      <Modal
        visible={preferencesModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPreferencesModalVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.largeModal}>
            <ModalHeader
              title="System Preferences"
              subtitle="Configure language and date format"
              onClose={() =>
                setPreferencesModalVisible(false)
              }
            />

            <Text style={styles.inputLabel}>
              Language
            </Text>

            <View style={styles.optionWrap}>
              {languages.map((language) => (
                <TouchableOpacity
                  key={language}
                  style={[
                    styles.optionButton,
                    selectedLanguage === language &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedLanguage(language)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedLanguage === language &&
                        styles.optionTextActive,
                    ]}
                  >
                    {language}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>
              Date Format
            </Text>

            <View style={styles.optionWrap}>
              {dateFormats.map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[
                    styles.optionButton,
                    selectedDateFormat === format &&
                      styles.optionButtonActive,
                  ]}
                  onPress={() =>
                    setSelectedDateFormat(format)
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedDateFormat === format &&
                        styles.optionTextActive,
                    ]}
                  >
                    {format}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={savePreferences}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.primaryButtonText}>
                Save Preferences
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ABOUT MODAL */}

      <Modal
        visible={aboutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setAboutModalVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setAboutModalVisible(false)
          }
        >
          <Pressable
            style={styles.aboutModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.aboutIcon}>
              <MaterialCommunityIcons
                name="school-outline"
                size={31}
                color="#7040D5"
              />
            </View>

            <Text style={styles.aboutTitle}>
              VLCC ERP Portal
            </Text>

            <Text style={styles.aboutVersion}>
              Version 1.0.0
            </Text>

            <Text style={styles.aboutDescription}>
              VLCC ERP Portal provides centralized management for students, teachers, courses, branches, academics, accounts and administrative operations.
            </Text>

            <View style={styles.aboutInfoRow}>
              <Text style={styles.aboutLabel}>
                Application
              </Text>

              <Text style={styles.aboutValue}>
                VLCC ERP
              </Text>
            </View>

            <View style={styles.aboutInfoRow}>
              <Text style={styles.aboutLabel}>
                Version
              </Text>

              <Text style={styles.aboutValue}>
                1.0.0
              </Text>
            </View>

            <View style={styles.aboutInfoRow}>
              <Text style={styles.aboutLabel}>
                Role
              </Text>

              <Text style={styles.aboutValue}>
                Super Admin
              </Text>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                setAboutModalVisible(false)
              }
            >
              <Text style={styles.primaryButtonText}>
                Close
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/* =========================
   COMPONENTS
========================= */

function SectionTitle({
  icon,
  title,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      <View style={styles.sectionTitleIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={17}
          color="#7040D5"
        />
      </View>

      <Text style={styles.sectionTitleText}>
        {title}
      </Text>
    </View>
  );
}

function SettingItem({
  icon,
  iconColor,
  title,
  description,
  onPress,
  danger = false,
}: SettingItemProps & {
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: `${iconColor}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,
            danger && styles.dangerText,
          ]}
        >
          {title}
        </Text>

        <Text
          style={styles.settingDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color="#A1A9B8"
      />
    </TouchableOpacity>
  );
}

function ToggleItem({
  icon,
  iconColor,
  title,
  description,
  value,
  onValueChange,
}: ToggleItemProps) {
  return (
    <View style={styles.settingItem}>
      <View
        style={[
          styles.settingIcon,
          {
            backgroundColor: `${iconColor}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>
          {title}
        </Text>

        <Text
          style={styles.settingDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#DDE1E8',
          true: '#CFC0F5',
        }}
        thumbColor={
          value ? '#7040D5' : '#FFFFFF'
        }
      />
    </View>
  );
}

function ModalHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <View style={styles.modalHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.modalTitle}>
          {title}
        </Text>

        <Text style={styles.modalSubtitle}>
          {subtitle}
        </Text>
      </View>

      <TouchableOpacity onPress={onClose}>
        <MaterialCommunityIcons
          name="close"
          size={23}
          color="#667085"
        />
      </TouchableOpacity>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
}) {
  return (
    <View>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A2AABB"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

/* =========================
   STYLES
========================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 64,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
  },

  saveHeaderButton: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  saveHeaderText: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },

  managementSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#7B8496',
    marginBottom: 17,
  },

  /* SECTIONS */

  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
    marginBottom: 8,
    gap: 8,
  },

  sectionTitleIcon: {
    width: 31,
    height: 31,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionTitleText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 13,
  },

  /* SETTINGS CARD */

  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    paddingHorizontal: 12,
    marginBottom: 13,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 6,
    elevation: 2,
  },

  settingItem: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    paddingVertical: 9,
    gap: 10,
  },

  settingIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10.5,
  },

  settingDescription: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    lineHeight: 13,
    marginTop: 2,
  },

  dangerText: {
    color: '#D84B63',
  },

  /* ACCOUNT SUMMARY */

  accountSummary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E4DDF7',
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  accountAvatar: {
    width: 53,
    height: 53,
    borderRadius: 16,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  accountSummaryContent: {
    flex: 1,
    marginLeft: 10,
  },

  accountName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12.5,
  },

  accountEmail: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 1,
  },

  accountRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F1EAFF',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginTop: 4,
  },

  accountRoleText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 7.5,
  },

  /* MODALS */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(20, 24, 35, 0.48)',
    justifyContent: 'flex-end',
  },

  largeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    padding: 18,
    paddingBottom: 28,
  },

  aboutModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    padding: 20,
    alignItems: 'center',
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8A93A4',
    marginTop: 2,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    backgroundColor: '#FFFFFF',
  },

  primaryButton: {
    minHeight: 45,
    backgroundColor: '#7040D5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 17,
    marginBottom: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  infoBox: {
    marginTop: 13,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  infoBoxText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 9,
  },

  passwordInfo: {
    marginTop: 13,
    padding: 11,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  passwordInfoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#2675E8',
    fontSize: 8.5,
    lineHeight: 13,
  },

  /* BRANCH */

  selectionRow: {
    minHeight: 57,
    borderRadius: 11,
    paddingHorizontal: 10,
    marginBottom: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  selectionRowActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#D8CCF5',
  },

  selectionIcon: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#F5F6F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionIconActive: {
    backgroundColor: '#FFFFFF',
  },

  selectionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 10.5,
  },

  selectionTextActive: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
  },

  /* OPTIONS */

  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  optionButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E1E4EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#687386',
  },

  optionTextActive: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
  },

  /* ABOUT */

  aboutIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aboutTitle: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 17,
    marginTop: 12,
  },

  aboutVersion: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 9,
    marginTop: 2,
  },

  aboutDescription: {
    fontFamily: 'PoppinsRegular',
    color: '#687386',
    fontSize: 9.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 13,
    marginBottom: 12,
  },

  aboutInfoRow: {
    width: '100%',
    minHeight: 38,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  aboutLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
  },

  aboutValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 9,
  },
});