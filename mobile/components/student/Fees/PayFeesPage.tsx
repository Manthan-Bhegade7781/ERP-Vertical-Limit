import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import {
  getMyFees,
  payStudentFee,
  StudentFeeRecord,
} from '../../../services/fees';

type PayFeesPageProps = {
  feeRecords?: StudentFeeRecord[];
  onContentScroll?: (event: any) => void;
  onPaymentSuccess?: (payment: Payment) => void;
  onViewReceipt?: (payment: Payment) => void;
  onBack?: () => void;
};

type FeeItem = {
  id: string;
  recordId?: string;
  title: string;
  total: number;
  paid: number;
};

export type Payment = {
  id: string;
  receiptNumber: string;
  date: string;
  title: string;
  amount: number;
  method: string;
  status: 'Paid';
  transactionId: string;
};

const paymentMethods = [
  {
    id: 'upi',
    title: 'UPI',
    subtitle: 'Google Pay, PhonePe, Paytm',
    icon: 'phone-portrait-outline' as const,
  },
  {
    id: 'card',
    title: 'Debit / Credit Card',
    subtitle: 'Visa, Mastercard, RuPay',
    icon: 'card-outline' as const,
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    subtitle: 'All major banks supported',
    icon: 'globe-outline' as const,
  },
];

