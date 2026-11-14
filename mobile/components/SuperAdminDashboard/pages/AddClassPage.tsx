import React, { useEffect, useState } from 'react';

import {

  Alert,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  TouchableOpacity,

  View,

} from 'react-native';

import { router } from 'expo-router';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/config/api';

import { getToken } from '@/services/auth';

import { getBatchSubjects, type BatchSubject } from '@/services/batchSubject';

import { createTimetable } from '@/services/timetable';



type BranchRef = string | { _id: string; name: string; code?: string };



type Batch = {

  _id: string;

  name: string;

  code?: string;

  status: 'active' | 'inactive';

  branchId: BranchRef | null;

};



type GetBatchesResponse = {

  success: boolean;

  message?: string;

  data?: { batches: Batch[] };

};



const classTypes = [

  { label: 'Lecture', value: 'lecture' },

  { label: 'Exam', value: 'exam' },

] as const;



function formatDateForApi(value: string): string | null {

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;



  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) return null;



  const year = parsed.getFullYear();

  const month = String(parsed.getMonth() + 1).padStart(2, '0');

  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

}



function formatTimeForApi(value: string): string | null {

  const trimmed = value.trim().toUpperCase();

  const twelveHour = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);



  if (twelveHour) {

    let hour = Number(twelveHour[1]);

    const minute = Number(twelveHour[2]);

    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

    if (twelveHour[3] === 'AM') hour = hour === 12 ? 0 : hour;

    else hour = hour === 12 ? 12 : hour + 12;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  }



  const twentyFourHour = trimmed.match(/^(\d{2}):(\d{2})$/);

  if (twentyFourHour) {

    const hour = Number(twentyFourHour[1]);

    const minute = Number(twentyFourHour[2]);

    if (hour > 23 || minute > 59) return null;

    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  }



  return null;

}



