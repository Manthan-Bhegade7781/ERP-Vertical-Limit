

import React, { useState } from 'react';

import {

  Alert,

  KeyboardAvoidingView,

  Platform,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  TouchableOpacity,

  View,
  useWindowDimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { router } from 'expo-router';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';



type AttendanceStatus = 'Present' | 'Absent';



export default function AddAttendancePage() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 700;
  const isTablet = width >= 700 && width < 1100;


  const [studentName, setStudentName] = useState('');

  const [studentId, setStudentId] = useState('');

  const [date, setDate] = useState('');

  const [branch, setBranch] = useState('Pune');

  const [standardBatch, setStandardBatch] = useState('');

  const [status, setStatus] = useState<AttendanceStatus>('Present');



  const handleSave = () => {

    if (

      !studentName.trim() ||

      !studentId.trim() ||

      !date.trim() ||

      !branch.trim() ||

      !standardBatch.trim()

    ) {

      Alert.alert('Missing Information', 'Please fill in all fields.');

      return;

    }



    // UI-only implementation.

    // Connect your backend/API here to persist the record.

    Alert.alert(

      'Attendance Details',

      'The form is valid. Connect your attendance API to save this record.',

      [

        {

          text: 'OK',

          onPress: () => router.back(),

        },

      ],

    );

  };



  const renderField = (

    label: string,

    value: string,

    onChangeText: (value: string) => void,

    placeholder: string,

    icon: React.ComponentProps<

      typeof MaterialCommunityIcons

    >['name'],

  ) => (

    <View style={styles.field}>

      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>

        <MaterialCommunityIcons

          name={icon}

          size={19}

          color="#8792A4"

        />

        <TextInput

          value={value}

          onChangeText={onChangeText}

          placeholder={placeholder}

          placeholderTextColor="#A1A9B7"

          style={styles.input}

          autoCapitalize="words"

        />

      </View>

    </View>

  );



  return (

    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>

      <StatusBar style="light" backgroundColor="#6D35D8" translucent={false} />



      <KeyboardAvoidingView

        style={styles.container}

        behavior={Platform.OS === 'ios' ? 'padding' : undefined}

      >

        {/* Header */}

        <View style={[styles.header, { paddingTop: insets.top + 8, minHeight: insets.top + 66 }, isMobile && styles.headerMobile, isTablet && styles.headerTablet]}>

          <TouchableOpacity

            style={styles.backButton}

            onPress={() => router.back()}

            activeOpacity={0.8}

          >

            <MaterialCommunityIcons

              name="arrow-left"

              size={22}

              color="#FFFFFF"

            />

          </TouchableOpacity>



          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]} numberOfLines={1}>Add Attendance</Text>

        </View>



        <ScrollView

          showsVerticalScrollIndicator={false}

          keyboardShouldPersistTaps="handled"

          contentContainerStyle={styles.content}

        >

          {/* Page Heading */}

          <View style={styles.headingBlock}>

            <Text style={styles.pageTitle}>

              Add Attendance Record

            </Text>

            <Text style={styles.pageSubtitle}>

              Enter student details and mark attendance.

            </Text>

          </View>



          {/* Form */}

          <View style={styles.card}>

            <View style={styles.cardHeader}>

              <View style={styles.cardIcon}>

                <MaterialCommunityIcons

                  name="clipboard-text-outline"

                  size={22}

                  color="#7040D5"

                />

              </View>

              <View style={styles.cardHeaderText}>

                <Text style={styles.cardTitle}>

                  Student Information

                </Text>

                <Text style={styles.cardSubtitle}>

                  Fields marked with * are required.

                </Text>

              </View>

            </View>



            {renderField(

              'Student Name *',

              studentName,

              setStudentName,

              'Enter student name',

              'account-outline',

            )}



            {renderField(

              'Student ID *',

              studentId,

              setStudentId,

              'Enter student ID',

              'card-account-details-outline',

            )}



            {renderField(

              'Date *',

              date,

              setDate,

              'e.g. 12 Oct 2026',

              'calendar-month-outline',

            )}



            {renderField(

              'Branch *',

              branch,

              setBranch,

              'Enter branch',

              'map-marker-outline',

            )}



            {renderField(

              'Standard / Batch *',

              standardBatch,

              setStandardBatch,

              'e.g. 12th / JEE 12th',

              'book-open-page-variant-outline',

            )}



            {/* Attendance Status */}

            <View style={styles.field}>

              <Text style={styles.label}>

                Attendance Status *

              </Text>



              <View style={styles.statusRow}>

                <TouchableOpacity

                  style={[

                    styles.statusButton,

                    status === 'Present' &&

                      styles.presentSelected,

                  ]}

                  onPress={() => setStatus('Present')}

                  activeOpacity={0.8}

                >

                  <MaterialCommunityIcons

                    name="check-circle-outline"

                    size={19}

                    color={

                      status === 'Present' ? '#279965' : '#8792A4'

                    }

                  />

                  <Text

                    style={[

                      styles.statusText,

                      status === 'Present' &&

                        styles.presentSelectedText,

                    ]}

                  >

                    Present

                  </Text>

                </TouchableOpacity>



                <TouchableOpacity

                  style={[

                    styles.statusButton,

                    status === 'Absent' && styles.absentSelected,

                  ]}

                  onPress={() => setStatus('Absent')}

                  activeOpacity={0.8}

                >

                  <MaterialCommunityIcons

                    name="close-circle-outline"

                    size={19}

                    color={

                      status === 'Absent' ? '#D77A0A' : '#8792A4'

                    }

                  />

                  <Text

                    style={[

                      styles.statusText,

                      status === 'Absent' &&

                        styles.absentSelectedText,

                    ]}

                  >

                    Absent

                  </Text>

                </TouchableOpacity>

              </View>

            </View>



            {/* Actions */}

            <View style={styles.actionRow}>

              <TouchableOpacity

                style={styles.cancelButton}

                onPress={() => router.back()}

                activeOpacity={0.8}

              >

                <Text style={styles.cancelButtonText}>Cancel</Text>

              </TouchableOpacity>



              <TouchableOpacity

                style={styles.saveButton}

                onPress={handleSave}

                activeOpacity={0.85}

              >

                <MaterialCommunityIcons

                  name="content-save-outline"

                  size={18}

                  color="#FFFFFF"

                />

                <Text style={styles.saveButtonText}>

                  Save Attendance

                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );

}



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

    backgroundColor: '#F7F8FC',

  },

  container: {

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
  headerMobile: {
    height: 80,
    paddingHorizontal: 14,
  },
  headerTablet: {
    height: 64,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backButtonMobile: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    lineHeight: 26,
    color: '#FFFFFF',
    textAlign: 'left',
  },
  headerTitleMobile: {
    fontSize: 20,
  },

  content: {

    padding: 18,

    paddingBottom: 36,

    width: '100%',

    maxWidth: 900,

    alignSelf: 'center',

  },

  headingBlock: {

    marginBottom: 18,

  },

  pageTitle: {

    color: '#172033',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 21,

  },

  pageSubtitle: {

    marginTop: 4,

    color: '#7B8498',

    fontFamily: 'PoppinsRegular',

    fontSize: 12,

    lineHeight: 19,

  },

  card: {

    padding: 18,

    borderRadius: 16,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#EEF0F5',

    shadowColor: '#172033',

    shadowOffset: { width: 0, height: 3 },

    shadowOpacity: 0.04,

    shadowRadius: 8,

    elevation: 2,

  },

  cardHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    marginBottom: 24,

  },

  cardIcon: {

    width: 44,

    height: 44,

    borderRadius: 12,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 12,

  },

  cardHeaderText: {

    flex: 1,

  },

  cardTitle: {

    color: '#172033',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 15,

  },

  cardSubtitle: {

    marginTop: 3,

    color: '#8792A4',

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

  },

  field: {

    marginBottom: 18,

  },

  label: {

    marginBottom: 7,

    color: '#344054',

    fontFamily: 'PoppinsMedium',

    fontSize: 12,

  },

  inputContainer: {

    minHeight: 46,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#E6E9F0',

    borderRadius: 10,

    paddingHorizontal: 12,

    backgroundColor: '#FFFFFF',

  },

  input: {

    flex: 1,

    minWidth: 0,

    paddingVertical: 10,

    paddingLeft: 10,

    color: '#202B3E',

    fontFamily: 'PoppinsRegular',

    fontSize: 12,

  },

  statusRow: {

    flexDirection: 'row',

    gap: 12,

  },

  statusButton: {

    flex: 1,

    minHeight: 46,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    borderWidth: 1,

    borderColor: '#E6E9F0',

    borderRadius: 10,

    backgroundColor: '#FFFFFF',

  },

  presentSelected: {

    backgroundColor: '#E7F8EF',

    borderColor: '#35B878',

  },

  absentSelected: {

    backgroundColor: '#FFF1E2',

    borderColor: '#F7941D',

  },

  statusText: {

    color: '#7B8498',

    fontFamily: 'PoppinsMedium',

    fontSize: 12,

  },

  presentSelectedText: {

    color: '#279965',

  },

  absentSelectedText: {

    color: '#D77A0A',

  },

  actionRow: {

    flexDirection: 'row',

    justifyContent: 'flex-end',

    gap: 10,

    marginTop: 8,

  },

  cancelButton: {

    minHeight: 44,

    paddingHorizontal: 18,

    borderWidth: 1,

    borderColor: '#E2E5ED',

    borderRadius: 10,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

  },

  cancelButtonText: {

    color: '#667085',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 12,

  },

  saveButton: {

    minHeight: 44,

    paddingHorizontal: 16,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 8,

    borderRadius: 10,

    backgroundColor: '#7040D5',

  },

  saveButtonText: {

    color: '#FFFFFF',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 12,

  },

});
