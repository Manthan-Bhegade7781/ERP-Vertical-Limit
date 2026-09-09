import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { updateCurrentUser } from '@/services/auth';

type ProfileFieldProps = {
  label: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  editable?: boolean;
  onChangeText?: (text: string) => void;
};

const ProfileField = ({
  label,
  value,
  icon,
  editable = false,
  onChangeText,
}: ProfileFieldProps) => {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={19}
          color="#7040D5"
          style={styles.inputIcon}
        />

        <TextInput
          value={value}
          editable={editable}
          onChangeText={onChangeText}
          style={[
            styles.input,
            !editable && styles.disabledInput,
          ]}
          placeholderTextColor="#A3ADBA"
        />
      </View>
    </View>
  );
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  useEffect(() => {
  if (!user) return;

  setFullName(user.fullName ?? '');
  setEmail(user.email ?? '');

  const mobileDigits = (user.mobileNumber ?? '').replace(/\D/g, '');
  setMobile(mobileDigits.slice(-10));
}, [user]);

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = async () => {
  try {
    const phoneDigits = mobile.replace(/\D/g, '');

    if (phoneDigits.length !== 10) {
      Alert.alert(
        'Invalid Mobile Number',
        'Mobile number must contain exactly 10 digits.'
      );
      return;
    }
    const response = await updateCurrentUser(
  fullName,
  email,
  `+91 ${phoneDigits}`
);

    if (!response.success || !response.data?.user) {
      Alert.alert(
        'Update Failed',
        response.message || 'Unable to update your profile.'
      );
      return;
    }

    updateUser(response.data.user);
    setIsEditing(false);

    Alert.alert(
      'Profile Updated',
      'Your profile information has been updated successfully.'
    );
  } catch (error) {
    console.error('Profile update error:', error);

    Alert.alert(
      'Update Failed',
      'Unable to update your profile. Please try again.'
    );
  }
};

  const handleChangePassword = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: {
        feature: 'Change Password',
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            Profile
          </Text>

        </View>

        <TouchableOpacity
          style={styles.headerAction}
          activeOpacity={0.85}
          onPress={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
        >
          <MaterialCommunityIcons
            name={isEditing ? 'content-save-outline' : 'pencil-outline'}
            size={17}
            color="#7040D5"
          />

          <Text style={styles.headerActionText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            PROFILE MANAGEMENT
        ===================================================== */}

        <Text style={styles.managementTitle}>
          Profile Management
        </Text>

        {/* =====================================================
            PROFILE SUMMARY
        ===================================================== */}

        <View
          style={[
            styles.profileSummaryCard,
            isDesktop && styles.profileSummaryCardDesktop,
          ]}
        >
          <View style={styles.avatar}>
            <MaterialCommunityIcons
              name="account"
              size={42}
              color="#7040D5"
            />
          </View>

          <View style={styles.profileSummaryInfo}>
            <Text style={styles.profileSummaryName}>
              {fullName}
            </Text>

            <Text style={styles.profileSummaryRole}>
              Super Administrator
            </Text>

            <View style={styles.branchBadge}>
              <MaterialCommunityIcons
                name="office-building-outline"
                size={14}
                color="#7040D5"
              />

            </View>
          </View>

          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />

            <Text style={styles.activeText}>
              Active
            </Text>
          </View>
        </View>

        {/* =====================================================
            PERSONAL INFORMATION
        ===================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-outline"
                size={21}
                color="#7040D5"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Basic information associated with your account
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.fieldsGrid,
              isDesktop && styles.fieldsGridDesktop,
            ]}
          >
            <View
              style={[
                styles.fieldColumn,
                isDesktop && styles.fieldColumnDesktop,
              ]}
            >
              <ProfileField
                label="Full Name"
                value={fullName}
                icon="account-outline"
                editable={isEditing}
                onChangeText={setFullName}
              />
            </View>

            <View
              style={[
                styles.fieldColumn,
                isDesktop && styles.fieldColumnDesktop,
              ]}
            >
              <ProfileField
                label="Email Address"
                value={email}
                icon="email-outline"
                editable={isEditing}
                onChangeText={setEmail}
              />
            </View>

            <View
              style={[
                styles.fieldColumn,
                isDesktop && styles.fieldColumnDesktop,
              ]}
            >
              <ProfileField
                label="Mobile Number"
                value={mobile}
                icon="phone-outline"
                editable={isEditing}
                onChangeText={(text) => {
                  const digitsOnly = text.replace(/\D/g, '');
                  setMobile(digitsOnly.slice(0, 10));
                }}
              />
            </View>
          </View>
        </View>

        {/* =====================================================
            ACCOUNT INFORMATION
        ===================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBlue}>
              <MaterialCommunityIcons
                name="shield-account-outline"
                size={21}
                color="#2675E8"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Account Information
              </Text>

              <Text style={styles.sectionSubtitle}>
                Your role and account access information
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoGrid,
              isDesktop && styles.infoGridDesktop,
            ]}
          >
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Role
              </Text>

              <View style={styles.infoValueRow}>
                <MaterialCommunityIcons
                  name="shield-account"
                  size={18}
                  color="#2675E8"
                />

                <Text style={styles.infoValue}>
                  Super Administrator
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Account Status
              </Text>

              <View style={styles.statusRow}>
                <View style={styles.statusDot} />

                <Text style={styles.statusText}>
                  Active
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Branch Access
              </Text>

              <View style={styles.infoValueRow}>
                <MaterialCommunityIcons
                  name="office-building"
                  size={18}
                  color="#35B878"
                />

                <Text style={styles.infoValue}>
                  All Branches
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>
                Access Level
              </Text>

              <View style={styles.infoValueRow}>
                <MaterialCommunityIcons
                  name="key-outline"
                  size={18}
                  color="#F7941D"
                />

                <Text style={styles.infoValue}>
                  Full Access
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* =====================================================
            SECURITY
        ===================================================== */}

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconOrange}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={21}
                color="#F7941D"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Security
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage your account security
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.securityRow}
            activeOpacity={0.8}
            onPress={handleChangePassword}
          >
            <View style={styles.securityLeft}>
              <View style={styles.securityIcon}>
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={21}
                  color="#F7941D"
                />
              </View>

              <View>
                <Text style={styles.securityTitle}>
                  Change Password
                </Text>

                <Text style={styles.securitySubtitle}>
                  Update your account password
                </Text>
              </View>
            </View>

            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color="#9AA8B8"
            />
          </TouchableOpacity>

          <View style={styles.securityDivider} />

          <View style={styles.securityRow}>
            <View style={styles.securityLeft}>
              <View style={styles.securityIconGreen}>
                <MaterialCommunityIcons
                  name="shield-check-outline"
                  size={21}
                  color="#35B878"
                />
              </View>

              <View>
                <Text style={styles.securityTitle}>
                  Account Security
                </Text>

                <Text style={styles.securitySubtitle}>
                  Your account is currently protected
                </Text>
              </View>
            </View>

            <View style={styles.secureBadge}>
              <Text style={styles.secureBadgeText}>
                Secure
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            SAVE BUTTON
        ===================================================== */}

        {isEditing && (
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <MaterialCommunityIcons
                name="content-save-outline"
                size={18}
                color="#FFFFFF"
              />

              <Text style={styles.saveButtonText}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* =====================================================
     HEADER
  ===================================================== */

  header: {
    minHeight: 66,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
  },

  headerAction: {
    minHeight: 36,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  /* =====================================================
     SCROLL
  ===================================================== */

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  /* =====================================================
     MANAGEMENT TITLE
  ===================================================== */

  managementTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    lineHeight: 27,
    color: '#172033',
    marginBottom: 15,
  },

  /* =====================================================
     PROFILE SUMMARY
  ===================================================== */

  profileSummaryCard: {
    width: '100%',
    minHeight: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  profileSummaryCardDesktop: {
    paddingHorizontal: 22,
  },

  avatar: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  profileSummaryInfo: {
    flex: 1,
    marginLeft: 15,
    minWidth: 0,
  },

  profileSummaryName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    lineHeight: 23,
    color: '#172033',
  },

  profileSummaryRole: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#7E899A',
    marginTop: 1,
  },

  branchBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    minHeight: 25,
    borderRadius: 7,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  branchBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  activeBadge: {
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#E7F8EF',
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },

  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#35B878',
  },

  activeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#35B878',
    marginLeft: 5,
  },

  /* =====================================================
     SECTION CARD
  ===================================================== */

  sectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 17,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionIconBlue: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionIconOrange: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#FFF1E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#202A3A',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 14,
    color: '#8D98A8',
    marginTop: 1,
  },

  /* =====================================================
     FIELDS
  ===================================================== */

  fieldsGrid: {
    width: '100%',
  },

  fieldsGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  fieldColumn: {
    width: '100%',
  },

  fieldColumnDesktop: {
    width: '48.5%',
  },

  fieldContainer: {
    marginBottom: 14,
  },

  fieldLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    lineHeight: 15,
    color: '#566477',
    marginBottom: 6,
  },

  inputWrapper: {
    width: '100%',
    minHeight: 45,
    borderWidth: 1,
    borderColor: '#E4E8EE',
    borderRadius: 10,
    backgroundColor: '#FAFBFD',
    flexDirection: 'row',
    alignItems: 'center',
  },

  inputIcon: {
    marginLeft: 12,
  },

  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 9,
    paddingVertical: 9,
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#253044',
  },

  disabledInput: {
    color: '#4C596B',
  },

  /* =====================================================
     ACCOUNT INFORMATION
  ===================================================== */

  infoGrid: {
    width: '100%',
  },

  infoGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  infoItem: {
    width: '100%',
    minHeight: 67,
    borderRadius: 11,
    backgroundColor: '#F9FAFC',
    borderWidth: 1,
    borderColor: '#F0F2F6',
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 10,
    justifyContent: 'center',
  },

  infoLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    lineHeight: 13,
    color: '#929CAB',
    marginBottom: 4,
  },

  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    lineHeight: 16,
    color: '#344054',
    marginLeft: 7,
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#35B878',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#35B878',
    marginLeft: 7,
  },

  /* =====================================================
     SECURITY
  ===================================================== */

  securityRow: {
    minHeight: 63,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  securityLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  securityIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#FFF1E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  securityIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  securityTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    lineHeight: 16,
    color: '#344054',
  },

  securitySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 14,
    color: '#929CAB',
    marginTop: 1,
  },

  securityDivider: {
    height: 1,
    backgroundColor: '#F0F2F5',
  },

  secureBadge: {
    minHeight: 25,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secureBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
    color: '#35B878',
  },

  /* =====================================================
     BOTTOM ACTIONS
  ===================================================== */

  bottomActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
  },

  cancelButton: {
    minHeight: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE2E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  cancelButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#66768A',
  },

  saveButton: {
    minHeight: 43,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 6,
  },
});