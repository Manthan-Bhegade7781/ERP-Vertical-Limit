import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PaymentHistoryPageProps = {
  onContentScroll?: (event: any) => void;
  onReceiptPress?: (payment: Payment) => void;
};

type Payment = {
  id: string;
  receiptNumber: string;
  date: string;
  title: string;
  amount: number;
  method: string;
  status: 'Paid' | 'Processing' | 'Failed';
  transactionId: string;
};

const payments: Payment[] = [
  {
    id: 'payment-1',
    receiptNumber: 'VL-2026-00124',
    date: '10 Sep 2026',
    title: 'Development Fee',
    amount: 6000,
    method: 'UPI',
    status: 'Paid',
    transactionId: 'TXN84920173',
  },
  {
    id: 'payment-2',
    receiptNumber: 'VL-2026-00098',
    date: '10 Jun 2026',
    title: 'Tuition Fee',
    amount: 30000,
    method: 'Debit Card',
    status: 'Paid',
    transactionId: 'TXN73281642',
  },
  {
    id: 'payment-3',
    receiptNumber: 'VL-2026-00099',
    date: '10 Jun 2026',
    title: 'Transport Fee',
    amount: 6000,
    method: 'UPI',
    status: 'Paid',
    transactionId: 'TXN73281751',
  },
  {
    id: 'payment-4',
    receiptNumber: 'VL-2026-00072',
    date: '12 Apr 2026',
    title: 'Activity Fee',
    amount: 3000,
    method: 'Net Banking',
    status: 'Paid',
    transactionId: 'TXN60182931',
  },
];

const filters = ['All', 'UPI', 'Debit Card', 'Net Banking'];

