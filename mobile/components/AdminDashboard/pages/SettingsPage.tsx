import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Switch,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type SettingRowProps = {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  subtitle: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

export default function SettingsPage() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [assignmentAlerts, setAssignmentAlerts] = useState(true);
  const [examinationAlerts, setExaminationAlerts] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);

  const [language, setLanguage] = useState('English');
  const [appearance, setAppearance] = useState('Light');

  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [sessionsModalVisible, setSessionsModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [appearanceModalVisible, setAppearanceModalVisible] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const savePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar
        style="light"
        backgroundColor="#6D35D8"
        translucent={false}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={21}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>Settings</Text>

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
        {/* PAGE HEADING */}
        <View style={styles.pageHeading}>
          <Text style={styles.pageTitle}>Settings</Text>

          <Text style={styles.pageSubtitle}>
            Manage your account preferences and security
          </Text>
        </View>

        <View
          style={[
            styles.mainLayout,
            isDesktop && styles.desktopMainLayout,
          ]}
        >
          {/* NOTIFICATIONS */}
          <View
            style={[
              styles.card,
              isDesktop && styles.desktopNotificationCard,
            ]}
          >
            <View style={styles.cardHeading}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.cardHeadingText}>
                <Text style={styles.sectionTitle}>
                  Notifications
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Manage your notification preferences
                </Text>
              </View>
            </View>

            <View style={styles.rows}>
              <SettingRow
                icon="cellphone-message"
                title="Push Notifications"
                subtitle="Receive notifications on your device"
                right={
                  <Switch
                    value={pushNotifications}
                    onValueChange={setPushNotifications}
                    trackColor={{
                      false: '#D9DDE5',
                      true: '#CDBAF5',
                    }}
                    thumbColor={
                      pushNotifications ? '#7040D5' : '#FFFFFF'
                    }
                  />
                }
              />

              <SettingRow
                icon="email-outline"
                title="Email Notifications"
                subtitle="Receive important updates by email"
                right={
                  <Switch
                    value={emailNotifications}
                    onValueChange={setEmailNotifications}
                    trackColor={{
                      false: '#D9DDE5',
                      true: '#CDBAF5',
                    }}
                    thumbColor={
                      emailNotifications ? '#7040D5' : '#FFFFFF'
                    }
                  />
                }
              />

              <SettingRow
                icon="clipboard-text-outline"
                title="Assignment Alerts"
                subtitle="Get alerts about assignments"
                right={
                  <Switch
                    value={assignmentAlerts}
                    onValueChange={setAssignmentAlerts}
                    trackColor={{
                      false: '#D9DDE5',
                      true: '#CDBAF5',
                    }}
                    thumbColor={
                      assignmentAlerts ? '#7040D5' : '#FFFFFF'
                    }
                  />
                }
              />

              <SettingRow
                icon="file-document-outline"
                title="Examination Alerts"
                subtitle="Get alerts about examinations"
                right={
                  <Switch
                    value={examinationAlerts}
                    onValueChange={setExaminationAlerts}
                    trackColor={{
                      false: '#D9DDE5',
                      true: '#CDBAF5',
                    }}
                    thumbColor={
                      examinationAlerts ? '#7040D5' : '#FFFFFF'
                    }
                  />
                }
              />

              <SettingRow
                icon="bullhorn-outline"
                title="Announcement Alerts"
                subtitle="Get alerts for branch announcements"
                right={
                  <Switch
                    value={announcementAlerts}
                    onValueChange={setAnnouncementAlerts}
                    trackColor={{
                      false: '#D9DDE5',
                      true: '#CDBAF5',
                    }}
                    thumbColor={
                      announcementAlerts ? '#7040D5' : '#FFFFFF'
                    }
                  />
                }
              />
            </View>
          </View>

          {/* SECURITY */}
          <View
            style={[
              styles.card,
              isDesktop && styles.desktopSecurityCard,
            ]}
          >
            <View style={styles.cardHeading}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.cardHeadingText}>
                <Text style={styles.sectionTitle}>
                  Security
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Manage your account security
                </Text>
              </View>
            </View>

            <View style={styles.rows}>
              <SettingRow
                icon="lock-reset"
                title="Change Password"
                subtitle="Update your account password"
                onPress={() => setPasswordModalVisible(true)}
                right={
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#9AA2B1"
                  />
                }
              />

              <SettingRow
                icon="devices"
                title="Active Sessions"
                subtitle="View and manage active sessions"
                onPress={() => setSessionsModalVisible(true)}
                right={
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#9AA2B1"
                  />
                }
              />
            </View>
          </View>

          {/* PREFERENCES */}
          <View
            style={[
              styles.card,
              isDesktop && styles.desktopPreferencesCard,
            ]}
          >
            <View style={styles.cardHeading}>
              <View style={styles.cardIcon}>
                <MaterialCommunityIcons
                  name="tune-variant"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View style={styles.cardHeadingText}>
                <Text style={styles.sectionTitle}>
                  Preferences
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Customize your app experience
                </Text>
              </View>
            </View>

            <View style={styles.rows}>
              <SettingRow
                icon="translate"
                title="Language"
                subtitle="Choose your application language"
                onPress={() => setLanguageModalVisible(true)}
                right={
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>
                      {language}
                    </Text>

                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color="#9AA2B1"
                    />
                  </View>
                }
              />

              <SettingRow
                icon="theme-light-dark"
                title="Appearance"
                subtitle="Choose your preferred appearance"
                onPress={() => setAppearanceModalVisible(true)}
                right={
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueText}>
                      {appearance}
                    </Text>

                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18}
                      color="#9AA2B1"
                    />
                  </View>
                }
              />
            </View>
          </View>

          {/* ADMIN ACCESS INFORMATION */}
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
                <Text style={styles.accessTitle}>
                  Admin Access
                </Text>

                <Text style={styles.accessSubtitle}>
                  Settings are limited to personal account preferences.
                </Text>
              </View>
            </View>

            <View style={styles.accessNotice}>
              <MaterialCommunityIcons
                name="information-outline"
                size={16}
                color="#7040D5"
              />

              <Text style={styles.accessNoticeText}>
                Branch management, user roles, permissions, and system
                configuration are controlled by Super Admin.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        visible={passwordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title="Change Password"
              subtitle="Update your account password"
              onClose={() => setPasswordModalVisible(false)}
            />

            <Text style={styles.inputLabel}>
              Current Password
            </Text>

            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor="#A2A9B7"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.inputLabel}>
              New Password
            </Text>

            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor="#A2A9B7"
              secureTextEntry
              style={styles.input}
            />

            <Text style={styles.inputLabel}>
              Confirm Password
            </Text>

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor="#A2A9B7"
              secureTextEntry
              style={styles.input}
            />

            {newPassword &&
              confirmPassword &&
              newPassword !== confirmPassword && (
                <Text style={styles.errorText}>
                  Passwords do not match.
                </Text>
              )}

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={savePassword}
              >
                <Text style={styles.saveButtonText}>
                  Update Password
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ACTIVE SESSIONS MODAL */}
      <Modal
        visible={sessionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSessionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ModalHeader
              title="Active Sessions"
              subtitle="Devices currently signed in"
              onClose={() => setSessionsModalVisible(false)}
            />

            <View style={styles.sessionCard}>
              <View style={styles.sessionIcon}>
                <MaterialCommunityIcons
                  name="cellphone"
                  size={22}
                  color="#7040D5"
                />
              </View>

              <View style={styles.sessionInfo}>
                <Text style={styles.sessionTitle}>
                  Current Device
                </Text>

                <Text style={styles.sessionSubtitle}>
                  Android • Current session
                </Text>

                <Text style={styles.sessionStatus}>
                  Active now
                </Text>
              </View>

              <View style={styles.currentBadge}>
                <Text style={styles.currentBadgeText}>
                  Current
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.closeFullButton}
              onPress={() => setSessionsModalVisible(false)}
            >
              <Text style={styles.saveButtonText}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* LANGUAGE MODAL */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModal}>
            <ModalHeader
              title="Language"
              subtitle="Choose application language"
              onClose={() => setLanguageModalVisible(false)}
            />

            {['English', 'Hindi', 'Marathi'].map((item) => (
              <Pressable
                key={item}
                style={styles.choiceRow}
                onPress={() => {
                  setLanguage(item);
                  setLanguageModalVisible(false);
                }}
              >
                <Text style={styles.choiceText}>{item}</Text>

                {language === item && (
                  <MaterialCommunityIcons
                    name="check"
                    size={19}
                    color="#7040D5"
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* APPEARANCE MODAL */}
      <Modal
        visible={appearanceModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAppearanceModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.smallModal}>
            <ModalHeader
              title="Appearance"
              subtitle="Choose your preferred appearance"
              onClose={() => setAppearanceModalVisible(false)}
            />

            {['Light', 'Dark'].map((item) => (
              <Pressable
                key={item}
                style={styles.choiceRow}
                onPress={() => {
                  setAppearance(item);
                  setAppearanceModalVisible(false);
                }}
              >
                <Text style={styles.choiceText}>{item}</Text>

                {appearance === item && (
                  <MaterialCommunityIcons
                    name="check"
                    size={19}
                    color="#7040D5"
                  />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------------------- */
/* SETTING ROW                                                                */
/* -------------------------------------------------------------------------- */

function SettingRow({
  icon,
  title,
  subtitle,
  right,
  onPress,
}: SettingRowProps) {
  const content = (
    <>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
        />
      </View>

      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>

        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      {right}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.settingRow}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={styles.settingRow}>
      {content}
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* MODAL HEADER                                                               */
/* -------------------------------------------------------------------------- */

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
      <View>
        <Text style={styles.modalTitle}>{title}</Text>

        <Text style={styles.modalSubtitle}>{subtitle}</Text>
      </View>

      <Pressable
        style={styles.modalClose}
        onPress={onClose}
      >
        <MaterialCommunityIcons
          name="close"
          size={20}
          color="#667085"
        />
      </Pressable>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

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

  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#172033',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 18,
  },

  desktopNotificationCard: {
    width: '58%',
    marginBottom: 0,
  },

  desktopSecurityCard: {
    width: '40%',
    marginBottom: 0,
  },

  desktopPreferencesCard: {
    width: '58%',
    marginTop: 18,
    marginBottom: 0,
  },

  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardHeadingText: {
    flex: 1,
    marginLeft: 11,
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
    lineHeight: 14,
    color: '#8792A4',
  },

  rows: {
    marginTop: 13,
  },

  settingRow: {
    minHeight: 61,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  rowText: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },

  rowTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#202B3E',
  },

  rowSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 13,
    color: '#8792A4',
  },

  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  valueText: {
    marginRight: 3,
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#7040D5',
  },

  accessCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    shadowColor: '#172033',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginTop: 18,
  },

  desktopAccessCard: {
    width: '40%',
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

  accessNotice: {
    marginTop: 14,
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

  smallModal: {
    width: '100%',
    maxWidth: 400,
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

  errorText: {
    marginTop: -7,
    marginBottom: 5,
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#E95386',
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

  sessionCard: {
    minHeight: 74,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sessionInfo: {
    flex: 1,
    marginLeft: 10,
  },

  sessionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#202B3E',
  },

  sessionSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8792A4',
  },

  sessionStatus: {
    marginTop: 3,
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#26945F',
  },

  currentBadge: {
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 7,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  currentBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#26945F',
  },

  closeFullButton: {
    height: 40,
    borderRadius: 9,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  choiceRow: {
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },

  choiceText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#202B3E',
  },
});
