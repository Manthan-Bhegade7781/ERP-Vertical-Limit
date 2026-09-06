import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type FeeStatus =
  | 'Paid'
  | 'Pending'
  | 'Partially Paid'
  | 'Overdue';

type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Card'
  | 'Bank Transfer';

type Installment = {
  id: number;
  installmentNumber: number;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  reference: string;
  status: 'Paid';
};

type FeeRecord = {
  id: number;
  studentName: string;
  studentId: string;
  course: string;
  batch: string;
  branch: string;
  totalFee: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  installmentsEnabled: boolean;
  totalInstallments: number;
  installments: Installment[];
};

const initialFees: FeeRecord[] = [
  {
    id: 1,
    studentName: 'Aarav Sharma',
    studentId: 'VLCC-STU-001',
    course: 'Professional Makeup',
    batch: 'PM-2026-Morning',
    branch: 'Pune Branch',
    totalFee: 45000,
    paidAmount: 45000,
    dueDate: '10 Sep 2026',
    status: 'Paid',
    installmentsEnabled: true,
    totalInstallments: 3,
    installments: [
      {
        id: 101,
        installmentNumber: 1,
        amount: 15000,
        paymentDate: '10 Jul 2026',
        method: 'UPI',
        reference: 'UPI-PM-1001',
        status: 'Paid',
      },
      {
        id: 102,
        installmentNumber: 2,
        amount: 15000,
        paymentDate: '10 Aug 2026',
        method: 'Card',
        reference: 'CARD-PM-1002',
        status: 'Paid',
      },
      {
        id: 103,
        installmentNumber: 3,
        amount: 15000,
        paymentDate: '02 Sep 2026',
        method: 'UPI',
        reference: 'UPI-PM-1003',
        status: 'Paid',
      },
    ],
  },
  {
    id: 2,
    studentName: 'Ananya Patil',
    studentId: 'VLCC-STU-002',
    course: 'Beauty Therapy',
    batch: 'BT-2026-Evening',
    branch: 'Mumbai Branch',
    totalFee: 65000,
    paidAmount: 32500,
    dueDate: '08 Sep 2026',
    status: 'Partially Paid',
    installmentsEnabled: true,
    totalInstallments: 4,
    installments: [
      {
        id: 201,
        installmentNumber: 1,
        amount: 16250,
        paymentDate: '08 Jul 2026',
        method: 'UPI',
        reference: 'UPI-BT-2001',
        status: 'Paid',
      },
      {
        id: 202,
        installmentNumber: 2,
        amount: 16250,
        paymentDate: '08 Aug 2026',
        method: 'Cash',
        reference: 'CASH-BT-2002',
        status: 'Paid',
      },
    ],
  },
  {
    id: 3,
    studentName: 'Riya Kulkarni',
    studentId: 'VLCC-STU-003',
    course: 'Hair Dressing',
    batch: 'HD-2026-Morning',
    branch: 'Pune Branch',
    totalFee: 40000,
    paidAmount: 10000,
    dueDate: '06 Sep 2026',
    status: 'Overdue',
    installmentsEnabled: true,
    totalInstallments: 4,
    installments: [
      {
        id: 301,
        installmentNumber: 1,
        amount: 10000,
        paymentDate: '06 Jul 2026',
        method: 'Bank Transfer',
        reference: 'BT-HD-3001',
        status: 'Paid',
      },
    ],
  },
  {
    id: 4,
    studentName: 'Neha Joshi',
    studentId: 'VLCC-STU-004',
    course: 'Skin Care Specialist',
    batch: 'SC-2026-Nashik',
    branch: 'Nashik Branch',
    totalFee: 55000,
    paidAmount: 0,
    dueDate: '12 Sep 2026',
    status: 'Pending',
    installmentsEnabled: true,
    totalInstallments: 5,
    installments: [],
  },
  {
    id: 5,
    studentName: 'Kavya Mehta',
    studentId: 'VLCC-STU-005',
    course: 'Nail Art Professional',
    batch: 'NA-2026-Nagpur',
    branch: 'Nagpur Branch',
    totalFee: 25000,
    paidAmount: 12500,
    dueDate: '15 Sep 2026',
    status: 'Partially Paid',
    installmentsEnabled: true,
    totalInstallments: 2,
    installments: [
      {
        id: 501,
        installmentNumber: 1,
        amount: 12500,
        paymentDate: '15 Aug 2026',
        method: 'UPI',
        reference: 'UPI-NA-5001',
        status: 'Paid',
      },
    ],
  },
  {
    id: 6,
    studentName: 'Sneha Deshmukh',
    studentId: 'VLCC-STU-006',
    course: 'Advanced Beauty Therapy',
    batch: 'ABT-2026-Mumbai',
    branch: 'Mumbai Branch',
    totalFee: 75000,
    paidAmount: 25000,
    dueDate: '20 Sep 2026',
    status: 'Partially Paid',
    installmentsEnabled: true,
    totalInstallments: 5,
    installments: [
      {
        id: 601,
        installmentNumber: 1,
        amount: 15000,
        paymentDate: '20 Jul 2026',
        method: 'Card',
        reference: 'CARD-ABT-6001',
        status: 'Paid',
      },
      {
        id: 602,
        installmentNumber: 2,
        amount: 10000,
        paymentDate: '20 Aug 2026',
        method: 'UPI',
        reference: 'UPI-ABT-6002',
        status: 'Paid',
      },
    ],
  },
];

