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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PURPLE = '#7040D5';

export default function AddTransactionPage() {
  const insets = useSafeAreaInsets();

  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter the transaction title.');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Required Field', 'Please enter the amount.');
      return;
    }

    if (!date.trim()) {
      Alert.alert('Required Field', 'Please enter the transaction date.');
      return;
    }

    Alert.alert('Transaction Added', 'Transaction has been added successfully.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>Add Transaction</Text>
          </View>

          <TouchableOpacity
            style={styles.headerEdit}
            activeOpacity={0.85}
            onPress={() => Alert.alert('Edit', 'Transaction form is ready to edit.')}
          >
            <MaterialCommunityIcons name="pencil-outline" size={17} color={PURPLE} />
            <Text style={styles.headerEditText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 30 },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIcon}>
                <MaterialCommunityIcons
                  name="cash-plus"
                  size={21}
                  color={PURPLE}
                />
              </View>
              <View style={styles.sectionTitleArea}>
                <Text style={styles.sectionTitle}>Transaction Information</Text>
                <Text style={styles.sectionSubtitle}>
                  Enter the basic transaction details
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Transaction Type</Text>
            <View style={styles.choiceRow}>
              {(['Income', 'Expense'] as const).map((item) => {
                const selected = type === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.choiceButton, selected && styles.choiceButtonActive]}
                    onPress={() => setType(item)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={item === 'Income' ? 'arrow-down-bold' : 'arrow-up-bold'}
                      size={15}
                      color={selected ? '#FFFFFF' : PURPLE}
                    />
                    <Text
                      style={[
                        styles.choiceText,
                        selected && styles.choiceTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>
              Transaction Title <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter transaction title"
              placeholderTextColor="#A0A8B7"
              style={styles.input}
            />

            <View style={styles.twoColumn}>
              <View style={styles.column}>
                <Text style={styles.label}>
                  Amount <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.amountInput}>
                  <Text style={styles.rupee}>₹</Text>
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor="#A0A8B7"
                    keyboardType="decimal-pad"
                    style={styles.amountTextInput}
                  />
                </View>
              </View>

              <View style={styles.column}>
                <Text style={styles.label}>
                  Transaction Date <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.iconInput}>
                  <MaterialCommunityIcons
                    name="calendar-outline"
                    size={17}
                    color={PURPLE}
                  />
                  <TextInput
                    value={date}
                    onChangeText={setDate}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor="#A0A8B7"
                    keyboardType="numbers-and-punctuation"
                    style={styles.iconTextInput}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.choiceWrap}>
              {['Fees', 'Salary', 'Utilities', 'Purchase', 'Other'].map((item) => {
                const selected = category === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.smallChoice, selected && styles.smallChoiceActive]}
                    onPress={() => setCategory(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.smallChoiceText,
                        selected && styles.smallChoiceTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Payment Mode</Text>
            <View style={styles.choiceWrap}>
              {['Cash', 'UPI', 'Bank Transfer', 'Card'].map((item) => {
                const selected = paymentMode === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.smallChoice, selected && styles.smallChoiceActive]}
                    onPress={() => setPaymentMode(item)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.smallChoiceText,
                        selected && styles.smallChoiceTextActive,
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Reference / Transaction ID</Text>
            <TextInput
              value={reference}
              onChangeText={setReference}
              placeholder="Enter reference number"
              placeholderTextColor="#A0A8B7"
              style={styles.input}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter transaction description"
              placeholderTextColor="#A0A8B7"
              style={styles.textArea}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={17}
                  color="#FFFFFF"
                />
                <Text style={styles.saveText}>Save Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: PURPLE,
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  headerInner: {
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerEdit: {
    height: 40,
    minWidth: 82,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flexShrink: 0,
  },
  headerEditText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: PURPLE,
  },
  content: {
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    padding: 16,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8E9F0',
    padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  sectionTitleArea: {
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
    fontSize: 10,
    color: '#7B8799',
    marginTop: 2,
  },
  label: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#4D596C',
    marginBottom: 6,
    marginTop: 10,
  },
  required: {
    color: '#E95386',
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    paddingHorizontal: 13,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
    backgroundColor: '#FFFFFF',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceButton: {
    height: 46,
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  choiceButtonActive: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  choiceText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: PURPLE,
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 8,
  },
  column: {
    flex: 1,
    minWidth: 0,
  },
  amountInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  rupee: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: PURPLE,
    marginRight: 7,
  },
  amountTextInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
  },
  iconInput: {
    height: 52,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 7,
  },
  iconTextInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
  },
  choiceWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  smallChoice: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallChoiceActive: {
    backgroundColor: '#F1EAFF',
    borderColor: PURPLE,
  },
  smallChoiceText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#596579',
  },
  smallChoiceTextActive: {
    color: PURPLE,
  },
  textArea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingTop: 13,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 22,
  },
  cancelButton: {
    minWidth: 90,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DCE0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#687386',
  },
  saveButton: {
    minWidth: 155,
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  saveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});
