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

  View,

} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { router, useLocalSearchParams } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '@/config/api';
import { getCurrentUser, getToken } from '@/services/auth';



const PURPLE = '#7040D5';



type BranchOption = { _id: string; name: string; code?: string };

type TransactionRouteParams = {
  mode?: string | string[];
  transactionId?: string | string[];
  title?: string | string[];
  description?: string | string[];
  type?: string | string[];
  amount?: string | string[];
  date?: string | string[];
  category?: string | string[];
  paymentMode?: string | string[];
  reference?: string | string[];
  status?: string | string[];
  branchId?: string | string[];
};

const getParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] || '' : value || '';

const formatDateForInput = (value: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  const day = String(parsed.getDate()).padStart(2, '0');
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${parsed.getFullYear()}`;
};

export default function AddTransactionPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<TransactionRouteParams>();
  const transactionId = getParam(params.transactionId);
  const isEditMode = getParam(params.mode) === 'edit' && Boolean(transactionId);

  const [type, setType] = useState<'Income' | 'Expense'>('Income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Other');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(getParam(params.title));
    setDescription(getParam(params.description));
    const initialType = getParam(params.type);
    if (initialType === 'Income' || initialType === 'Expense') setType(initialType);
    setAmount(getParam(params.amount));
    setDate(formatDateForInput(getParam(params.date)));
    setCategory(getParam(params.category) || 'Other');
    setPaymentMode(getParam(params.paymentMode) || 'Cash');
    setReference(getParam(params.reference));
    const initialStatus = getParam(params.status);
    setStatus(initialStatus === 'Pending' ? 'Pending' : 'Completed');
    setSelectedBranchId(getParam(params.branchId));
  }, [
    params.title, params.description, params.type, params.amount, params.date,
    params.category, params.paymentMode, params.reference, params.status, params.branchId,
  ]);

  useEffect(() => {
    let active = true;
    const loadFormContext = async () => {
      try {
        const user = await getCurrentUser();
        if (!active) return;
        const superAdmin = Boolean(user?.roles?.includes('super_admin'));
        setIsSuperAdmin(superAdmin);
        // Branches are loaded from the public /api/branches endpoint, so this
        // request must not be blocked when a token is unavailable.
        // Admins see their assigned branch; the backend remains responsible for
        // assigning it securely. Super Admins choose a branch for each transaction.
        if (!superAdmin && !transactionId && user?.branchId) {
          setSelectedBranchId(user.branchId);
        }

        // Public branch endpoint is mounted at GET /api/branches.
        // It is used by registration and does not require authentication.
        const response = await fetch(`${API_BASE_URL}/branches`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success === false) {
          throw new Error(result.message || 'Unable to load branches.');
        }

        // Support the response shapes commonly returned by this API:
        // { data: [...] }, { data: { branches: [...] } }, or { branches: [...] }.
        const branchData = result.data ?? result.branches;
        const rawBranches = Array.isArray(branchData)
          ? branchData
          : Array.isArray(branchData?.branches)
            ? branchData.branches
            : [];

        const branchOptions: BranchOption[] = rawBranches
          .filter((branch: any) => branch && branch._id && branch.name)
          .map((branch: any) => ({
            _id: String(branch._id),
            name: String(branch.name),
            ...(branch.code ? { code: String(branch.code) } : {}),
          }));

        if (active) {
          setBranches(branchOptions);
          // If a Super Admin is editing an existing transaction, preserve its branch.
          // For a new transaction, no branch is silently selected.
          if (transactionId && getParam(params.branchId)) {
            setSelectedBranchId(getParam(params.branchId));
          }
        }
      } catch (error) {
        if (active) {
          Alert.alert(
            'Unable to Load Transaction Form',
            error instanceof Error ? error.message : 'Unable to load the transaction form data.',
          );
        }
      } finally {
        if (active) setIsContextLoading(false);
      }
    };
    void loadFormContext();
    return () => { active = false; };
  }, []);



  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter the transaction title.');
      return;
    }

    const numericAmount = Number(amount.trim());
    if (!amount.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than zero.');
      return;
    }

    // Accept DD/MM/YYYY in the form and send an ISO date to the API.
    const dateMatch = date.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!dateMatch) {
      Alert.alert('Invalid Date', 'Please enter the date in DD/MM/YYYY format.');
      return;
    }

    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const year = Number(dateMatch[3]);
    const parsedDate = new Date(Date.UTC(year, month - 1, day, 12));

    if (
      parsedDate.getUTCFullYear() !== year ||
      parsedDate.getUTCMonth() !== month - 1 ||
      parsedDate.getUTCDate() !== day
    ) {
      Alert.alert('Invalid Date', 'Please enter a valid transaction date.');
      return;
    }

    if (isSuperAdmin && !selectedBranchId) {
      Alert.alert('Branch Required', 'Please select the branch for this transaction.');
      return;
    }

    try {
      setIsSaving(true);

      const token = await getToken();
      if (!token) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      const transactionPayload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        type,
        category: category || 'Other',
        amount: numericAmount,
        date: parsedDate.toISOString(),
        paymentMode: paymentMode || 'Cash',
        reference: reference.trim(),
        status,
      };
      // Super Admin explicitly assigns a branch. For Admin, the backend securely
      // assigns the logged-in user's own branch and ignores any client branch.
      if (isSuperAdmin) transactionPayload.branchId = selectedBranchId;

      const response = await fetch(
        isEditMode
          ? `${API_BASE_URL}/transactions/${transactionId}`
          : `${API_BASE_URL}/transactions`,
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionPayload),
        },
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to save the transaction.');
      }

      Alert.alert(
        isEditMode ? 'Transaction Updated' : 'Transaction Added',
        isEditMode ? 'Transaction has been updated successfully.' : 'Transaction has been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        'Unable to Save Transaction',
        error instanceof Error
          ? error.message
          : 'Something went wrong while saving the transaction.'
      );
    } finally {
      setIsSaving(false);
    }
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

            <Text style={styles.headerTitle}>{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</Text>

          </View>

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

                <Text style={styles.sectionTitle}>{isEditMode ? 'Edit Transaction' : 'Transaction Information'}</Text>

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



            {isSuperAdmin && (
              <>
                <Text style={styles.label}>
                  Branch <Text style={styles.required}>*</Text>
                </Text>
                {branches.length === 0 ? (
                  <Text style={styles.branchHelpText}>No active branches found. Add or activate a branch first.</Text>
                ) : (
                  <View style={styles.choiceWrap}>
                    {branches.map((branch) => {
                      const selected = selectedBranchId === branch._id;
                      return (
                        <TouchableOpacity
                          key={branch._id}
                          style={[styles.smallChoice, selected && styles.smallChoiceActive]}
                          onPress={() => setSelectedBranchId(branch._id)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.smallChoiceText, selected && styles.smallChoiceTextActive]}>
                            {branch.name}{branch.code ? ` (${branch.code})` : ''}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}
            {!isSuperAdmin && (
              <>
                <Text style={styles.label}>Branch</Text>
                <View style={styles.assignedBranchBox}>
                  <MaterialCommunityIcons name="office-building-outline" size={18} color={PURPLE} />
                  <View style={styles.assignedBranchTextWrap}>
                    <Text style={styles.assignedBranchName}>
                      {branches.find((branch) => branch._id === selectedBranchId)?.name || 'Your assigned branch'}
                    </Text>
                    <Text style={styles.assignedBranchHint}>
                      This transaction will be saved under your assigned branch.
                    </Text>
                  </View>
                </View>
              </>
            )}

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



            <Text style={styles.label}>Transaction Status</Text>
            <View style={styles.choiceWrap}>
              {(['Completed', 'Pending'] as const).map((item) => {
                const selected = status === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.smallChoice, selected && styles.smallChoiceActive]}
                    onPress={() => setStatus(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.smallChoiceText, selected && styles.smallChoiceTextActive]}>
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
                style={[styles.saveButton, (isSaving || isContextLoading) && styles.saveButtonDisabled]}
                onPress={handleSave}
                activeOpacity={0.85}
                disabled={isSaving || isContextLoading}
              >
                {isSaving || isContextLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <MaterialCommunityIcons
                    name="check"
                    size={17}
                    color="#FFFFFF"
                  />
                )}
                <Text style={styles.saveText}>
                  {isContextLoading ? 'Loading...' : isSaving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Transaction' : 'Save Transaction')}
                </Text>
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

  saveButtonDisabled: {
    opacity: 0.7,
  },

  branchHelpText: {
    color: '#D87908',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    marginBottom: 12,
  },

  assignedBranchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },

  assignedBranchTextWrap: {
    flex: 1,
  },

  assignedBranchName: {
    color: '#34245E',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },

  assignedBranchHint: {
    color: '#6D6680',
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    marginTop: 2,
  },

  saveText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 10,

    color: '#FFFFFF',

  },

});
