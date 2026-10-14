import React, {
  useState,
} from 'react';

import {
  Ionicons,
} from '@expo/vector-icons';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';


type NotificationSettingsPageProps = {
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};


type NotificationSetting = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};


const notificationSettings: NotificationSetting[] = [
  {
    id: 'announcements',
    icon: 'megaphone-outline',
    title: 'Announcements',
    description:
      'Important school and administration announcements',
  },

  {
    id: 'lectureUpdates',
    icon: 'book-outline',
    title: 'Lecture Updates',
    description:
      'Updates related to lectures and classes',
  },

  {
    id: 'attendance',
    icon: 'checkmark-circle-outline',
    title: 'Student Attendance',
    description:
      'Attendance reminders and updates',
  },

  {
    id: 'tests',
    icon: 'document-text-outline',
    title: 'Tests & Assessments',
    description:
      'Test schedules, assessments and reminders',
  },

  {
    id: 'reports',
    icon: 'stats-chart-outline',
    title: 'Reports',
    description:
      'Updates related to student and academic reports',
  },

  {
    id: 'schedule',
    icon: 'calendar-outline',
    title: 'Schedule & Timetable',
    description:
      'Changes and reminders for your schedule',
  },

  {
    id: 'account',
    icon: 'shield-checkmark-outline',
    title: 'Account & Security',
    description:
      'Important account and security notifications',
  },
];


