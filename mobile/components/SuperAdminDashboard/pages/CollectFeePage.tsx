import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type Student = {
  _id: string;
  studentId: string;
  status: 'active' | 'inactive';
  userId?: {
    fullName: string;
    email?: string;
    mobileNumber?: string;
  };
  batchId?: {
    name: string;
    code: string;
    standard?: string;
    academicYear?: string;
  };
};

type FeeType = 'Tuition' | 'Admission' | 'Exam' | 'Other';

type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Bank Transfer';

const feeTypes: FeeType[] = [
  'Tuition',
  'Admission',
  'Exam',
  'Other',
];

const paymentModes: PaymentMethod[] = [
  'Cash',
  'UPI',
  'Card',
  'Bank Transfer',
];

export default function CollectFeePage() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [feeType, setFeeType] = useState<FeeType>('Tuition');
  const [totalAmount, setTotalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Optional initial payment. Leave 0 if no payment is collected now.
  const [initialPayment, setInitialPayment] = useState('0');

  const [paymentMode, setPaymentMode] =
    useState<PaymentMethod>('UPI');

  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoadingStudents(true);

    try {
      const token = await getToken();

      if (!token) {
        Alert.alert(
          'Session Expired',
          'Please log in again.'
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load students.'
        );
      }

      const activeStudents: Student[] = (
        result.data || []
      ).filter(
        (item: Student) => item.status === 'active'
      );

      setStudents(activeStudents);
    } catch (error) {
      Alert.alert(
        'Unable to Load Students',
        error instanceof Error
          ? error.message
          : 'Please check your connection and try again.'
      );
    } finally {
      setLoadingStudents(false);
    }
  };

  const filteredStudents = students.filter((item) => {
    const query = studentSearch.trim().toLowerCase();

    if (!query || selectedStudent) {
      return false;
    }

    const name = item.userId?.fullName || '';
    const id = item.studentId || '';

    return (
      name.toLowerCase().includes(query) ||
      id.toLowerCase().includes(query)
    );
  });

  const handleCollect = async () => {
    if (submitting) return;

    if (!selectedStudent) {
      Alert.alert(
        'Select Student',
        'Please search for and select an active student.'
      );
      return;
    }

    const feeAmount = Number(totalAmount);
    const paymentAmount = Number(initialPayment || '0');

    if (
      !Number.isFinite(feeAmount) ||
      feeAmount <= 0
    ) {
      Alert.alert(
        'Invalid Fee',
        'Enter a valid total fee amount greater than zero.'
      );
      return;
    }

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount < 0
    ) {
      Alert.alert(
        'Invalid Payment',
        'The initial payment cannot be negative.'
      );
      return;
    }

    if (paymentAmount > feeAmount) {
      Alert.alert(
        'Invalid Payment',
        'The initial payment cannot exceed the total fee.'
      );
      return;
    }

    if (!dueDate.trim()) {
      Alert.alert(
        'Due Date Required',
        'Enter the fee due date in YYYY-MM-DD format.'
      );
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      Alert.alert(
        'Invalid Due Date',
        'Use YYYY-MM-DD format, for example 2026-11-30.'
      );
      return;
    }

    const parsedDueDate = new Date(
      `${dueDate.trim()}T00:00:00.000Z`
    );

    if (
      Number.isNaN(parsedDueDate.getTime()) ||
      parsedDueDate.toISOString().slice(0, 10) !==
        dueDate.trim()
    ) {
      Alert.alert(
        'Invalid Due Date',
        'Please enter a valid calendar date.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      // Step 1: Create the fee record.
      const feeResponse = await fetch(
        `${API_BASE_URL}/fees`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent._id,
            feeType,
            totalAmount: feeAmount,
            dueDate: dueDate.trim(),
            notes: remarks.trim(),
          }),
        }
      );

      const feeResult = await feeResponse.json();

      if (!feeResponse.ok || !feeResult.success) {
        throw new Error(
          feeResult.message ||
            'Failed to create the fee record.'
        );
      }

      const createdFee = feeResult.data;

      // Step 2: If a payment was entered, record it separately.
      if (paymentAmount > 0) {
        const paymentResponse = await fetch(
          `${API_BASE_URL}/fees/${createdFee._id}/payments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              amount: paymentAmount,
              method: paymentMode,
              reference: transactionId.trim(),
              remarks: remarks.trim(),
            }),
          }
        );

        const paymentResult =
          await paymentResponse.json();

        if (
          !paymentResponse.ok ||
          !paymentResult.success
        ) {
          // The fee was created, even though payment failed.
          Alert.alert(
            'Fee Created, Payment Failed',
            `The fee record was saved, but the payment was not recorded.\n\n${paymentResult.message || 'Please collect the payment from Fee Management.'}`,
            [
              {
                text: 'OK',
                onPress: () => router.back(),
              },
            ]
          );

          return;
        }

        const receiptNumber =
          paymentResult.data?.payment?.receiptNumber;

        Alert.alert(
          'Success',
          `Fee record created successfully.\n\nInitial payment: ₹${paymentAmount.toLocaleString('en-IN')}\nRemaining balance: ₹${Math.max(
            0,
            feeAmount - paymentAmount
          ).toLocaleString('en-IN')}${
            receiptNumber
              ? `\nReceipt: ${receiptNumber}`
              : ''
          }`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Success',
          'Fee record created successfully. No payment has been collected yet.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Unable to Save',
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={23}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Create Fee Record
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            isTablet && styles.contentTablet,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="cash-plus"
                  size={22}
                  color="#7040D5"
                />
              </View>

              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>
                  Fee Information
                </Text>
                <Text style={styles.sectionSubtitle}>
                  Create a student's fee record and optionally
                  collect the first payment.
                </Text>
              </View>
            </View>

            <FormLabel label="Student" required />

            {loadingStudents ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#7040D5" />
                <Text style={styles.mutedText}>
                  Loading students...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons
                    name="account-search-outline"
                    size={19}
                    color="#7040D5"
                  />

                  <TextInput
                    value={studentSearch}
                    onChangeText={(value) => {
                      setStudentSearch(value);
                      setSelectedStudent(null);
                    }}
                    placeholder="Search by student name or ID"
                    placeholderTextColor="#A2AABB"
                    style={styles.input}
                    editable={!submitting}
                  />
                </View>

                {selectedStudent && (
                  <View style={styles.selectedStudent}>
                    <MaterialCommunityIcons
                      name="account-check"
                      size={20}
                      color="#22945F"
                    />

                    <View style={styles.studentDetails}>
                      <Text style={styles.studentName}>
                        {selectedStudent.userId?.fullName ||
                          'Unnamed Student'}
                      </Text>

                      <Text style={styles.mutedText}>
                        {selectedStudent.studentId}
                        {selectedStudent.batchId?.name
                          ? ` • ${selectedStudent.batchId.name}`
                          : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setSelectedStudent(null);
                        setStudentSearch('');
                      }}
                      disabled={submitting}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={22}
                        color="#7B8496"
                      />
                    </TouchableOpacity>
                  </View>
                )}

                {!selectedStudent &&
                  studentSearch.trim().length > 0 && (
                    <View style={styles.resultsBox}>
                      {filteredStudents.length === 0 ? (
                        <Text style={styles.emptyText}>
                          No matching active students found.
                        </Text>
                      ) : (
                        filteredStudents
                          .slice(0, 8)
                          .map((item) => (
                            <TouchableOpacity
                              key={item._id}
                              style={styles.studentOption}
                              onPress={() => {
                                setSelectedStudent(item);
                                setStudentSearch(
                                  item.userId?.fullName || ''
                                );
                              }}
                              activeOpacity={0.7}
                            >
                              <MaterialCommunityIcons
                                name="account-circle-outline"
                                size={23}
                                color="#7040D5"
                              />

                              <View style={styles.studentDetails}>
                                <Text style={styles.studentName}>
                                  {item.userId?.fullName ||
                                    'Unnamed Student'}
                                </Text>

                                <Text style={styles.mutedText}>
                                  {item.studentId}
                                  {item.batchId?.name
                                    ? ` • ${item.batchId.name}`
                                    : ''}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))
                      )}
                    </View>
                  )}

                {!selectedStudent &&
                  studentSearch.trim().length === 0 && (
                    <Text style={styles.helperText}>
                      {students.length} active student(s) available.
                      Start typing to search.
                    </Text>
                  )}
              </>
            )}

            <FormLabel label="Fee Type" required />

            <Options
              items={feeTypes}
              value={feeType}
              onChange={setFeeType}
              icon="cash-multiple"
              disabled={submitting}
            />

            <FormLabel label="Total Fee Amount (₹)" required />

            <Input
              icon="currency-inr"
              value={totalAmount}
              onChangeText={setTotalAmount}
              placeholder="Enter total payable fee"
              keyboardType="numeric"
              editable={!submitting}
            />

            <FormLabel label="Fee Due Date" required />

            <Input
              icon="calendar-outline"
              value={dueDate}
              onChangeText={setDueDate}
              placeholder="YYYY-MM-DD"
              editable={!submitting}
            />

            <View style={styles.divider} />

            <Text style={styles.subheading}>
              Initial Payment
            </Text>

            <Text style={styles.helperText}>
              Optional. Enter 0 if you are only creating the
              fee record and will collect payment later.
            </Text>

            <FormLabel label="Amount Received Now (₹)" />

            <Input
              icon="cash-check"
              value={initialPayment}
              onChangeText={setInitialPayment}
              placeholder="0"
              keyboardType="numeric"
              editable={!submitting}
            />

            {Number(initialPayment) > 0 && (
              <>
                <FormLabel label="Payment Method" required />

                <Options
                  items={paymentModes}
                  value={paymentMode}
                  onChange={setPaymentMode}
                  icon="credit-card-outline"
                  disabled={submitting}
                />

                <FormLabel label="Transaction Reference" />

                <Input
                  icon="receipt-text-outline"
                  value={transactionId}
                  onChangeText={setTransactionId}
                  placeholder="Optional UPI or bank reference"
                  editable={!submitting}
                />
              </>
            )}

            <FormLabel label="Remarks (Optional)" />

            <View style={styles.textAreaWrapper}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={18}
                color="#7040D5"
              />

              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                placeholder="Add a note if needed"
                placeholderTextColor="#A2AABB"
                multiline
                textAlignVertical="top"
                style={styles.textArea}
                editable={!submitting}
              />
            </View>
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={19}
              color="#7040D5"
            />

            <Text style={styles.infoText}>
              The student's batch and branch are taken from the
              backend. Payment dates are recorded automatically.
              A receipt is generated when a payment is saved.
            </Text>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={submitting}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (submitting || loadingStudents) &&
                  styles.disabledButton,
              ]}
              onPress={handleCollect}
              disabled={submitting || loadingStudents}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons
                  name="content-save-check-outline"
                  size={19}
                  color="#FFFFFF"
                />
              )}

              <Text style={styles.saveButtonText}>
                {submitting ? 'Saving...' : 'Save Fee'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
        <Text style={styles.required}> *</Text>
      )}
    </Text>
  );
}

function Options({
  items,
  value,
  onChange,
  icon,
  disabled = false,
}: {
  items: string[];
  value: string;
  onChange: (value: any) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
}) {
  return (
    <View style={styles.optionWrap}>
      {items.map((item) => {
        const selected = value === item;

        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.optionButton,
              selected && styles.optionButtonActive,
              disabled && styles.disabledButton,
            ]}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onChange(item)}
          >
            <MaterialCommunityIcons
              name={selected ? 'check-circle' : icon}
              size={16}
              color={selected ? '#7040D5' : '#7B8496'}
            />

            <Text
              style={[
                styles.optionText,
                selected && styles.optionTextActive,
              ]}
            >
              {item}
              {item === 'Tuition' ? ' Fee' : item === 'Admission' ? ' Fee' : item === 'Exam' ? ' Fee' : ''}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Input({
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric';
  editable?: boolean;
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
        keyboardType={keyboardType}
        editable={editable}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 68,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  backButton: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    marginLeft: 14,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 34,
  },

  contentTablet: {
    paddingHorizontal: 24,
  },

  card: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8EAF0',
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },

  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#8A93A4',
    marginTop: 3,
    lineHeight: 16,
  },

  formLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#59657A',
    marginTop: 15,
    marginBottom: 7,
  },

  required: {
    color: '#D84B63',
  },

  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  optionButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 115,
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#687386',
  },

  optionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  inputWrapper: {
    width: '100%',
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE1E9',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },

  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    marginLeft: 9,
    paddingVertical: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
  },

  loadingBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  selectedStudent: {
    marginTop: 9,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E7F8EF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  studentDetails: {
    flex: 1,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  mutedText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8496',
    marginTop: 3,
  },

  helperText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8496',
    marginTop: 7,
    lineHeight: 16,
  },

  resultsBox: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E3E6EF',
    borderRadius: 12,
    overflow: 'hidden',
  },

  studentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  emptyText: {
    padding: 12,
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#7B8496',
  },

  divider: {
    height: 1,
    backgroundColor: '#ECEEF3',
    marginTop: 22,
    marginBottom: 6,
  },

  subheading: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
    marginTop: 8,
  },

  textAreaWrapper: {
    width: '100%',
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE1E9',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 13,
    paddingTop: 14,
  },

  textArea: {
    flex: 1,
    minWidth: 0,
    minHeight: 65,
    marginLeft: 9,
    padding: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
  },

  infoBox: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },

  infoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    lineHeight: 17,
    color: '#7040D5',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  cancelButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE1E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#687386',
  },

  saveButton: {
    flex: 1.4,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },

  disabledButton: {
    opacity: 0.6,
  },
});