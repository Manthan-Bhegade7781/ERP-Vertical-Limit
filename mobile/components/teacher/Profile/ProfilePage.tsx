import React, { useEffect, useState } from 'react';

import {

  Alert,

  Modal,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  View,

} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

type ProfilePageProps = {

  name: string;

  email: string;

  phone: string;

  onSaveProfile: (

    name: string,

    email: string,

    phone: string,

  ) => void;

  onContentScroll?: (event: any) => void;

  onChangePasswordPress?: () => void;

  onNotificationSettingsPress?: () => void;

  onHelpPress?: () => void;

};

type ProfileRowProps = {

  icon: keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;

  showDivider?: boolean;

};

type ProfileActionProps = {

  icon: keyof typeof Ionicons.glyphMap;

  title: string;

  danger?: boolean;

  showDivider?: boolean;

  onPress?: () => void;

};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const normalizePhone = (phone: string) =>

  phone.replace(/\D/g, '').replace(/^91/, '').slice(0, 10);

function ProfileRow({

  icon,

  label,

  value,

  showDivider = true,

}: ProfileRowProps) {

  return (

    <View>

      <View style={styles.profileRow}>

        <View style={styles.rowIconContainer}>

          <Ionicons name={icon} size={19} color="#6C4AB6" />

        </View>

        <View style={styles.rowTextContainer}>

          <Text style={styles.rowLabel}>{label}</Text>

          <Text style={styles.rowValue}>

            {value || 'Not provided'}

          </Text>

        </View>

      </View>

      {showDivider && <View style={styles.divider} />}

    </View>

  );

}

function ProfileAction({

  icon,

  title,

  danger = false,

  showDivider = true,

  onPress,

}: ProfileActionProps) {

  return (

    <View>

      <Pressable

        onPress={onPress}

        disabled={!onPress}

        style={({ pressed }) => [

          styles.actionRow,

          pressed && onPress && styles.pressed,

        ]}

      >

        <View

          style={[

            styles.actionIconContainer,

            danger && styles.dangerIconContainer,

          ]}

        >

          <Ionicons

            name={icon}

            size={19}

            color={danger ? '#D64545' : '#6C4AB6'}

          />

        </View>

        <Text

          style={[

            styles.actionTitle,

            danger && styles.dangerText,

          ]}

        >

          {title}

        </Text>

        {!danger && (

          <Ionicons

            name="chevron-forward-outline"

            size={18}

            color="#B5B5BD"

            style={styles.actionChevron}

          />

        )}

      </Pressable>

      {showDivider && <View style={styles.divider} />}

    </View>

  );

}