export default function NotificationSettingsPage({
  onContentScroll,
  onBack,
}: NotificationSettingsPageProps) {

  /* =====================================
     NOTIFICATION STATE
  ===================================== */

  const [allNotifications, setAllNotifications] =
    useState(true);

  const [settings, setSettings] =
    useState<Record<string, boolean>>({
      announcements: true,
      lectureUpdates: true,
      attendance: true,
      tests: true,
      reports: true,
      schedule: true,
      account: true,
    });


  /* =====================================
     TOGGLE ALL
  ===================================== */

  const handleAllNotificationsChange = (
    value: boolean,
  ) => {
    setAllNotifications(value);

    setSettings((previous) => {
      const updated = {
        ...previous,
      };

      Object.keys(updated).forEach((key) => {
        updated[key] = value;
      });

      return updated;
    });
  };


  /* =====================================
     TOGGLE INDIVIDUAL SETTING
  ===================================== */

  const handleSettingChange = (
    id: string,
    value: boolean,
  ) => {
    setSettings((previous) => ({
      ...previous,
      [id]: value,
    }));

    /*
      If any individual notification is enabled,
      keep the master switch enabled.
    */

    if (value) {
      setAllNotifications(true);
      return;
    }

    /*
      If all individual notifications are disabled,
      automatically disable the master switch.
    */

    const updatedSettings = {
      ...settings,
      [id]: value,
    };

    const hasEnabledNotification =
      Object.values(updatedSettings).some(
        Boolean,
      );

    setAllNotifications(
      hasEnabledNotification,
    );
  };


  /* =====================================
     SAVE
  ===================================== */

  const handleSave = () => {
    console.log(
      'NOTIFICATION SETTINGS SAVED:',
      {
        allNotifications,
        settings,
      },
    );

    Alert.alert(
      'Settings Saved',
      'Your notification preferences have been updated.',
    );
  };


  return (
    <View style={styles.container}>

      {/* =================================
          HEADER
      ================================= */}

      <View style={styles.header}>

        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>


        <View style={styles.headerTextContainer}>

          <Text style={styles.headerTitle}>
            Notification Settings
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your notification preferences
          </Text>

        </View>

      </View>


      {/* =================================
          CONTENT
      ================================= */}

      <ScrollView
        style={styles.scrollView}

        contentContainerStyle={
          styles.scrollContent
        }

        showsVerticalScrollIndicator={false}

        scrollEventThrottle={16}

        onScroll={
          onContentScroll
        }
      >

        {/* =================================
            MASTER SETTING
        ================================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            General
          </Text>


          <View style={styles.card}>

            <View style={styles.settingRow}>

              <View
                style={[
                  styles.iconContainer,
                  styles.masterIcon,
                ]}
              >
                <Ionicons
                  name="notifications-outline"
                  size={21}
                  color="#6C3FF5"
                />
              </View>


              <View style={styles.settingTextContainer}>

                <Text style={styles.settingTitle}>
                  All Notifications
                </Text>

                <Text style={styles.settingDescription}>
                  Turn all teacher notifications on or off
                </Text>

              </View>


              <Switch
                value={allNotifications}
                onValueChange={
                  handleAllNotificationsChange
                }

                trackColor={{
                  false: '#D9D9E2',
                  true: '#CDBBFF',
                }}

                thumbColor={
                  allNotifications
                    ? '#6C3FF5'
                    : '#FFFFFF'
                }

                ios_backgroundColor="#D9D9E2"
              />

            </View>

          </View>

        </View>


        {/* =================================
            NOTIFICATION TYPES
        ================================= */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Notification Types
          </Text>


          <View style={styles.card}>

            {notificationSettings.map(
              (
                item,
                index,
              ) => {

                const isEnabled =
                  settings[item.id] ?? false;

                return (
                  <View
                    key={item.id}
                    style={[
                      styles.settingRow,
                      index <
                        notificationSettings.length - 1 &&
                        styles.settingRowBorder,
                    ]}
                  >

                    <View
                      style={[
                        styles.iconContainer,
                        isEnabled
                          ? styles.activeIcon
                          : styles.inactiveIcon,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={
                          isEnabled
                            ? '#6C3FF5'
                            : '#8B8B98'
                        }
                      />
                    </View>


                    <View
                      style={
                        styles.settingTextContainer
                      }
                    >

                      <Text
                        style={
                          styles.settingTitle
                        }
                      >
                        {item.title}
                      </Text>

                      <Text
                        style={
                          styles.settingDescription
                        }
                      >
                        {item.description}
                      </Text>

                    </View>


                    <Switch
                      value={isEnabled}
                      onValueChange={(
                        value,
                      ) =>
                        handleSettingChange(
                          item.id,
                          value,
                        )
                      }

                      trackColor={{
                        false: '#D9D9E2',
                        true: '#CDBBFF',
                      }}

                      thumbColor={
                        isEnabled
                          ? '#6C3FF5'
                          : '#FFFFFF'
                      }

                      ios_backgroundColor="#D9D9E2"
                    />

                  </View>
                );
              },
            )}

          </View>

        </View>


        {/* =================================
            INFORMATION
        ================================= */}

        <View style={styles.infoCard}>

          <View style={styles.infoIcon}>

            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#6C3FF5"
            />

          </View>


          <View style={styles.infoTextContainer}>

            <Text style={styles.infoTitle}>
              About Notifications
            </Text>

            <Text style={styles.infoText}>
              You can change these preferences anytime.
              Important account and security notifications
              may still be delivered when required.
            </Text>

          </View>

        </View>


        {/* =================================
            SAVE BUTTON
        ================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed &&
              styles.saveButtonPressed,
          ]}

          onPress={handleSave}
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color="#FFFFFF"
          />

          <Text style={styles.saveButtonText}>
            Save Preferences
          </Text>

        </Pressable>


        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
}


/* =====================================
   STYLES
===================================== */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },


  /* =================================
     HEADER
  ================================= */

  header: {
    backgroundColor: '#6C3FF5',

    paddingHorizontal: 18,

    paddingTop: 14,

    paddingBottom: 16,

    flexDirection: 'row',

    alignItems: 'center',

    minHeight: 76,
  },


  backButton: {
    width: 38,

    height: 38,

    borderRadius: 19,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.14)',

    marginRight: 12,
  },


  headerTextContainer: {
    flex: 1,
  },


  headerTitle: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 18,

    color: '#FFFFFF',

    marginBottom: 2,
  },


  headerSubtitle: {
    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    color:
      'rgba(255,255,255,0.78)',
  },


  /* =================================
     SCROLL
  ================================= */

  scrollView: {
    flex: 1,
  },


  scrollContent: {
    paddingHorizontal: 16,

    paddingTop: 18,

    paddingBottom: 20,
  },


  /* =================================
     SECTION
  ================================= */

  section: {
    marginBottom: 20,
  },


  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 13,

    color: '#24242C',

    marginBottom: 9,

    marginLeft: 2,
  },


  /* =================================
     CARD
  ================================= */

  card: {
    backgroundColor: '#FFFFFF',

    borderRadius: 16,

    paddingHorizontal: 14,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.05,

    shadowRadius: 6,

    elevation: 2,

    overflow: 'hidden',
  },


  /* =================================
     ROW
  ================================= */

  settingRow: {
    minHeight: 76,

    flexDirection: 'row',

    alignItems: 'center',

    paddingVertical: 11,
  },


  settingRowBorder: {
    borderBottomWidth: 1,

    borderBottomColor: '#EEEEF2',
  },


  iconContainer: {
    width: 42,

    height: 42,

    borderRadius: 13,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,
  },


  masterIcon: {
    backgroundColor: '#F0EBFF',
  },


  activeIcon: {
    backgroundColor: '#F0EBFF',
  },


  inactiveIcon: {
    backgroundColor: '#F1F1F4',
  },


  settingTextContainer: {
    flex: 1,

    paddingRight: 8,
  },


  settingTitle: {
    fontFamily: 'PoppinsMedium',

    fontSize: 13,

    color: '#292933',

    marginBottom: 2,
  },


  settingDescription: {
    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    lineHeight: 15,

    color: '#8A8A96',
  },


  /* =================================
     INFO
  ================================= */

  infoCard: {
    backgroundColor: '#F0EBFF',

    borderRadius: 15,

    padding: 13,

    flexDirection: 'row',

    alignItems: 'flex-start',

    marginBottom: 18,
  },


  infoIcon: {
    width: 34,

    height: 34,

    borderRadius: 17,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,
  },


  infoTextContainer: {
    flex: 1,
  },


  infoTitle: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 12,

    color: '#4C2AA8',

    marginBottom: 3,
  },


  infoText: {
    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    lineHeight: 15,

    color: '#6D5B9F',
  },


  /* =================================
     SAVE
  ================================= */

  saveButton: {
    height: 48,

    borderRadius: 14,

    backgroundColor: '#6C3FF5',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    shadowColor: '#6C3FF5',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.2,

    shadowRadius: 7,

    elevation: 4,
  },


  saveButtonPressed: {
    opacity: 0.82,
  },


  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',

    fontSize: 13,

    color: '#FFFFFF',
  },


  bottomSpace: {
    height: 20,
  },

});