const formatCurrency = (amount: number) => {
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

const getStatusColor = (status: FeeStatus) => {
  switch (status) {
    case 'Paid':
      return {
        bg: '#E7F8EF',
        text: '#22945F',
      };

    case 'Pending':
      return {
        bg: '#FFF1E2',
        text: '#E88713',
      };

    case 'Partially Paid':
      return {
        bg: '#EAF2FF',
        text: '#2675E8',
      };

    case 'Overdue':
      return {
        bg: '#FFE9F0',
        text: '#E95386',
      };
  }
};

export default function FeesManagementPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  /*
   * STAT CARD GRID
   *
   * 3 cards in every row.
   *
   * Desktop:
   * content width = screen - 32px horizontal padding
   *
   * Mobile:
   * same 3-column layout with smaller cards.
   */
  const contentWidth = width - 32;
  const statGap = 10;

  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [fees, setFees] =
    useState<FeeRecord[]>(initialFees);

  const [search, setSearch] = useState('');

  const [activeFilter, setActiveFilter] =
    useState<'All' | FeeStatus>('All');

  const [selectedFee, setSelectedFee] =
    useState<FeeRecord | null>(null);

  const [actionModalVisible, setActionModalVisible] =
    useState(false);

  const [viewModalVisible, setViewModalVisible] =
    useState(false);

  const [paymentHistoryVisible, setPaymentHistoryVisible] =
    useState(false);

  const [collectModalVisible, setCollectModalVisible] =
    useState(false);

  const [installmentEnabled, setInstallmentEnabled] =
    useState(true);

  const [installmentNumber, setInstallmentNumber] =
    useState('');

  const [totalInstallments, setTotalInstallments] =
    useState('');

  const [paymentAmount, setPaymentAmount] =
    useState('');

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('UPI');

  const [paymentDate, setPaymentDate] =
    useState('05 Sep 2026');

  const [transactionReference, setTransactionReference] =
    useState('');

  const [remarks, setRemarks] = useState('');

  const filteredFees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return fees.filter((fee) => {
      const matchesSearch =
        !query ||
        fee.studentName
          .toLowerCase()
          .includes(query) ||
        fee.studentId
          .toLowerCase()
          .includes(query) ||
        fee.course
          .toLowerCase()
          .includes(query) ||
        fee.batch
          .toLowerCase()
          .includes(query) ||
        fee.branch
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        fee.status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [fees, search, activeFilter]);

  const totalFees = fees.reduce(
    (sum, fee) => sum + fee.totalFee,
    0
  );

  const collectedFees = fees.reduce(
    (sum, fee) => sum + fee.paidAmount,
    0
  );

  const pendingFees =
    totalFees - collectedFees;

  const overdueFees = fees
    .filter(
      (fee) => fee.status === 'Overdue'
    )
    .reduce(
      (sum, fee) =>
        sum +
        (fee.totalFee - fee.paidAmount),
      0
    );

  const partiallyPaid = fees.filter(
    (fee) => fee.status === 'Partially Paid'
  ).length;

  const studentsCount = fees.length;

  const openActions = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setActionModalVisible(true);
  };

  const openCollectModal = (
    fee: FeeRecord
  ) => {
    setSelectedFee(fee);
    setActionModalVisible(false);

    const nextInstallment =
      fee.installments.length + 1;

    setInstallmentEnabled(
      fee.installmentsEnabled
    );

    setInstallmentNumber(
      String(nextInstallment)
    );

    setTotalInstallments(
      String(
        fee.totalInstallments || 1
      )
    );

    const remaining =
      fee.totalFee - fee.paidAmount;

    setPaymentAmount(
      remaining > 0
        ? String(remaining)
        : ''
    );

    setPaymentMethod('UPI');
    setPaymentDate('05 Sep 2026');
    setTransactionReference('');
    setRemarks('');

    setCollectModalVisible(true);
  };

  const savePayment = () => {
    if (!selectedFee) {
      return;
    }

    const amount =
      Number(paymentAmount);

    if (!amount || amount <= 0) {
      Alert.alert(
        'Invalid Amount',
        'Please enter a valid payment amount.'
      );
      return;
    }

    const remaining =
      selectedFee.totalFee -
      selectedFee.paidAmount;

    if (amount > remaining) {
      Alert.alert(
        'Invalid Amount',
        `Maximum payable amount is ${formatCurrency(
          remaining
        )}.`
      );
      return;
    }

    const selectedInstallment =
      installmentEnabled
        ? Number(installmentNumber)
        : selectedFee.installments
            .length + 1;

    const selectedTotalInstallments =
      installmentEnabled
        ? Number(totalInstallments)
        : 1;

    if (
      installmentEnabled &&
      (!selectedInstallment ||
        !selectedTotalInstallments ||
        selectedInstallment >
          selectedTotalInstallments)
    ) {
      Alert.alert(
        'Invalid Installment',
        'Please enter a valid installment number and total installments.'
      );
      return;
    }

    const newInstallment: Installment = {
      id: Date.now(),
      installmentNumber:
        selectedInstallment,
      amount,
      paymentDate,
      method: paymentMethod,
      reference:
        transactionReference ||
        `TXN-${Date.now()}`,
      status: 'Paid',
    };

    const newPaidAmount =
      selectedFee.paidAmount +
      amount;

    const newStatus: FeeStatus =
      newPaidAmount >=
      selectedFee.totalFee
        ? 'Paid'
        : 'Partially Paid';

    const updatedFee: FeeRecord = {
      ...selectedFee,
      paidAmount: newPaidAmount,
      status: newStatus,
      installmentsEnabled:
        installmentEnabled,
      totalInstallments:
        selectedTotalInstallments,
      installments: [
        ...selectedFee.installments,
        newInstallment,
      ],
    };

    setFees((current) =>
      current.map((fee) =>
        fee.id === selectedFee.id
          ? updatedFee
          : fee
      )
    );

    setSelectedFee(updatedFee);
    setCollectModalVisible(false);

    Alert.alert(
      'Payment Recorded',
      installmentEnabled
        ? `Installment ${selectedInstallment} recorded successfully.`
        : 'Payment recorded successfully.'
    );
  };

  const downloadReceiptPDF = async (
    fee: FeeRecord,
    installment?: Installment
  ) => {
    const payment =
      installment ||
      fee.installments[
        fee.installments.length - 1
      ];

    const paymentAmountValue =
      payment?.amount ||
      fee.paidAmount;

    const receiptNo = payment
      ? `VLCC-REC-${payment.id}`
      : `VLCC-REC-${fee.id}`;

    const installmentText =
      payment &&
      fee.installmentsEnabled
        ? `Installment ${payment.installmentNumber} of ${fee.totalInstallments}`
        : 'Full Payment';

    const html = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #172033;
            }

            .header {
              background: #7040D5;
              color: white;
              padding: 22px;
              border-radius: 12px;
            }

            .title {
              font-size: 25px;
              font-weight: bold;
              margin-bottom: 4px;
            }

            .subtitle {
              font-size: 13px;
            }

            .receipt {
              margin-top: 24px;
              border: 1px solid #E5E7EF;
              border-radius: 12px;
              padding: 20px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              padding: 9px 0;
              border-bottom: 1px solid #F0F1F5;
            }

            .label {
              color: #748096;
            }

            .value {
              font-weight: bold;
            }

            .total {
              background: #F1EAFF;
              padding: 16px;
              border-radius: 10px;
              margin-top: 18px;
            }

            .footer {
              margin-top: 30px;
              color: #748096;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div class="title">
              VLCC ERP Portal
            </div>

            <div class="subtitle">
              Fee Payment Receipt
            </div>
          </div>

          <div class="receipt">

            <div class="row">
              <span class="label">
                Receipt Number
              </span>

              <span class="value">
                ${receiptNo}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Student
              </span>

              <span class="value">
                ${fee.studentName}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Student ID
              </span>

              <span class="value">
                ${fee.studentId}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Course
              </span>

              <span class="value">
                ${fee.course}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Batch
              </span>

              <span class="value">
                ${fee.batch}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Branch
              </span>

              <span class="value">
                ${fee.branch}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Payment Type
              </span>

              <span class="value">
                ${installmentText}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Payment Date
              </span>

              <span class="value">
                ${payment?.paymentDate || '05 Sep 2026'}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Payment Method
              </span>

              <span class="value">
                ${payment?.method || 'N/A'}
              </span>
            </div>

            <div class="row">
              <span class="label">
                Reference
              </span>

              <span class="value">
                ${payment?.reference || 'N/A'}
              </span>
            </div>

            <div class="total">

              <div class="row">
                <span class="label">
                  Total Course Fee
                </span>

                <span class="value">
                  ${formatCurrency(
                    fee.totalFee
                  )}
                </span>
              </div>

              <div class="row">
                <span class="label">
                  This Payment
                </span>

                <span class="value">
                  ${formatCurrency(
                    paymentAmountValue
                  )}
                </span>
              </div>

              <div class="row">
                <span class="label">
                  Total Paid
                </span>

                <span class="value">
                  ${formatCurrency(
                    fee.paidAmount
                  )}
                </span>
              </div>

              <div class="row">
                <span class="label">
                  Remaining
                </span>

                <span class="value">
                  ${formatCurrency(
                    fee.totalFee -
                      fee.paidAmount
                  )}
                </span>
              </div>

            </div>
          </div>

          <div class="footer">
            This is a system-generated fee receipt
            from VLCC ERP Portal.
          </div>
        </body>
      </html>
    `;

    try {
      const result =
        await Print.printToFileAsync({
          html,
        });

      if (
        await Sharing.isAvailableAsync()
      ) {
        await Sharing.shareAsync(
          result.uri,
          {
            mimeType: 'application/pdf',
            dialogTitle:
              'Fee Receipt',
          }
        );
      } else {
        Alert.alert(
          'PDF Generated',
          'The fee receipt PDF has been generated.'
        );
      }
    } catch {
      Alert.alert(
        'PDF Error',
        'Unable to generate the fee receipt.'
      );
    }
  };

  const sendFeeReminder = (
    fee: FeeRecord
  ) => {
    const pending =
      fee.totalFee -
      fee.paidAmount;

    Alert.alert(
      'Fee Reminder',
      `Reminder prepared for ${fee.studentName}.\n\nPending Amount: ${formatCurrency(
        pending
      )}`,
      [
        {
          text: 'OK',
        },
      ]
    );
  };

  const deleteFeeRecord = (
    fee: FeeRecord
  ) => {
    setActionModalVisible(false);

    Alert.alert(
      'Delete Fee Record',
      `Are you sure you want to delete the fee record for ${fee.studentName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFees((current) =>
              current.filter(
                (item) =>
                  item.id !== fee.id
              )
            );
          },
        },
      ]
    );
  };

  const renderSummaryCard = (
    title: string,
    value: string,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    type:
      | 'purple'
      | 'blue'
      | 'green'
      | 'orange'
      | 'pink'
  ) => {
    const colors = {
      purple: {
        bg: '#F1EAFF',
        icon: '#7040D5',
      },
      blue: {
        bg: '#EAF2FF',
        icon: '#2675E8',
      },
      green: {
        bg: '#E7F8EF',
        icon: '#35B878',
      },
      orange: {
        bg: '#FFF1E2',
        icon: '#F7941D',
      },
      pink: {
        bg: '#FFE9F0',
        icon: '#E95386',
      },
    };

    return (
      <View
        style={[
          styles.summaryCard,
          {
            width: statCardWidth,
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            {
              backgroundColor:
                colors[type].bg,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={isDesktop ? 21 : 18}
            color={colors[type].icon}
          />
        </View>

        <Text
          style={styles.summaryTitle}
          numberOfLines={2}
        >
          {title}
        </Text>

        <Text
          style={styles.summaryValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {value}
        </Text>
      </View>
    );
  };

  const renderFeeCard = (
    fee: FeeRecord
  ) => {
    const pending =
      fee.totalFee -
      fee.paidAmount;

    const progress =
      fee.totalFee > 0
        ? (fee.paidAmount /
            fee.totalFee) *
          100
        : 0;

    const statusColors =
      getStatusColor(fee.status);

    return (
      <View
        key={fee.id}
        style={styles.feeCard}
      >
        <View
          style={styles.cardTopRow}
        >
          <View
            style={styles.studentInfo}
          >
            <View
              style={styles.avatar}
            >
              <Text
                style={styles.avatarText}
              >
                {fee.studentName
                  .split(' ')
                  .map(
                    (name) =>
                      name[0]
                  )
                  .join('')
                  .slice(0, 2)}
              </Text>
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.studentName
                }
              >
                {fee.studentName}
              </Text>

              <Text
                style={
                  styles.studentId
                }
              >
                {fee.studentId}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() =>
              openActions(fee)
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <View
          style={styles.infoGrid}
        >
          <View
            style={styles.infoItem}
          >
            <Text
              style={styles.infoLabel}
            >
              Course
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={1}
            >
              {fee.course}
            </Text>
          </View>

          <View
            style={styles.infoItem}
          >
            <Text
              style={styles.infoLabel}
            >
              Batch
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={1}
            >
              {fee.batch}
            </Text>
          </View>

          <View
            style={styles.infoItem}
          >
            <Text
              style={styles.infoLabel}
            >
              Branch
            </Text>

            <Text
              style={styles.infoValue}
              numberOfLines={1}
            >
              {fee.branch}
            </Text>
          </View>

          <View
            style={styles.infoItem}
          >
            <Text
              style={styles.infoLabel}
            >
              Due Date
            </Text>

            <Text
              style={styles.infoValue}
            >
              {fee.dueDate}
            </Text>
          </View>
        </View>

        <View
          style={styles.amountBox}
        >
          <View>
            <Text
              style={styles.infoLabel}
            >
              Total Fee
            </Text>

            <Text
              style={styles.amountText}
            >
              {formatCurrency(
                fee.totalFee
              )}
            </Text>
          </View>

          <View>
            <Text
              style={styles.infoLabel}
            >
              Paid
            </Text>

            <Text
              style={[
                styles.amountText,
                {
                  color: '#22945F',
                },
              ]}
            >
              {formatCurrency(
                fee.paidAmount
              )}
            </Text>
          </View>

          <View>
            <Text
              style={styles.infoLabel}
            >
              Pending
            </Text>

            <Text
              style={[
                styles.amountText,
                {
                  color: '#E95386',
                },
              ]}
            >
              {formatCurrency(
                pending
              )}
            </Text>
          </View>
        </View>

        <View
          style={styles.progressHeader}
        >
          <Text
            style={styles.infoLabel}
          >
            Fee Progress
          </Text>

          <Text
            style={styles.progressPercent}
          >
            {Math.round(progress)}%
          </Text>
        </View>

        <View
          style={styles.progressTrack}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              },
            ]}
          />
        </View>

        <View
          style={styles.cardFooter}
        >
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  statusColors.bg,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusColors.text,
                },
              ]}
            >
              {fee.status}
            </Text>
          </View>

          {fee.installmentsEnabled && (
            <View
              style={
                styles.installmentBadge
              }
            >
              <MaterialCommunityIcons
                name="calendar-multiple"
                size={14}
                color="#7040D5"
              />

              <Text
                style={
                  styles.installmentText
                }
              >
                {fee.installments.length}/
                {
                  fee.totalInstallments
                }{' '}
                Installments
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      <View
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <Text
          style={styles.headerTitle}
        >
          Fees Management
        </Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            Alert.alert(
              'Collect Fee',
              'Select a student from the fee records to collect payment.'
            )
          }
        >
          <MaterialCommunityIcons
            name="plus"
            size={16}
            color="#7040D5"
          />

          <Text
            style={
              styles.addButtonText
            }
          >
            Collect Fee
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text
          style={
            styles.managementTitle
          }
        >
          Fee Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Manage student fees, installments and payments
        </Text>

        {/* =========================
            3 x 2 STAT CARD GRID
        ========================== */}
        <View
          style={styles.summaryGrid}
        >
          {renderSummaryCard(
            'Total Fees',
            formatCurrency(
              totalFees
            ),
            'cash-multiple',
            'purple'
          )}

          {renderSummaryCard(
            'Collected',
            formatCurrency(
              collectedFees
            ),
            'cash-check',
            'green'
          )}

          {renderSummaryCard(
            'Pending',
            formatCurrency(
              pendingFees
            ),
            'cash-clock',
            'blue'
          )}

          {renderSummaryCard(
            'Overdue',
            formatCurrency(
              overdueFees
            ),
            'alert-circle-outline',
            'pink'
          )}

          {renderSummaryCard(
            'Partially Paid',
            String(
              partiallyPaid
            ),
            'cash-minus',
            'orange'
          )}

          {renderSummaryCard(
            'Total Students',
            String(
              studentsCount
            ),
            'account-group',
            'purple'
          )}
        </View>

        {/* SEARCH */}
        <View
          style={styles.searchBox}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#8B95A7"
          />

          <TextInput
            value={search}
            onChangeText={
              setSearch
            }
            placeholder="Search student, ID, course, batch..."
            placeholderTextColor="#A2AABB"
            style={
              styles.searchInput
            }
          />

          {search.length >
            0 && (
            <TouchableOpacity
              onPress={() =>
                setSearch('')
              }
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#A2AABB"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {[
            'All',
            'Paid',
            'Pending',
            'Partially Paid',
            'Overdue',
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | FeeStatus
                )
              }
              style={[
                styles.filterButton,
                activeFilter ===
                  filter &&
                  styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter ===
                    filter &&
                    styles.filterTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View
          style={styles.listHeader}
        >
          <Text
            style={styles.listTitle}
          >
            Fee Records
          </Text>

          <Text
            style={styles.recordCount}
          >
            {filteredFees.length}{' '}
            Records
          </Text>
        </View>

        {filteredFees.length ===
        0 ? (
          <View
            style={styles.emptyBox}
          >
            <MaterialCommunityIcons
              name="cash-remove"
              size={42}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No fee records found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          filteredFees.map(
            renderFeeCard
          )
        )}
      </ScrollView>

      {/* =========================
          ACTION MODAL
      ========================== */}
      <Modal
        visible={
          actionModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionModalVisible(
            false
          )
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setActionModalVisible(
              false
            )
          }
        >
          <Pressable
            style={
              styles.actionModal
            }
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Fee Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedFee?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setActionModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                setActionModalVisible(
                  false
                );
                setViewModalVisible(
                  true
                );
              }}
            >
              <View
                style={
                  styles.actionIcon
                }
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                View Fee Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() =>
                selectedFee &&
                openCollectModal(
                  selectedFee
                )
              }
            >
              <View
                style={
                  styles.actionIcon
                }
              >
                <MaterialCommunityIcons
                  name="cash-plus"
                  size={20}
                  color="#22945F"
                />
              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Collect Fee / Installment
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                setActionModalVisible(
                  false
                );
                setPaymentHistoryVisible(
                  true
                );
              }}
            >
              <View
                style={
                  styles.actionIcon
                }
              >
                <MaterialCommunityIcons
                  name="history"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Payment History
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                setActionModalVisible(
                  false
                );

                if (
                  selectedFee
                ) {
                  downloadReceiptPDF(
                    selectedFee
                  );
                }
              }}
            >
              <View
                style={
                  styles.actionIcon
                }
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={20}
                  color="#E95386"
                />
              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Download Fee Receipt PDF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionItem
              }
              onPress={() => {
                setActionModalVisible(
                  false
                );

                if (
                  selectedFee
                ) {
                  sendFeeReminder(
                    selectedFee
                  );
                }
              }}
            >
              <View
                style={
                  styles.actionIcon
                }
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color="#F7941D"
                />
              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Send Fee Reminder
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionItem,
                styles.deleteAction,
              ]}
              onPress={() => {
                if (
                  selectedFee
                ) {
                  deleteFeeRecord(
                    selectedFee
                  );
                }
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      '#FFF0F3',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="delete-outline"
                  size={20}
                  color="#E95386"
                />
              </View>

              <Text
                style={[
                  styles.actionText,
                  {
                    color:
                      '#E95386',
                  },
                ]}
              >
                Delete Record
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          VIEW DETAILS
      ========================== */}
      <Modal
        visible={
          viewModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Fee Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedFee?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setViewModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedFee && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.detailStudentBox
                  }
                >
                  <View
                    style={
                      styles.largeAvatar
                    }
                  >
                    <Text
                      style={
                        styles.largeAvatarText
                      }
                    >
                      {selectedFee.studentName
                        .split(' ')
                        .map(
                          (name) =>
                            name[0]
                        )
                        .join('')
                        .slice(0, 2)}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <Text
                      style={
                        styles.detailStudentName
                      }
                    >
                      {
                        selectedFee.studentName
                      }
                    </Text>

                    <Text
                      style={
                        styles.detailStudentId
                      }
                    >
                      {
                        selectedFee.studentId
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.detailGrid
                  }
                >
                  <DetailItem
                    label="Course"
                    value={
                      selectedFee.course
                    }
                  />

                  <DetailItem
                    label="Batch"
                    value={
                      selectedFee.batch
                    }
                  />

                  <DetailItem
                    label="Branch"
                    value={
                      selectedFee.branch
                    }
                  />

                  <DetailItem
                    label="Due Date"
                    value={
                      selectedFee.dueDate
                    }
                  />
                </View>

                <View
                  style={
                    styles.feeSummaryBox
                  }
                >
                  <FeeSummaryRow
                    label="Total Course Fee"
                    value={formatCurrency(
                      selectedFee.totalFee
                    )}
                  />

                  <FeeSummaryRow
                    label="Total Paid"
                    value={formatCurrency(
                      selectedFee.paidAmount
                    )}
                  />

                  <FeeSummaryRow
                    label="Remaining Fee"
                    value={formatCurrency(
                      selectedFee.totalFee -
                        selectedFee.paidAmount
                    )}
                  />

                  <FeeSummaryRow
                    label="Installment Plan"
                    value={
                      selectedFee.installmentsEnabled
                        ? `${selectedFee.totalInstallments} Installments`
                        : 'Not Enabled'
                    }
                  />
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Installment Progress
                </Text>

                <View
                  style={
                    styles.installmentProgressBox
                  }
                >
                  <Text
                    style={
                      styles.installmentProgressText
                    }
                  >
                    {
                      selectedFee
                        .installments
                        .length
                    }{' '}
                    of{' '}
                    {
                      selectedFee
                        .totalInstallments
                    }{' '}
                    installments paid
                  </Text>

                  <View
                    style={
                      styles.progressTrack
                    }
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(
                            (selectedFee
                              .installments
                              .length /
                              selectedFee
                                .totalInstallments) *
                              100,
                            100
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Recent Payments
                </Text>

                {selectedFee.installments
                  .slice()
                  .reverse()
                  .map(
                    (
                      installment
                    ) => (
                      <View
                        key={
                          installment.id
                        }
                        style={
                          styles.paymentMiniCard
                        }
                      >
                        <View
                          style={
                            styles.paymentNumber
                          }
                        >
                          <Text
                            style={
                              styles.paymentNumberText
                            }
                          >
                            {
                              installment.installmentNumber
                            }
                          </Text>
                        </View>

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={
                              styles.paymentTitle
                            }
                          >
                            Installment{' '}
                            {
                              installment.installmentNumber
                            }
                          </Text>

                          <Text
                            style={
                              styles.paymentMeta
                            }
                          >
                            {
                              installment.paymentDate
                            }{' '}
                            •{' '}
                            {
                              installment.method
                            }
                          </Text>
                        </View>

                        <Text
                          style={
                            styles.paymentAmount
                          }
                        >
                          {formatCurrency(
                            installment.amount
                          )}
                        </Text>
                      </View>
                    )
                  )}

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    openCollectModal(
                      selectedFee
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="cash-plus"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Collect Next Installment
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          PAYMENT HISTORY
      ========================== */}
      <Modal
        visible={
          paymentHistoryVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPaymentHistoryVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Payment History
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedFee?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setPaymentHistoryVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedFee && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.historySummary
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.historyLabel
                      }
                    >
                      Total Fee
                    </Text>

                    <Text
                      style={
                        styles.historyValue
                      }
                    >
                      {formatCurrency(
                        selectedFee.totalFee
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.historyLabel
                      }
                    >
                      Paid
                    </Text>

                    <Text
                      style={[
                        styles.historyValue,
                        {
                          color:
                            '#22945F',
                        },
                      ]}
                    >
                      {formatCurrency(
                        selectedFee.paidAmount
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.historyLabel
                      }
                    >
                      Pending
                    </Text>

                    <Text
                      style={[
                        styles.historyValue,
                        {
                          color:
                            '#E95386',
                        },
                      ]}
                    >
                      {formatCurrency(
                        selectedFee.totalFee -
                          selectedFee.paidAmount
                      )}
                    </Text>
                  </View>
                </View>

                {selectedFee.installments
                  .slice()
                  .reverse()
                  .map(
                    (
                      installment
                    ) => (
                      <View
                        key={
                          installment.id
                        }
                        style={
                          styles.historyCard
                        }
                      >
                        <View
                          style={
                            styles.historyTop
                          }
                        >
                          <View
                            style={
                              styles.historyInstallmentIcon
                            }
                          >
                            <MaterialCommunityIcons
                              name="check"
                              size={19}
                              color="#22945F"
                            />
                          </View>

                          <View
                            style={{
                              flex: 1,
                            }}
                          >
                            <Text
                              style={
                                styles.historyTitle
                              }
                            >
                              Installment{' '}
                              {
                                installment.installmentNumber
                              }
                            </Text>

                            <Text
                              style={
                                styles.historyDate
                              }
                            >
                              {
                                installment.paymentDate
                              }
                            </Text>
                          </View>

                          <Text
                            style={
                              styles.historyAmount
                            }
                          >
                            {formatCurrency(
                              installment.amount
                            )}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.historyDetails
                          }
                        >
                          <Text
                            style={
                              styles.historyDetailText
                            }
                          >
                            Method:{' '}
                            {
                              installment.method
                            }
                          </Text>

                          <Text
                            style={
                              styles.historyDetailText
                            }
                          >
                            Ref:{' '}
                            {
                              installment.reference
                            }
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={
                            styles.receiptButton
                          }
                          onPress={() =>
                            downloadReceiptPDF(
                              selectedFee,
                              installment
                            )
                          }
                        >
                          <MaterialCommunityIcons
                            name="file-pdf-box"
                            size={17}
                            color="#7040D5"
                          />

                          <Text
                            style={
                              styles.receiptButtonText
                            }
                          >
                            Download Receipt
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )
                  )}

                {selectedFee
                  .installments
                  .length ===
                  0 && (
                  <View
                    style={
                      styles.emptyHistory
                    }
                  >
                    <MaterialCommunityIcons
                      name="history"
                      size={42}
                      color="#A7AFBD"
                    />

                    <Text
                      style={
                        styles.emptyTitle
                      }
                    >
                      No payments yet
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          COLLECT FEE / INSTALLMENT
      ========================== */}
      <Modal
        visible={
          collectModalVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setCollectModalVisible(
            false
          )
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={
              styles.largeModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View>
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Collect Fee
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedFee?.studentName
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setCollectModalVisible(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={23}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedFee && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.collectionSummary
                  }
                >
                  <View>
                    <Text
                      style={
                        styles.collectionLabel
                      }
                    >
                      Total Fee
                    </Text>

                    <Text
                      style={
                        styles.collectionValue
                      }
                    >
                      {formatCurrency(
                        selectedFee.totalFee
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.collectionLabel
                      }
                    >
                      Already Paid
                    </Text>

                    <Text
                      style={[
                        styles.collectionValue,
                        {
                          color:
                            '#22945F',
                        },
                      ]}
                    >
                      {formatCurrency(
                        selectedFee.paidAmount
                      )}
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.collectionLabel
                      }
                    >
                      Remaining
                    </Text>

                    <Text
                      style={[
                        styles.collectionValue,
                        {
                          color:
                            '#E95386',
                        },
                      ]}
                    >
                      {formatCurrency(
                        selectedFee.totalFee -
                          selectedFee.paidAmount
                      )}
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.formSectionTitle
                  }
                >
                  Payment Type
                </Text>

                <View
                  style={
                    styles.paymentTypeRow
                  }
                >
                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      !installmentEnabled &&
                        styles.paymentTypeActive,
                    ]}
                    onPress={() =>
                      setInstallmentEnabled(
                        false
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="cash"
                      size={19}
                      color={
                        !installmentEnabled
                          ? '#FFFFFF'
                          : '#7040D5'
                      }
                    />

                    <Text
                      style={[
                        styles.paymentTypeText,
                        !installmentEnabled &&
                          styles.paymentTypeTextActive,
                      ]}
                    >
                      Full Payment
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentTypeButton,
                      installmentEnabled &&
                        styles.paymentTypeActive,
                    ]}
                    onPress={() =>
                      setInstallmentEnabled(
                        true
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="calendar-multiple"
                      size={19}
                      color={
                        installmentEnabled
                          ? '#FFFFFF'
                          : '#7040D5'
                      }
                    />

                    <Text
                      style={[
                        styles.paymentTypeText,
                        installmentEnabled &&
                          styles.paymentTypeTextActive,
                      ]}
                    >
                      Installment
                    </Text>
                  </TouchableOpacity>
                </View>

                {installmentEnabled && (
                  <View
                    style={
                      styles.twoColumnRow
                    }
                  >
                    <View
                      style={
                        styles.formHalf
                      }
                    >
                      <Text
                        style={
                          styles.inputLabel
                        }
                      >
                        Installment Number
                      </Text>

                      <TextInput
                        value={
                          installmentNumber
                        }
                        onChangeText={
                          setInstallmentNumber
                        }
                        keyboardType="number-pad"
                        placeholder="e.g. 2"
                        placeholderTextColor="#A2AABB"
                        style={
                          styles.input
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.formHalf
                      }
                    >
                      <Text
                        style={
                          styles.inputLabel
                        }
                      >
                        Total Installments
                      </Text>

                      <TextInput
                        value={
                          totalInstallments
                        }
                        onChangeText={
                          setTotalInstallments
                        }
                        keyboardType="number-pad"
                        placeholder="e.g. 4"
                        placeholderTextColor="#A2AABB"
                        style={
                          styles.input
                        }
                      />
                    </View>
                  </View>
                )}

                {installmentEnabled && (
                  <View
                    style={
                      styles.installmentHint
                    }
                  >
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={18}
                      color="#7040D5"
                    />

                    <Text
                      style={
                        styles.installmentHintText
                      }
                    >
                      This payment will be recorded
                      as installment{' '}
                      {installmentNumber ||
                        '-'}{' '}
                      of{' '}
                      {totalInstallments ||
                        '-'}.
                    </Text>
                  </View>
                )}

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Payment Amount
                </Text>

                <View
                  style={
                    styles.amountInputBox
                  }
                >
                  <Text
                    style={
                      styles.currencyPrefix
                    }
                  >
                    ₹
                  </Text>

                  <TextInput
                    value={
                      paymentAmount
                    }
                    onChangeText={
                      setPaymentAmount
                    }
                    keyboardType="decimal-pad"
                    placeholder="Enter amount"
                    placeholderTextColor="#A2AABB"
                    style={
                      styles.amountInput
                    }
                  />
                </View>

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Payment Method
                </Text>

                <View
                  style={
                    styles.methodRow
                  }
                >
                  {[
                    'Cash',
                    'UPI',
                    'Card',
                    'Bank Transfer',
                  ].map(
                    (method) => (
                      <TouchableOpacity
                        key={method}
                        style={[
                          styles.methodButton,
                          paymentMethod ===
                            method &&
                            styles.methodButtonActive,
                        ]}
                        onPress={() =>
                          setPaymentMethod(
                            method as PaymentMethod
                          )
                        }
                      >
                        <Text
                          style={[
                            styles.methodText,
                            paymentMethod ===
                              method &&
                              styles.methodTextActive,
                          ]}
                        >
                          {method}
                        </Text>
                      </TouchableOpacity>
                    )
                  )}
                </View>

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Payment Date
                </Text>

                <TextInput
                  value={
                    paymentDate
                  }
                  onChangeText={
                    setPaymentDate
                  }
                  placeholder="DD MMM YYYY"
                  placeholderTextColor="#A2AABB"
                  style={
                    styles.input
                  }
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Transaction / Reference
                </Text>

                <TextInput
                  value={
                    transactionReference
                  }
                  onChangeText={
                    setTransactionReference
                  }
                  placeholder="Enter transaction reference"
                  placeholderTextColor="#A2AABB"
                  style={
                    styles.input
                  }
                />

                <Text
                  style={
                    styles.inputLabel
                  }
                >
                  Remarks
                </Text>

                <TextInput
                  value={remarks}
                  onChangeText={
                    setRemarks
                  }
                  placeholder="Optional remarks"
                  placeholderTextColor="#A2AABB"
                  multiline
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                />

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={
                    savePayment
                  }
                >
                  <MaterialCommunityIcons
                    name="check-circle-outline"
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Record Payment
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.detailItem}
    >
      <Text
        style={styles.detailLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.detailValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function FeeSummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.feeSummaryRow
      }
    >
      <Text
        style={
          styles.feeSummaryLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.feeSummaryValue
        }
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    minHeight: 64,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
  },

  addButton: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  addButtonText: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
  },

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    color: '#172033',
  },

  managementSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#7B8496',
    marginBottom: 16,
  },

  /*
   * 3 CARDS PER ROW
   */
  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },

  summaryCard: {
    height: 112,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 11,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.035,
    shadowRadius: 5,
    elevation: 2,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    color: '#7B8496',
    fontSize: 9,
    lineHeight: 12,
    marginTop: 3,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 13.5,
    marginTop: 1,
  },

  searchBox: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E9ECF2',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11.5,
    color: '#172033',
    marginLeft: 8,
  },

  filterContainer: {
    gap: 8,
    paddingBottom: 15,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 13,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#687386',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  listTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  recordCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#8A93A4',
  },

  feeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  studentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#7040D5',
    fontFamily: 'PoppinsBold',
    fontSize: 12,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9.5,
    marginTop: 1,
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 10,
  },

  infoItem: {
    width: '47%',
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    color: '#313B4E',
    fontSize: 10.5,
    marginTop: 2,
  },

  amountBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  amountText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 10.5,
    marginTop: 2,
  },

  progressHeader: {
    marginTop: 13,
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  progressPercent: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
  },

  progressTrack: {
    height: 7,
    backgroundColor: '#ECEEF4',
    borderRadius: 20,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7040D5',
    borderRadius: 20,
  },

  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
  },

  installmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1EAFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
    gap: 4,
  },

  installmentText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#7040D5',
  },

  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#59657A',
    fontSize: 13,
    marginTop: 10,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    color: '#9AA2B1',
    fontSize: 10,
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(20, 24, 35, 0.48)',
    justifyContent: 'flex-end',
  },

  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 28,
  },

  largeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    padding: 18,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8A93A4',
    marginTop: 2,
  },

  actionItem: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    gap: 11,
  },

  deleteAction: {
    borderBottomWidth: 0,
  },

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#313B4E',
  },

  detailStudentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 13,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },

  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  largeAvatarText: {
    fontFamily: 'PoppinsBold',
    color: '#7040D5',
    fontSize: 15,
  },

  detailStudentName: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 14,
  },

  detailStudentId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 10,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  detailItem: {
    width: '47%',
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 10,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A4',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
    color: '#313B4E',
    marginTop: 3,
  },

  feeSummaryBox: {
    backgroundColor: '#F1EAFF',
    borderRadius: 13,
    padding: 13,
    marginTop: 13,
  },

  feeSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },

  feeSummaryLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#6F7890',
    fontSize: 10,
  },

  feeSummaryValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 10.5,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 13,
    marginTop: 17,
    marginBottom: 9,
  },

  installmentProgressBox: {
    backgroundColor: '#F8F9FC',
    borderRadius: 11,
    padding: 12,
  },

  installmentProgressText: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 10,
    marginBottom: 7,
  },

  paymentMiniCard: {
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 11,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  paymentNumber: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentNumberText: {
    fontFamily: 'PoppinsBold',
    color: '#22945F',
    fontSize: 11,
  },

  paymentTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10.5,
  },

  paymentMeta: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 2,
  },

  paymentAmount: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 10.5,
  },

  primaryButton: {
    minHeight: 45,
    backgroundColor: '#7040D5',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 15,
    marginBottom: 5,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
  },

  historySummary: {
    backgroundColor: '#F1EAFF',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  historyLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#7C8495',
  },

  historyValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 11.5,
    color: '#172033',
    marginTop: 3,
  },

  historyCard: {
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 13,
    padding: 12,
    marginBottom: 10,
  },

  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  historyInstallmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E7F8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 11,
  },

  historyDate: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
    marginTop: 2,
  },

  historyAmount: {
    fontFamily: 'PoppinsBold',
    color: '#22945F',
    fontSize: 11,
  },

  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },

  historyDetailText: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 8.5,
  },

  receiptButton: {
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: 10,
  },

  receiptButtonText: {
    fontFamily: 'PoppinsSemiBold',
    color: '#7040D5',
    fontSize: 9.5,
  },

  emptyHistory: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },

  collectionSummary: {
    backgroundColor: '#F1EAFF',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  collectionLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#7C8495',
  },

  collectionValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 11.5,
    color: '#172033',
    marginTop: 3,
  },

  formSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#172033',
    marginBottom: 9,
  },

  paymentTypeRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 14,
  },

  paymentTypeButton: {
    flex: 1,
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#DADDE6',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  paymentTypeActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  paymentTypeText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 10,
  },

  paymentTypeTextActive: {
    color: '#FFFFFF',
  },

  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },

  formHalf: {
    flex: 1,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  input: {
    height: 43,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    color: '#172033',
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    backgroundColor: '#FFFFFF',
  },

  textArea: {
    height: 75,
    paddingTop: 10,
    textAlignVertical: 'top',
  },

  installmentHint: {
    backgroundColor: '#F1EAFF',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 5,
  },

  installmentHintText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    color: '#7040D5',
    fontSize: 9,
    lineHeight: 14,
  },

  amountInputBox: {
    height: 47,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },

  currencyPrefix: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#7040D5',
    marginRight: 7,
  },

  amountInput: {
    flex: 1,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
  },

  methodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  methodButton: {
    height: 35,
    paddingHorizontal: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    justifyContent: 'center',
    alignItems: 'center',
  },

  methodButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  methodText: {
    fontFamily: 'PoppinsMedium',
    color: '#687386',
    fontSize: 9.5,
  },

  methodTextActive: {
    color: '#7040D5',
  },
});