export default function ProfilePage({

  name,

  email,

  phone,

  onSaveProfile,

  onContentScroll,

  onChangePasswordPress,

  onNotificationSettingsPress,

  onHelpPress,

}: ProfilePageProps) {

  const { logout, user } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const [editName, setEditName] = useState(name);

  const [editEmail, setEditEmail] = useState(email);

  const [editPhone, setEditPhone] = useState(

    normalizePhone(phone),

  );

  useEffect(() => {

    setEditName(name);

    setEditEmail(email);

    setEditPhone(normalizePhone(phone));

  }, [name, email, phone]);

  const isFormValid =

    editName.trim().length > 0 &&

    isValidEmail(editEmail.trim()) &&

    editPhone.length === 10;

  const openEditModal = () => {

    setEditName(name);

    setEditEmail(email);

    setEditPhone(normalizePhone(phone));

    setEditModalVisible(true);

  };

  const closeEditModal = () => {

    setEditModalVisible(false);

  };

  const handleSave = () => {

    if (!isFormValid) return;

    onSaveProfile(

      editName.trim(),

      editEmail.trim(),

      `+91 ${editPhone.slice(0, 5)} ${editPhone.slice(5)}`,

    );

    setEditModalVisible(false);

  };

  const handleLogout = () => {

    Alert.alert(

      'Logout',

      'Are you sure you want to logout?',

      [

        {

          text: 'Cancel',

          style: 'cancel',

        },

        {

          text: 'Logout',

          style: 'destructive',

          onPress: async () => {

            try {

              await logout();

            } catch (error) {

              console.error('Logout error:', error);

              Alert.alert(

                'Logout Failed',

                'Unable to logout. Please try again.',

              );

            }

          },

        },

      ],

    );

  };

  return (

    <>

      <ScrollView

        style={styles.container}

        contentContainerStyle={styles.contentContainer}

        showsVerticalScrollIndicator={false}

        onScroll={onContentScroll}

        scrollEventThrottle={16}

      >

        <View style={styles.profileHero}>

          <View style={styles.avatar}>

            <Text style={styles.avatarText}>

              {name.trim().charAt(0).toUpperCase() || 'T'}

            </Text>

          </View>

          <View style={styles.heroTextContainer}>

            <Text style={styles.heroName}>{name}</Text>

            <Text style={styles.heroRole}>
              {user?.roles?.join(', ') || 'Teacher'}
            </Text>

            <Text style={styles.heroEmail}>

              {email}

            </Text>

          </View>

          <Pressable

            onPress={openEditModal}

            style={({ pressed }) => [

              styles.editButton,

              pressed && styles.pressed,

            ]}

          >

            <Ionicons

              name="create-outline"

              size={17}

              color="#6C4AB6"

            />

            <Text style={styles.editButtonText}>

              Edit

            </Text>

          </Pressable>

        </View>

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>

            Personal Information

          </Text>

          <View style={styles.card}>

            <ProfileRow

              icon="person-outline"

              label="Full Name"

              value={name}

            />

            <ProfileRow

              icon="mail-outline"

              label="Email Address"

              value={email}

            />

            <ProfileRow

              icon="call-outline"

              label="Phone Number"

              value={phone}

              showDivider={false}

            />

          </View>

        </View>

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>

            Teaching Information

          </Text>

          <View style={styles.card}>

            <ProfileRow

              icon="briefcase-outline"

              label="Role"

              value="Teacher"

            />

            <ProfileRow

              icon="school-outline"

              label="Department"

              value="Academic Faculty"

            />

            <ProfileRow

              icon="book-outline"

              label="Subjects"

              value="Mathematics, Science"

            />

            <ProfileRow

              icon="people-outline"

              label="Batches"

              value="8th, 9th, 10th, 11th"

              showDivider={false}

            />

          </View>

        </View>

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>

            Account

          </Text>

          <View style={styles.card}>

            <ProfileAction

              icon="lock-closed-outline"

              title="Change Password"

              onPress={onChangePasswordPress}

            />

            <ProfileAction

              icon="notifications-outline"

              title="Notification Settings"

              onPress={onNotificationSettingsPress}

            />

            <ProfileAction

              icon="help-circle-outline"

              title="Help & Support"

              onPress={onHelpPress}

            />

            <ProfileAction

              icon="log-out-outline"

              title="Logout"

              danger

              showDivider={false}

              onPress={handleLogout}

            />

          </View>

        </View>

        <Text style={styles.versionText}>

          Vertical Limits • Teacher Portal

        </Text>

      </ScrollView>

      <Modal

        visible={editModalVisible}

        transparent

        animationType="fade"

        onRequestClose={closeEditModal}

      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalCard}>

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>

                Edit Profile

              </Text>

              <Pressable

                onPress={closeEditModal}

                hitSlop={8}

                style={styles.closeButton}

              >

                <Ionicons

                  name="close"

                  size={22}

                  color="#55555E"

                />

              </Pressable>

            </View>

            <Text style={styles.inputLabel}>

              Full Name

            </Text>

            <TextInput

              value={editName}

              onChangeText={setEditName}

              placeholder="Enter your name"

              placeholderTextColor="#A3A3AB"

              style={styles.input}

              autoCapitalize="words"

            />

            <Text style={styles.inputLabel}>

              Email Address

            </Text>

            <TextInput

              value={editEmail}

              onChangeText={setEditEmail}

              placeholder="Enter your email"

              placeholderTextColor="#A3A3AB"

              style={styles.input}

              keyboardType="email-address"

              autoCapitalize="none"

              autoCorrect={false}

            />

            <Text style={styles.inputLabel}>

              Phone Number

            </Text>

            <View style={styles.phoneInputWrapper}>

              <View style={styles.countryCodeBox}>

                <Text style={styles.countryCodeText}>

                  +91

                </Text>

              </View>

              <TextInput

                value={editPhone}

                onChangeText={(value) =>

                  setEditPhone(

                    value.replace(/\D/g, '').slice(0, 10),

                  )

                }

                placeholder="10 digit mobile number"

                placeholderTextColor="#A3A3AB"

                style={styles.phoneInput}

                keyboardType="phone-pad"

                maxLength={10}

              />

            </View>

            {editEmail.length > 0 &&

              !isValidEmail(editEmail.trim()) && (

                <Text style={styles.errorText}>

                  Enter a valid email address.

                </Text>

              )}

            {editPhone.length > 0 &&

              editPhone.length !== 10 && (

                <Text style={styles.errorText}>

                  Phone number must contain 10 digits.

                </Text>

              )}

            <Pressable

              onPress={handleSave}

              disabled={!isFormValid}

              style={({ pressed }) => [

                styles.saveButton,

                !isFormValid &&

                  styles.saveButtonDisabled,

                pressed &&

                  isFormValid &&

                  styles.saveButtonPressed,

              ]}

            >

              <Text

                style={[

                  styles.saveButtonText,

                  !isFormValid &&

                    styles.saveButtonTextDisabled,

                ]}

              >

                Save Changes

              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </>

  );

}

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#F6F6F9',

  },

  contentContainer: {

    padding: 16,

    paddingBottom: 36,

  },

  profileHero: {

    backgroundColor: '#6C4AB6',

    borderRadius: 16,

    padding: 16,

    flexDirection: 'row',

    alignItems: 'center',

  },

  avatar: {

    width: 58,

    height: 58,

    borderRadius: 29,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

  },

  avatarText: {

    color: '#6C4AB6',

    fontFamily: 'PoppinsBold',

    fontSize: 23,

  },

  heroTextContainer: {

    flex: 1,

    marginLeft: 13,

  },

  heroName: {

    color: '#FFFFFF',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 17,

  },

  heroRole: {

    color: '#EAE3F8',

    fontFamily: 'PoppinsMedium',

    fontSize: 11,

    marginTop: 1,

  },

  heroEmail: {

    color: '#EAE3F8',

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    marginTop: 2,

  },

  editButton: {

    backgroundColor: '#FFFFFF',

    borderRadius: 9,

    minHeight: 34,

    paddingHorizontal: 10,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 5,

  },

  editButtonText: {

    color: '#6C4AB6',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 11,

  },

  section: {

    marginTop: 20,

  },

  sectionTitle: {

    color: '#303038',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 14,

    marginBottom: 8,

  },

  card: {

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    paddingHorizontal: 14,

    shadowColor: '#000000',

    shadowOpacity: 0.04,

    shadowRadius: 8,

    shadowOffset: {

      width: 0,

      height: 2,

    },

    elevation: 2,

  },

  profileRow: {

    minHeight: 67,

    flexDirection: 'row',

    alignItems: 'center',

  },

  rowIconContainer: {

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: '#F0EBFA',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,

  },

  rowTextContainer: {

    flex: 1,

  },

  rowLabel: {

    color: '#8A8A92',

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    marginBottom: 2,

  },

  rowValue: {

    color: '#292930',

    fontFamily: 'PoppinsMedium',

    fontSize: 13,

  },

  divider: {

    height: 1,

    backgroundColor: '#EEEEF2',

  },

  actionRow: {

    minHeight: 62,

    flexDirection: 'row',

    alignItems: 'center',

  },

  actionIconContainer: {

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: '#F0EBFA',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,

  },

  dangerIconContainer: {

    backgroundColor: '#FDECEC',

  },

  actionTitle: {

    color: '#2D2D34',

    fontFamily: 'PoppinsMedium',

    fontSize: 13,

  },

  dangerText: {

    color: '#D64545',

  },

  actionChevron: {

    marginLeft: 'auto',

  },

  pressed: {

    opacity: 0.65,

  },

  versionText: {

    color: '#A0A0A8',

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    textAlign: 'center',

    marginTop: 22,

  },

  modalOverlay: {

    flex: 1,

    backgroundColor: 'rgba(0, 0, 0, 0.45)',

    justifyContent: 'center',

    paddingHorizontal: 18,

  },

  modalCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    padding: 18,

  },

  modalHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 16,

  },

  modalTitle: {

    flex: 1,

    color: '#27272E',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 17,

  },

  closeButton: {

    width: 32,

    height: 32,

    borderRadius: 16,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#F3F3F6',

  },

  inputLabel: {

    color: '#5E5E67',

    fontFamily: 'PoppinsMedium',

    fontSize: 11,

    marginBottom: 6,

  },

  input: {

    height: 46,

    borderWidth: 1,

    borderColor: '#E1E1E6',

    borderRadius: 10,

    paddingHorizontal: 12,

    color: '#25252B',

    fontFamily: 'PoppinsRegular',

    fontSize: 12,

    marginBottom: 14,

    backgroundColor: '#FAFAFC',

  },

  phoneInputWrapper: {

    height: 46,

    borderWidth: 1,

    borderColor: '#E1E1E6',

    borderRadius: 10,

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: '#FAFAFC',

    marginBottom: 6,

    overflow: 'hidden',

  },

  countryCodeBox: {

    height: '100%',

    paddingHorizontal: 12,

    justifyContent: 'center',

    borderRightWidth: 1,

    borderRightColor: '#E1E1E6',

    backgroundColor: '#F4F4F7',

  },

  countryCodeText: {

    color: '#45454D',

    fontFamily: 'PoppinsMedium',

    fontSize: 12,

  },

  phoneInput: {

    flex: 1,

    height: '100%',

    paddingHorizontal: 12,

    color: '#25252B',

    fontFamily: 'PoppinsRegular',

    fontSize: 12,

  },

  errorText: {

    color: '#D64545',

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    marginBottom: 5,

  },

  saveButton: {

    height: 46,

    borderRadius: 11,

    backgroundColor: '#6C4AB6',

    alignItems: 'center',

    justifyContent: 'center',

    marginTop: 12,

  },

  saveButtonDisabled: {

    backgroundColor: '#D8D8DD',

  },

  saveButtonPressed: {

    opacity: 0.8,

  },

  saveButtonText: {

    color: '#FFFFFF',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 13,

  },

  saveButtonTextDisabled: {

    color: '#92929A',

  },

});
