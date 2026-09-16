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
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const students = ['Aarav Sharma', 'Priya Patel', 'Rohan Singh', 'Ananya Joshi'];
const feeTypes = ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Other'];
const paymentModes = ['Cash', 'UPI', 'Card', 'Bank Transfer'];
const branches = ['Main Branch', 'Pune Branch', 'Nashik Branch', 'Mumbai Branch'];

export default function CollectFeePage() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;

  const [student, setStudent] = useState('');
  const [feeType, setFeeType] = useState('');
  const [branch, setBranch] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleCollect = () => {
    if (!student || !feeType || !branch || !amount.trim() || !paymentDate.trim() || !paymentMode) {
      Alert.alert('Required Fields', 'Please fill all important fields marked with *.');
      return;
    }
    Alert.alert('Fee Collected', 'The fee payment has been recorded successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>

        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={23} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Collect Fee</Text>
        <TouchableOpacity style={styles.editButton} activeOpacity={0.85}
          onPress={() => Alert.alert('Edit Fee', 'Edit mode is ready for this fee form.')}>
          <MaterialCommunityIcons name="pencil-outline" size={17} color="#7040D5" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
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
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons name="cash-plus" size={21} color="#7040D5" />
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Fee Information</Text>
              <Text style={styles.sectionSubtitle}>Enter the payment details</Text>
            </View>
          </View>

          <FormLabel label="Student" required />
          <Options items={students} value={student} onChange={setStudent} icon="account-outline" />

          <FormLabel label="Fee Type" required />
          <Options items={feeTypes} value={feeType} onChange={setFeeType} icon="cash-multiple" />

          <FormLabel label="Branch" required />
          <Options items={branches} value={branch} onChange={setBranch} icon="office-building-outline" />

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FormLabel label="Amount" required />
              <Input icon="currency-inr" value={amount} onChangeText={setAmount}
                placeholder="e.g. 35000" keyboardType="numeric" />
            </View>
            <View style={styles.column}>
              <FormLabel label="Payment Date" required />
              <Input icon="calendar-outline" value={paymentDate} onChangeText={setPaymentDate}
                placeholder="e.g. 14 Sep 2026" />
            </View>
          </View>

          <FormLabel label="Payment Mode" required />
          <Options items={paymentModes} value={paymentMode} onChange={setPaymentMode} icon="credit-card-outline" />

          <FormLabel label="Transaction ID" />
          <Input icon="receipt-text-outline" value={transactionId} onChangeText={setTransactionId}
            placeholder="Enter transaction ID" />

          <FormLabel label="Remarks" />
          <View style={styles.textAreaWrapper}>
            <MaterialCommunityIcons name="text-box-outline" size={18} color="#7040D5" />
            <TextInput value={remarks} onChangeText={setRemarks} placeholder="Enter remarks"
              placeholderTextColor="#A2AABB" multiline textAlignVertical="top" style={styles.textArea} />
          </View>
          </View>

          <View style={styles.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={18} color="#7040D5" />
          <Text style={styles.infoText}>
            Fields marked with * are important and required before collecting the fee.
          </Text>
          </View>

          <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelButton} activeOpacity={0.8} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleCollect}>
            <MaterialCommunityIcons name="cash-check" size={19} color="#FFFFFF" />
            <Text style={styles.saveButtonText}>Collect Fee</Text>
          </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormLabel({ label, required = false }: { label: string; required?: boolean }) {
  return <Text style={styles.formLabel}>{label}{required && <Text style={styles.required}> *</Text>}</Text>;
}

function Options({ items, value, onChange, icon }: {
  items: string[]; value: string; onChange: (value: string) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.optionWrap}>
      {items.map(item => {
        const selected = value === item;
        return (
          <TouchableOpacity key={item} style={[styles.optionButton, selected && styles.optionButtonActive]}
            activeOpacity={0.8} onPress={() => onChange(item)}>
            <MaterialCommunityIcons name={selected ? 'check-circle' : icon} size={15}
              color={selected ? '#7040D5' : '#7B8496'} />
            <Text style={[styles.optionText, selected && styles.optionTextActive]}>{item}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function Input({ icon, value, onChangeText, placeholder, keyboardType = 'default' }: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap; value: string; onChangeText: (value: string) => void;
  placeholder: string; keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={styles.inputWrapper}>
      <MaterialCommunityIcons name={icon} size={18} color="#7040D5" />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="#A2AABB" style={styles.input} keyboardType={keyboardType} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

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
    minWidth: 0,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 21,
    marginLeft: 14,
  },

  editButton: {
    height: 44,
    minWidth: 112,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#7040D5',
    marginLeft: 6,
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

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8496',
    marginTop: 1,
    marginBottom: 10,
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
    minWidth: 0,
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
    marginTop: 1,
  },

  formLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12,
    color: '#59657A',
    marginTop: 13,
    marginBottom: 7,
  },

  required: {
    color: '#D84B63',
  },

  optionWrap: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: 8,
  },

  optionButton: {
    minHeight: 46,
    paddingHorizontal: 13,
    paddingVertical: 8,
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
    minWidth: 125,
    maxWidth: '100%',
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#687386',
    flexShrink: 1,
    textAlign: 'center',
  },

  optionTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
  },

  twoColumnRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },

  column: {
    flex: 1,
    minWidth: 0,
  },

  inputWrapper: {
    width: '100%',
    minHeight: 52,
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

  textAreaWrapper: {
    width: '100%',
    minHeight: 92,
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
    minHeight: 70,
    marginLeft: 9,
    padding: 0,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
  },

  infoBox: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
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
    fontSize: 10.5,
    lineHeight: 16,
    color: '#7040D5',
  },

  actionRow: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
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
    gap: 7,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