export default function PaymentHistoryPage({
  onContentScroll,
  onReceiptPress,
}: PaymentHistoryPageProps) {
  const [selectedFilter, setSelectedFilter] =
    useState('All');

  const filteredPayments = useMemo(() => {
    if (selectedFilter === 'All') {
      return payments;
    }

    return payments.filter(
      (payment) => payment.method === selectedFilter,
    );
  }, [selectedFilter]);

  const totalPaid = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'phone-portrait-outline';

      case 'Debit Card':
        return 'card-outline';

      case 'Net Banking':
        return 'globe-outline';

      default:
        return 'card-outline';
    }
  };

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
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>
              Payment History
            </Text>

            <Text style={styles.pageSubtitle}>
              View your previous fee payments
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="receipt-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Total Paid Card */}
        <View style={styles.totalCard}>
          <View>
            <Text style={styles.totalLabel}>
              TOTAL PAID
            </Text>

            <Text style={styles.totalAmount}>
              {formatCurrency(totalPaid)}
            </Text>

            <Text style={styles.totalSubtitle}>
              {payments.length} successful payments
            </Text>
          </View>

          <View style={styles.totalIcon}>
            <Ionicons
              name="checkmark-circle"
              size={28}
              color="#fff"
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#EAFBF1',
                },
              ]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryValue}>
              {payments.filter(
                (payment) => payment.status === 'Paid',
              ).length}
            </Text>

            <Text style={styles.summaryLabel}>
              Successful
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#EAF4FF',
                },
              ]}
            >
              <Ionicons
                name="calendar-outline"
                size={19}
                color="#2563EB"
              />
            </View>

            <Text style={styles.summaryValue}>
              2026
            </Text>

            <Text style={styles.summaryLabel}>
              Academic Year
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#EEE7FF',
                },
              ]}
            >
              <Ionicons
                name="card-outline"
                size={19}
                color="#6630D7"
              />
            </View>

            <Text style={styles.summaryValue}>
              3
            </Text>

            <Text style={styles.summaryLabel}>
              Methods
            </Text>
          </View>
        </View>

        {/* Filter */}
        <View style={styles.filterHeader}>
          <Text style={styles.sectionTitle}>
            Filter Payments
          </Text>

          <Text style={styles.paymentCount}>
            {filteredPayments.length} payments
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter) => {
            const active =
              selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                style={[
                  styles.filterChip,
                  active && styles.activeFilterChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Payment List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Transactions
          </Text>

          <Text style={styles.yearText}>
            2026 - 27
          </Text>
        </View>

        {filteredPayments.map((payment) => (
          <View
            key={payment.id}
            style={styles.paymentCard}
          >
            <View style={styles.paymentTopRow}>
              <View style={styles.paymentIcon}>
                <Ionicons
                  name={getPaymentIcon(payment.method)}
                  size={21}
                  color="#6630D7"
                />
              </View>

              <View style={styles.paymentMain}>
                <Text style={styles.paymentTitle}>
                  {payment.title}
                </Text>

                <Text style={styles.paymentDate}>
                  {payment.date}
                </Text>
              </View>

              <View style={styles.paymentAmountContainer}>
                <Text style={styles.paymentAmount}>
                  {formatCurrency(payment.amount)}
                </Text>

                <View style={styles.paidBadge}>
                  <Ionicons
                    name="checkmark"
                    size={10}
                    color="#16A34A"
                  />

                  <Text style={styles.paidText}>
                    Paid
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.transactionDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Payment Method
                </Text>

                <Text style={styles.detailValue}>
                  {payment.method}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>
                  Transaction ID
                </Text>

                <Text
                  style={styles.detailValue}
                  numberOfLines={1}
                >
                  {payment.transactionId}
                </Text>
              </View>
            </View>

            <View style={styles.receiptRow}>
              <View>
                <Text style={styles.receiptNumberLabel}>
                  Receipt No.
                </Text>

                <Text style={styles.receiptNumber}>
                  {payment.receiptNumber}
                </Text>
              </View>

              <Pressable
                style={styles.receiptButton}
                onPress={() =>
                  onReceiptPress?.(payment)
                }
              >
                <Ionicons
                  name="document-text-outline"
                  size={15}
                  color="#6630D7"
                />

                <Text style={styles.receiptButtonText}>
                  View Receipt
                </Text>
              </Pressable>
            </View>
          </View>
        ))}

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="receipt-outline"
                size={30}
                color="#6630D7"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Payments Found
            </Text>

            <Text style={styles.emptyText}>
              There are no payments matching the selected
              payment method.
            </Text>
          </View>
        )}

        {/* Payment Timeline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Payment Timeline
          </Text>

          <Ionicons
            name="time-outline"
            size={19}
            color="#6630D7"
          />
        </View>

        <View style={styles.timelineCard}>
          {payments.slice(0, 3).map((payment, index) => (
            <View
              key={`timeline-${payment.id}`}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot}>
                  <Ionicons
                    name="checkmark"
                    size={11}
                    color="#fff"
                  />
                </View>

                {index <
                  Math.min(payments.length, 3) - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>
                  {payment.title}
                </Text>

                <Text style={styles.timelineDate}>
                  {payment.date} • {payment.method}
                </Text>

                <Text style={styles.timelineAmount}>
                  {formatCurrency(payment.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Payment Records
            </Text>

            <Text style={styles.infoText}>
              Your successful fee payments are listed here.
              You can view individual receipts for your
              records.
            </Text>
          </View>
        </View>

        {/* Security */}
        <View style={styles.securityRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={17}
            color="#16A34A"
          />

          <Text style={styles.securityText}>
            Payment records are securely maintained.
          </Text>
        </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
    color: '#24212D',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  headerIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  totalCard: {
    backgroundColor: '#6630D7',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  totalLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#DCCFFF',
    letterSpacing: 0.8,
  },

  totalAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 30,
    color: '#fff',
    marginTop: 3,
  },

  totalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#DDD2FF',
  },

  totalIcon: {
    width: 61,
    height: 61,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 11,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: '#333',
  },

  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 1,
  },

  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
  },

  paymentCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  filterContent: {
    gap: 8,
    paddingTop: 9,
    paddingBottom: 17,
  },

  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4DFEC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  activeFilterChip: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#666',
  },

  activeFilterText: {
    color: '#fff',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  yearText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  paymentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  paymentMain: {
    flex: 1,
  },

  paymentTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#333',
  },

  paymentDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },

  paymentAmountContainer: {
    alignItems: 'flex-end',
  },

  paymentAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: '#333',
  },

  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 7,
    marginTop: 3,
  },

  paidText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#16A34A',
    marginLeft: 2,
  },

  transactionDetails: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0EDF4',
    marginTop: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    gap: 10,
  },

  detailItem: {
    flex: 1,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#555',
    marginTop: 2,
  },

  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  receiptNumberLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
  },

  receiptNumber: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#555',
    marginTop: 1,
  },

  receiptButton: {
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#EEE7FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  receiptButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#6630D7',
    marginLeft: 4,
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 17,
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#333',
    marginTop: 11,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },

  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 15,
    marginBottom: 16,
  },

  timelineItem: {
    flexDirection: 'row',
    minHeight: 72,
  },

  timelineLeft: {
    width: 27,
    alignItems: 'center',
  },

  timelineDot: {
    width: 23,
    height: 23,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#DCEBDD',
    marginTop: -1,
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 13,
  },

  timelineTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  timelineDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },

  timelineAmount: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#16A34A',
    marginTop: 3,
  },

  infoCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#4B278F',
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 3,
  },

  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 13,
  },

  securityText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#777',
    marginLeft: 5,
  },
});