export default function PayFeesPage({
  feeRecords: initialRecords,
  onContentScroll,
  onPaymentSuccess,
  onViewReceipt,
  onBack,
}: PayFeesPageProps) {
  const [liveRecords, setLiveRecords] = useState<StudentFeeRecord[] | null>(
    initialRecords ?? null,
  );
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await getMyFees();
      setLiveRecords(res.records);
    } catch (err) {
      console.error('Failed to load fee records for payment:', err);
    }
  }, []);

  useEffect(() => {
    if (initialRecords === undefined) {
      void fetchRecords();
    }
  }, [initialRecords, fetchRecords]);

  useFocusEffect(
    useCallback(() => {
      if (initialRecords === undefined) {
        void fetchRecords();
      }
    }, [initialRecords, fetchRecords]),
  );

  const feeItems: FeeItem[] = useMemo(() => {
    if (liveRecords && Array.isArray(liveRecords)) {
      const pending = liveRecords.filter(
        (r) => Number(r.paidAmount || 0) < Number(r.totalAmount || 0),
      );
      const paid = liveRecords.filter(
        (r) => Number(r.paidAmount || 0) >= Number(r.totalAmount || 0),
      );
      const combined = [...pending, ...paid];

      return combined.map((r) => ({
        id: r._id,
        recordId: r._id,
        title: r.feeType.toLowerCase().includes('fee')
          ? r.feeType
          : `${r.feeType} Fee`,
        total: Number(r.totalAmount || 0),
        paid: Number(r.paidAmount || 0),
      }));
    }
    return [];
  }, [liveRecords]);

  const [selectedFee, setSelectedFee] = useState<string>(
    feeItems.find((f) => f.total - f.paid > 0)?.id ?? feeItems[0]?.id ?? '',
  );

  useEffect(() => {
    if (feeItems.length > 0 && !feeItems.some((f) => f.id === selectedFee)) {
      const pendingFirst =
        feeItems.find((f) => f.total - f.paid > 0) ?? feeItems[0];
      setSelectedFee(pendingFirst.id);
    }
  }, [feeItems, selectedFee]);

  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const pendingAmount = useMemo(() => {
    return feeItems.reduce(
      (sum, item) => sum + Math.max(0, item.total - item.paid),
      0,
    );
  }, [feeItems]);

  const selectedFeeItem = feeItems.find(
    (item) => item.id === selectedFee,
  );

  const selectedAmount = selectedFeeItem
    ? Math.max(0, selectedFeeItem.total - selectedFeeItem.paid)
    : 0;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handlePayment = async () => {
    if (selectedAmount <= 0 || isProcessing) {
      return;
    }

    setIsProcessing(true);

    const methodTitle =
      paymentMethods.find((m) => m.id === selectedMethod)?.title ?? 'UPI';

    try {
      if (selectedFeeItem?.recordId) {
        const res = await payStudentFee({
          feeRecordId: selectedFeeItem.recordId,
          amount: selectedAmount,
          method: methodTitle,
        });

        const payment: Payment = {
          id: res.payment._id || `payment-${Date.now()}`,
          receiptNumber: res.payment.receiptNumber,
          date: res.payment.paymentDate
            ? new Date(res.payment.paymentDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Today',
          title: selectedFeeItem?.title ?? 'Fee Payment',
          amount: res.payment.amount,
          method: res.payment.method,
          status: 'Paid',
          transactionId:
            res.payment.reference || res.payment.receiptNumber || 'TXN12345678',
        };

        setLastPayment(payment);
        setPaymentComplete(true);
        onPaymentSuccess?.(payment);
        void fetchRecords();
      } else {
        // Simulated payment fallback
        const payment: Payment = {
          id: `payment-${Date.now()}`,
          receiptNumber: `VL-2026-${Math.floor(10000 + Math.random() * 89999)}`,
          date: new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          title: selectedFeeItem?.title ?? 'Fee Payment',
          amount: selectedAmount,
          method: methodTitle,
          status: 'Paid',
          transactionId: `TXN${Math.floor(10000000 + Math.random() * 89999999)}`,
        };

        setLastPayment(payment);
        setPaymentComplete(true);
        onPaymentSuccess?.(payment);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      Alert.alert('Payment Failed', err.message || 'Could not process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentComplete) {
    const paymentToShow = lastPayment ?? {
      id: 'p-done',
      receiptNumber: 'VL-2026-REC',
      date: 'Today',
      title: selectedFeeItem?.title ?? 'Fee Payment',
      amount: selectedAmount,
      method:
        paymentMethods.find((m) => m.id === selectedMethod)?.title ?? 'UPI',
      status: 'Paid' as const,
      transactionId: 'TXN12345678',
    };

    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.successContent}
          onScroll={onContentScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark"
              size={42}
              color="#fff"
            />
          </View>

          <Text style={styles.successTitle}>
            Payment Successful
          </Text>

          <Text style={styles.successSubtitle}>
            Your fee payment has been completed successfully.
          </Text>

          <View style={styles.successCard}>
            <Text style={styles.successLabel}>
              AMOUNT PAID
            </Text>

            <Text style={styles.successAmount}>
              {formatCurrency(paymentToShow.amount)}
            </Text>

            <View style={styles.successDivider} />

            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>
                Fee
              </Text>

              <Text style={styles.successRowValue}>
                {paymentToShow.title}
              </Text>
            </View>

            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>
                Method
              </Text>

              <Text style={styles.successRowValue}>
                {paymentToShow.method}
              </Text>
            </View>

            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>
                Receipt No.
              </Text>

              <Text style={styles.successRowValue}>
                {paymentToShow.receiptNumber}
              </Text>
            </View>

            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>
                Date
              </Text>

              <Text style={styles.successRowValue}>
                {paymentToShow.date}
              </Text>
            </View>

            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>
                Status
              </Text>

              <View style={styles.successBadge}>
                <Text style={styles.successBadgeText}>
                  Paid
                </Text>
              </View>
            </View>
          </View>

          {onViewReceipt && (
            <Pressable
              style={styles.payButton}
              onPress={() => onViewReceipt(paymentToShow)}
            >
              <Ionicons
                name="receipt-outline"
                size={18}
                color="#fff"
              />
              <Text style={styles.payButtonText}>
                View Receipt
              </Text>
            </Pressable>
          )}

          <Pressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={17}
              color="#6630D7"
            />

            <Text style={styles.backButtonText}>
              Back to Fees
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Pressable
            style={styles.backIcon}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#333"
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>
              Pay Fees
            </Text>

            <Text style={styles.pageSubtitle}>
              Complete your pending fee payment
            </Text>
          </View>
        </View>

        {/* Pending Amount */}
        <View style={styles.pendingCard}>
          <View>
            <Text style={styles.pendingLabel}>
              TOTAL PENDING
            </Text>

            <Text style={styles.pendingAmount}>
              {formatCurrency(pendingAmount)}
            </Text>

            <Text style={styles.pendingSubtitle}>
              {pendingAmount > 0
                ? `Across ${feeItems.filter((f) => f.total - f.paid > 0).length} fee categories`
                : 'No pending fees'}
            </Text>
          </View>

          <View style={styles.pendingIcon}>
            <Ionicons
              name="wallet-outline"
              size={27}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Select Fee */}
        <Text style={styles.sectionTitle}>
          Select Fee
        </Text>

        <View style={styles.feeList}>
          {feeItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={34}
                  color="#16A34A"
                />
              </View>
              <Text style={styles.emptyTitle}>No Fees Assigned</Text>
              <Text style={styles.emptySubtitle}>
                You do not have any pending fees to pay at this time.
              </Text>
            </View>
          ) : (
            feeItems.map((item) => {
            const pending = item.total - item.paid;
            const isSelected = selectedFee === item.id;

            return (
              <Pressable
                key={item.id}
                disabled={pending <= 0}
                onPress={() => setSelectedFee(item.id)}
                style={[
                  styles.feeCard,
                  isSelected && styles.selectedFeeCard,
                  pending <= 0 && styles.disabledFeeCard,
                ]}
              >
                <View
                  style={[
                    styles.radio,
                    isSelected && styles.radioSelected,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.radioInner} />
                  )}
                </View>

                <View style={styles.feeInfo}>
                  <Text style={styles.feeTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.feePaid}>
                    Paid {formatCurrency(item.paid)} of{' '}
                    {formatCurrency(item.total)}
                  </Text>
                </View>

                <View style={styles.feeRight}>
                  <Text
                    style={[
                      styles.feePending,
                      pending <= 0 &&
                        styles.feePaidComplete,
                    ]}
                  >
                    {pending > 0
                      ? formatCurrency(pending)
                      : 'Paid'}
                  </Text>

                  <Text style={styles.feePendingLabel}>
                    {pending > 0 ? 'Due' : 'Complete'}
                  </Text>
                </View>
              </Pressable>
            );
          }))}
        </View>

        {/* Payment Amount */}
        <Text style={styles.sectionTitle}>
          Payment Amount
        </Text>

        <View style={styles.amountCard}>
          <View>
            <Text style={styles.amountLabel}>
              AMOUNT TO PAY
            </Text>

            <Text style={styles.amountValue}>
              {formatCurrency(selectedAmount)}
            </Text>
          </View>

          <View style={styles.amountIcon}>
            <Ionicons
              name="cash-outline"
              size={22}
              color="#16A34A"
            />
          </View>
        </View>

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>
          Select Payment Method
        </Text>

        <View style={styles.methodsContainer}>
          {paymentMethods.map((method) => {
            const selected =
              selectedMethod === method.id;

            return (
              <Pressable
                key={method.id}
                onPress={() =>
                  setSelectedMethod(method.id)
                }
                style={[
                  styles.methodCard,
                  selected && styles.selectedMethodCard,
                ]}
              >
                <View style={styles.methodIcon}>
                  <Ionicons
                    name={method.icon}
                    size={21}
                    color="#6630D7"
                  />
                </View>

                <View style={styles.methodText}>
                  <Text style={styles.methodTitle}>
                    {method.title}
                  </Text>

                  <Text style={styles.methodSubtitle}>
                    {method.subtitle}
                  </Text>
                </View>

                <View
                  style={[
                    styles.methodRadio,
                    selected &&
                      styles.methodRadioSelected,
                  ]}
                >
                  {selected && (
                    <View
                      style={styles.methodRadioInner}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Secure Payment */}
        <View style={styles.secureCard}>
          <View style={styles.secureIcon}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#16A34A"
            />
          </View>

          <View style={styles.secureText}>
            <Text style={styles.secureTitle}>
              Secure Payment
            </Text>

            <Text style={styles.secureSubtitle}>
              Your payment information is protected with
              secure encryption.
            </Text>
          </View>
        </View>

        {/* Pay Button */}
        <Pressable
          disabled={
            selectedAmount <= 0 || isProcessing
          }
          onPress={handlePayment}
          style={[
            styles.payButton,
            (selectedAmount <= 0 || isProcessing) &&
              styles.payButtonDisabled,
          ]}
        >
          {isProcessing ? (
            <>
              <Ionicons
                name="sync-outline"
                size={19}
                color="#fff"
              />

              <Text style={styles.payButtonText}>
                Processing...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="lock-closed-outline"
                size={17}
                color="#fff"
              />

              <Text style={styles.payButtonText}>
                {selectedAmount <= 0
                  ? 'No Dues to Pay'
                  : `Pay ${formatCurrency(selectedAmount)}`}
              </Text>
            </>
          )}
        </Pressable>

        <Text style={styles.termsText}>
          By continuing, you agree to the school's fee
          payment terms and conditions.
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 17,
  },

  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#292532',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },

  pendingCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 19,
  },

  pendingLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#8069B0',
    letterSpacing: 0.7,
  },

  pendingAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 29,
    color: '#4D259D',
    marginTop: 2,
  },

  pendingSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8069B0',
  },

  pendingIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  feeList: {
    marginBottom: 17,
  },

  feeCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E5EF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedFeeCard: {
    borderColor: '#6630D7',
    backgroundColor: '#FAF8FF',
  },

  disabledFeeCard: {
    opacity: 0.55,
  },

  radio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C8C3D1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  radioSelected: {
    borderColor: '#6630D7',
  },

  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#6630D7',
  },

  feeInfo: {
    flex: 1,
  },

  feeTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  feePaid: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  feeRight: {
    alignItems: 'flex-end',
  },

  feePending: {
    fontFamily: 'PoppinsBold',
    fontSize: 11,
    color: '#6630D7',
  },

  feePaidComplete: {
    color: '#16A34A',
  },

  feePendingLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 1,
  },

  amountCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amountLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.5,
  },

  amountValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 25,
    color: '#333',
    marginTop: 2,
  },

  amountIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EAFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  methodsContainer: {
    marginBottom: 16,
  },

  methodCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E9E5EF',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  selectedMethodCard: {
    borderColor: '#6630D7',
    backgroundColor: '#FAF8FF',
  },

  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  methodText: {
    flex: 1,
  },

  methodTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  methodSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  methodRadio: {
    width: 21,
    height: 21,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#C8C3D1',
    justifyContent: 'center',
    alignItems: 'center',
  },

  methodRadioSelected: {
    borderColor: '#6630D7',
  },

  methodRadioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#6630D7',
  },

  secureCard: {
    backgroundColor: '#EAFBF1',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  secureIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  secureText: {
    flex: 1,
  },

  secureTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#16713A',
  },

  secureSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    lineHeight: 11,
    color: '#528267',
    marginTop: 2,
  },

  payButton: {
    height: 50,
    borderRadius: 15,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  payButtonDisabled: {
    backgroundColor: '#BDB8C8',
  },

  payButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#fff',
    marginLeft: 7,
  },

  termsText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    lineHeight: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 9,
    paddingHorizontal: 20,
  },

  successContent: {
    paddingHorizontal: 20,
    paddingTop: 55,
    alignItems: 'center',
  },

  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#292532',
    marginTop: 17,
  },

  successSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },

  successCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 19,
    padding: 18,
    marginTop: 22,
  },

  successLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    letterSpacing: 0.7,
  },

  successAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 31,
    color: '#16A34A',
    textAlign: 'center',
    marginTop: 3,
  },

  successDivider: {
    height: 1,
    backgroundColor: '#EEEAF2',
    marginVertical: 15,
  },

  successRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 11,
  },

  successRowLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#999',
  },

  successRowValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#444',
    maxWidth: '60%',
    textAlign: 'right',
  },

  successBadge: {
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },

  successBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#16A34A',
  },

  backButton: {
    height: 45,
    paddingHorizontal: 18,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },

  backButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#6630D7',
    marginLeft: 6,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEAF3',
  },

  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#1F1C2E',
    marginBottom: 4,
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#777',
    textAlign: 'center',
    lineHeight: 16,
  },
});