export default function AddClassPage() {

  const insets = useSafeAreaInsets();



  const [date, setDate] = useState('');

  const [startTime, setStartTime] = useState('');

  const [endTime, setEndTime] = useState('');

  const [room, setRoom] = useState('');

  const [classType, setClassType] = useState<'lecture' | 'exam'>('lecture');



  const [batches, setBatches] = useState<Batch[]>([]);

  const [selectedBranchId, setSelectedBranchId] = useState('');

  const [batchId, setBatchId] = useState('');

  const [batchSubjects, setBatchSubjects] = useState<BatchSubject[]>([]);

  const [batchSubjectId, setBatchSubjectId] = useState('');

  const [loadingBatches, setLoadingBatches] = useState(true);

  const [loadingSubjects, setLoadingSubjects] = useState(false);

  const [saving, setSaving] = useState(false);



  // Branches are derived from the populated branchId values returned by GET /batches.

  // Selecting a branch filters the batch list; selecting a batch loads its subject assignments.

  const branches = batches.reduce<Array<{ _id: string; name: string; code?: string }>>(

    (items, item) => {
      const branch = item.branchId;
      if (!branch || typeof branch === 'string') return items;

      if (!items.some((existingBranch) => existingBranch._id === branch._id)) {
        items.push({
          _id: branch._id,
          name: branch.name,
          code: branch.code,
        });
      }
      return items;
    },

    []

  );



  const branchBatches = selectedBranchId
    ? batches.filter((item) => {
        const branch = item.branchId;
        return !!branch && typeof branch !== 'string' && branch._id === selectedBranchId;
      })
    : [];



  const selectedAssignment = batchSubjects.find(

    (item) => item._id === batchSubjectId

  );

  useEffect(() => {

    let isMounted = true;



    const loadBatches = async () => {

      setLoadingBatches(true);

      try {

        const token = await getToken();

        if (!token) {

          Alert.alert('Authentication Required', 'Please log in again to load batches.');

          return;

        }



        const response = await fetch(`${API_BASE_URL}/batches`, {

          method: 'GET',

          headers: { Authorization: `Bearer ${token}` },

        });

        const result: GetBatchesResponse = await response.json();



        if (!response.ok || !result.success) {

          throw new Error(result.message || 'Unable to load batches.');

        }



        if (isMounted) {

          setBatches((result.data?.batches || []).filter((item) => item.status === 'active'));

        }

      } catch (error) {

        if (isMounted) {

          Alert.alert(

            'Unable to Load Batches',

            error instanceof Error ? error.message : 'Please try again.'

          );

        }

      } finally {

        if (isMounted) setLoadingBatches(false);

      }

    };



    loadBatches();

    return () => { isMounted = false; };

  }, []);



  useEffect(() => {
    let isMounted = true;

    const loadBatchSubjects = async () => {
      setBatchSubjects([]);
      setBatchSubjectId('');

      if (!batchId) {
        setLoadingSubjects(false);
        return;
      }

      setLoadingSubjects(true);

      try {
        // Support both service contracts:
        // 1) a direct BatchSubject[] array
        // 2) the backend response { success, data: { batchSubjects } }
        const response: unknown = await getBatchSubjects(batchId);

        let assignments: BatchSubject[] = [];

        if (Array.isArray(response)) {
          assignments = response as BatchSubject[];
        } else if (response && typeof response === 'object') {
          const payload = response as {
            success?: boolean;
            message?: string;
            data?: { batchSubjects?: BatchSubject[] };
            batchSubjects?: BatchSubject[];
          };

          if (payload.success === false) {
            throw new Error(payload.message || 'Unable to load subjects for this batch.');
          }

          assignments =
            payload.data?.batchSubjects ??
            payload.batchSubjects ??
            [];
        }

        if (!Array.isArray(assignments)) {
          throw new Error('The subjects API returned an unexpected response format.');
        }

        // The API returns populated subjectId and teacherId objects.
        // Keep active assignments available for selection.
        const activeAssignments = assignments.filter(
          (item) =>
            item?.status === 'active' &&
            !!item.subjectId &&
            typeof item.subjectId === 'object'
        );

        if (isMounted) {
          setBatchSubjects(activeAssignments);
        }

        console.log(
          `Loaded ${activeAssignments.length} active subject assignment(s) for batch ${batchId}.`
        );
      } catch (error) {
        console.error('Load batch subjects failed:', error);

        if (isMounted) {
          setBatchSubjects([]);
          Alert.alert(
            'Unable to Load Subjects',
            error instanceof Error ? error.message : 'Please try again.'
          );
        }
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    loadBatchSubjects();

    return () => {
      isMounted = false;
    };
  }, [batchId]);


  const saveClass = async () => {

    if (!date.trim() || !startTime.trim() || !endTime.trim() || !batchId || !batchSubjectId) {

      Alert.alert('Required Fields', 'Please fill all required fields marked with *.');

      return;

    }



    const scheduledDate = formatDateForApi(date);

    const formattedStartTime = formatTimeForApi(startTime);

    const formattedEndTime = formatTimeForApi(endTime);



    if (!scheduledDate) {

      Alert.alert('Invalid Date', 'Enter the date as YYYY-MM-DD or a valid date such as 14 Sep 2026.');

      return;

    }

    if (!formattedStartTime || !formattedEndTime) {

      Alert.alert('Invalid Time', 'Enter time in a format such as 09:00 AM or 14:30.');

      return;

    }

    if (formattedStartTime >= formattedEndTime) {

      Alert.alert('Invalid Time Range', 'End time must be later than start time.');

      return;

    }



    setSaving(true);

    try {

      const result = await createTimetable({

        batchSubjectId,

        scheduledDate,

        startTime: formattedStartTime,

        endTime: formattedEndTime,

        room: room.trim() || undefined,

        type: classType,

      });



      if (!result.success) {

        throw new Error(result.message || 'Unable to add this class.');

      }



      Alert.alert('Class Added', 'The class has been added to the timetable successfully.', [

        { text: 'OK', onPress: () => router.back() },

      ]);

    } catch (error) {

      Alert.alert(

        'Unable to Add Class',

        error instanceof Error ? error.message : 'Please check the details and try again.'

      );

    } finally {

      setSaving(false);

    }

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

      {/* =========================

          HEADER

      ========================== */}



      <View style={styles.header}>

        <TouchableOpacity

          style={styles.backButton}

          activeOpacity={0.8}

          onPress={() => router.back()}

        >

          <MaterialCommunityIcons

            name="arrow-left"

            size={23}

            color="#FFFFFF"

          />

        </TouchableOpacity>



        <Text style={styles.headerTitle}>

          Add Class

        </Text>

      </View>



      {/* =========================

          CONTENT

      ========================== */}



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

        {/* PAGE TITLE */}



        <Text style={styles.pageTitle}>

          Add Class

        </Text>



        {/* =========================

            CLASS INFORMATION

        ========================== */}



        <View style={styles.sectionCard}>

          <View style={styles.sectionHeader}>

            <View style={styles.sectionIcon}>

              <MaterialCommunityIcons

                name="calendar-plus-outline"

                size={20}

                color="#7040D5"

              />

            </View>



            <View>

              <Text style={styles.sectionTitle}>

                Class Information

              </Text>



              <Text style={styles.sectionSubtitle}>

                Enter the timetable class details

              </Text>

            </View>

          </View>



          {/* DATE */}



          <FormLabel

            label="Date"

            required

          />



          <Input

            icon="calendar-outline"

            value={date}

            onChangeText={setDate}

            placeholder="e.g. 14 Sep 2026"

          />



          {/* TIME ROW */}



          <View style={styles.twoColumnRow}>

            <View style={styles.column}>

              <FormLabel

                label="Start Time"

                required

              />



              <Input

                icon="clock-outline"

                value={startTime}

                onChangeText={setStartTime}

                placeholder="09:00 AM"

              />

            </View>



            <View style={styles.column}>

              <FormLabel

                label="End Time"

                required

              />



              <Input

                icon="clock-outline"

                value={endTime}

                onChangeText={setEndTime}

                placeholder="10:00 AM"

              />

            </View>

          </View>



          {/* BRANCH - SELECT THIS FIRST */}



          <FormLabel label="Branch" required />



          {loadingBatches ? (

            <Text style={styles.selectedSubjectsText}>Loading branches...</Text>

          ) : branches.length === 0 ? (

            <Text style={styles.selectedSubjectsText}>

              No branch information was returned with the active batches.

            </Text>

          ) : (

            <View style={styles.optionWrap}>

              {branches.map((item) => {

                const isSelected = selectedBranchId === item._id;

                return (

                  <TouchableOpacity

                    key={item._id}

                    style={[styles.optionButton, isSelected && styles.optionButtonActive]}

                    activeOpacity={0.8}

                    onPress={() => {

                      // Clear dependent selections whenever the branch changes.

                      setSelectedBranchId(item._id);

                      setBatchId('');

                      setBatchSubjects([]);

                      setBatchSubjectId('');

                    }}

                  >

                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>

                      {item.name}

                    </Text>

                  </TouchableOpacity>

                );

              })}

            </View>

          )}



          {/* BATCH - FILTERED BY SELECTED BRANCH */}



          <FormLabel label="Batch" required />



          {!selectedBranchId ? (

            <Text style={styles.selectedSubjectsText}>Select a branch first to view its batches.</Text>

          ) : loadingBatches ? (

            <Text style={styles.selectedSubjectsText}>Loading batches...</Text>

          ) : branchBatches.length === 0 ? (

            <Text style={styles.selectedSubjectsText}>No active batches were found for this branch.</Text>

          ) : (

            <View style={styles.optionWrap}>

              {branchBatches.map((item) => {

                const isSelected = batchId === item._id;

                return (

                  <TouchableOpacity

                    key={item._id}

                    style={[styles.optionButton, isSelected && styles.optionButtonActive]}

                    activeOpacity={0.8}

                    onPress={() => {

                      setBatchId(item._id);

                      setBatchSubjects([]);

                      setBatchSubjectId('');

                    }}

                  >

                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>

                      {item.name}

                    </Text>

                  </TouchableOpacity>

                );

              })}

            </View>

          )}



          {/* SUBJECT - ASSIGNMENT SELECT */}



          <FormLabel label="Subject" required />



          {!batchId ? (

            <Text style={styles.selectedSubjectsText}>Select a batch first to load its subjects.</Text>

          ) : loadingSubjects ? (

            <Text style={styles.selectedSubjectsText}>Loading subjects...</Text>

          ) : batchSubjects.length === 0 ? (

            <Text style={styles.selectedSubjectsText}>

              No active subjects are assigned to this batch.

            </Text>

          ) : (

            <View style={styles.optionWrap}>

              {batchSubjects.map((item) => {

                const isSelected = batchSubjectId === item._id;

                return (

                  <TouchableOpacity

                    key={item._id}

                    style={[styles.optionButton, isSelected && styles.optionButtonActive]}

                    activeOpacity={0.8}

                    onPress={() => setBatchSubjectId(item._id)}

                  >

                    <MaterialCommunityIcons

                      name={isSelected ? 'check-circle' : 'circle-outline'}

                      size={15}

                      color={isSelected ? '#7040D5' : '#7B8496'}

                    />

                    <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>

                      {item.subjectId.name}

                    </Text>

                  </TouchableOpacity>

                );

              })}

            </View>

          )}



          {selectedAssignment && (

            <Text style={styles.selectedSubjectsText}>

              Subject code: {selectedAssignment.subjectId.code}

            </Text>

          )}



          {/* TEACHER */}



          <FormLabel

            label="Teacher"

            required

          />



          <View style={styles.inputWrapper}>

            <MaterialCommunityIcons name="account-outline" size={18} color="#7040D5" />

            <Text style={[styles.input, { paddingTop: 17, color: selectedAssignment ? '#172033' : '#A2AABB' }]}>

              {selectedAssignment?.teacherId.fullName || 'Select a batch and subject first'}

            </Text>

          </View>



          {/* CLASS TYPE */}



          <FormLabel label="Class Type" required />



          <View style={styles.optionWrap}>

            {classTypes.map((item) => {

              const isSelected = classType === item.value;

              return (

                <TouchableOpacity

                  key={item.value}

                  style={[styles.optionButton, isSelected && styles.optionButtonActive]}

                  activeOpacity={0.8}

                  onPress={() => setClassType(item.value)}

                >

                  <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>

                    {item.label}

                  </Text>

                </TouchableOpacity>

              );

            })}

          </View>



          {/* ROOM */}



          <FormLabel label="Room" />



          <Input

            icon="door-open"

            value={room}

            onChangeText={setRoom}

            placeholder="e.g. Room 204"

          />



        </View>



        {/* =========================

            REQUIRED INFORMATION

        ========================== */}



        <View style={styles.infoBox}>

          <MaterialCommunityIcons

            name="information-outline"

            size={19}

            color="#7040D5"

          />



          <Text style={styles.infoText}>

            Select a branch, then a batch. The subject list loads from that batchs active assignments, and the assigned teacher is shown automatically.

          </Text>

        </View>



        {/* =========================

            ACTION BUTTONS

        ========================== */}



        <View style={styles.actionRow}>

          <TouchableOpacity

            style={styles.cancelButton}

            onPress={() => router.back()}

          >

            <Text style={styles.cancelButtonText}>

              Cancel

            </Text>

          </TouchableOpacity>



          <TouchableOpacity

            style={[styles.saveButton, saving && { opacity: 0.65 }]}

            onPress={saveClass}

            disabled={saving}

          >

            <MaterialCommunityIcons

              name="check-circle-outline"

              size={19}

              color="#FFFFFF"

            />



            <Text style={styles.saveButtonText}>

              {saving ? 'Saving...' : 'Save Class'}

            </Text>

          </TouchableOpacity>

        </View>

      </ScrollView>

    </View>

  );

}



/* =====================================================

   FORM LABEL

\===================================================== */



function FormLabel({

  label,

  required = false,

}: {

  label: string;

  required?: boolean;

}) {

  return (

    <Text style={styles.formLabel}>

      {label}

      {required && (

        <Text style={styles.required}>

          {' '}

          *

        </Text>

      )}

    </Text>

  );

}



/* =====================================================

   INPUT

\===================================================== */



function Input({

  icon,

  value,

  onChangeText,

  placeholder,

}: {

  icon: keyof typeof MaterialCommunityIcons.glyphMap;

  value: string;

  onChangeText: (value: string) => void;

  placeholder: string;

}) {

  return (

    <View style={styles.inputWrapper}>

      <MaterialCommunityIcons

        name={icon}

        size={18}

        color="#7040D5"

      />



      <TextInput

        value={value}

        onChangeText={onChangeText}

        placeholder={placeholder}

        placeholderTextColor="#A2AABB"

        style={styles.input}

      />

    </View>

  );

}



/* =====================================================

   STYLES

\===================================================== */



const styles = StyleSheet.create({

  safeArea: {

    flex: 1,

    backgroundColor: '#F7F8FC',

  },



  /* HEADER */



  header: {

    minHeight: 64,

    backgroundColor: '#7040D5',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 14,

    gap: 10,

  },



  backButton: {

    width: 40,

    height: 40,

    borderRadius: 12,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.14)',

  },



  headerTitle: {

    flex: 1,

    color: '#FFFFFF',

    fontFamily: 'PoppinsSemiBold',

    fontSize: 20,

  },



  editButton: {

    minHeight: 40,

    borderRadius: 9,

    backgroundColor: '#FFFFFF',

    paddingHorizontal: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    marginLeft: 8,

  },



  editButtonText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 11,

    color: '#7040D5',

    marginLeft: 4,

  },



  /* CONTENT */



  container: {

    flex: 1,

  },



  content: {

    paddingHorizontal: 16,

    paddingTop: 18,

  },



  pageTitle: {

    fontFamily: 'PoppinsBold',

    fontSize: 20,

    color: '#172033',

  },



  pageSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 11.5,

    color: '#7B8496',

    marginTop: 2,

    marginBottom: 14,

  },



  /* SECTION CARD */



  sectionCard: {

    backgroundColor: '#FFFFFF',

    borderRadius: 18,

    borderWidth: 1,

    borderColor: '#EEF0F5',

    padding: 16,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 2,

    },

    shadowOpacity: 0.04,

    shadowRadius: 7,

    elevation: 2,

  },



  sectionHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    paddingBottom: 13,

    marginBottom: 2,

    borderBottomWidth: 1,

    borderBottomColor: '#F0F1F5',

  },



  sectionIcon: {

    width: 43,

    height: 43,

    borderRadius: 13,

    backgroundColor: '#F1EAFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 10,

  },



  sectionHeaderText: {

    flex: 1,

    minWidth: 0,

    maxWidth: '100%',

  },



  sectionTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 16,

    color: '#172033',

  },



  sectionSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

    color: '#8A93A4',

    marginTop: 1,

  },



  /* LABEL */



  formLabel: {

    fontFamily: 'PoppinsMedium',

    fontSize: 11,

    color: '#59657A',

    marginTop: 13,

    marginBottom: 5,

  },



  required: {

    color: '#D84B63',

  },



  /* INPUT */



  inputWrapper: {

    minHeight: 52,

    borderRadius: 10,

    borderWidth: 1,

    borderColor: '#E0E3EA',

    backgroundColor: '#FFFFFF',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 11,

  },



  input: {

    flex: 1,

    minHeight: 50,

    marginLeft: 8,

    paddingVertical: 0,

    color: '#172033',

    fontFamily: 'PoppinsRegular',

    fontSize: 10,

  },



  /* TIME */



  twoColumnRow: {

    flexDirection: 'row',

    gap: 8,

  },



  column: {

    flex: 1,

  },



  /* OPTIONS */



  optionWrap: {

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 7,

  },



  horizontalOptions: {

    gap: 7,

    paddingBottom: 1,

  },



  optionButton: {

    minHeight: 40,

    paddingHorizontal: 11,

    borderRadius: 9,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E2E5EC',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 5,

  },



  optionButtonActive: {

    backgroundColor: '#F1EAFF',

    borderColor: '#7040D5',

  },



  optionText: {

    fontFamily: 'PoppinsMedium',

    fontSize: 10,

    color: '#687386',

  },



  optionTextActive: {

    fontFamily: 'PoppinsSemiBold',

    color: '#7040D5',

  },



  selectedSubjectsText: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    color: '#7040D5',

    marginTop: 6,

  },



  /* INFORMATION */



  infoBox: {

    marginTop: 13,

    borderRadius: 11,

    backgroundColor: '#F1EAFF',

    padding: 11,

    flexDirection: 'row',

    alignItems: 'flex-start',

    gap: 8,

  },



  infoText: {

    flex: 1,

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    lineHeight: 14,

    color: '#7040D5',

  },



  /* ACTION BUTTONS */



  actionRow: {

    flexDirection: 'row',

    gap: 8,

    marginTop: 15,

  },



  cancelButton: {

    flex: 1,

    minHeight: 48,

    borderRadius: 11,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,

    borderColor: '#E0E3EA',

    alignItems: 'center',

    justifyContent: 'center',

  },



  cancelButtonText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 10,

    color: '#687386',

  },



  saveButton: {

    flex: 1.4,

    minHeight: 48,

    borderRadius: 11,

    backgroundColor: '#7040D5',

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 6,

  },



  saveButtonText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 10,

    color: '#FFFFFF',

  },

});