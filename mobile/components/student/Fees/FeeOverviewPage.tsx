import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeeOverviewPageProps = {
  onContentScroll?: (event: any) => void;
  onPaymentHistoryPress?: () => void;
  onPayFeesPress?: () => void;
};

type FeeItem = {
  id: string;
  title: string;
  amount: number;
  paid: number;
  status: 'Paid' | 'Pending' | 'Partial';
  dueDate: string;
};

const feeItems: FeeItem[] = [
  {
    id: 'fee-1',
    title: 'Tuition Fee',
    amount: 30000,
    paid: 30000,
    status: 'Paid',
    dueDate: '10 Jun 2026',
  },
  {
    id: 'fee-2',
    title: 'Development Fee',
    amount: 8000,
    paid: 6000,
    status: 'Partial',
    dueDate: '10 Sep 2026',
  },
  {
    id: 'fee-3',
    title: 'Activity Fee',
    amount: 5000,
    paid: 3000,
    status: 'Partial',
    dueDate: '25 Sep 2026',
  },
  {
    id: 'fee-4',
    title: 'Transport Fee',
    amount: 6000,
    paid: 6000,
    status: 'Paid',
    dueDate: '10 Jun 2026',
  },
];

export default function FeeOverviewPage({
  onContentScroll,
  onPaymentHistoryPress,
  onPayFeesPress,
}: FeeOverviewPageProps) {
  const totalFees = feeItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const paidFees = feeItems.reduce(
    (sum, item) => sum + item.paid,
    0,
  );

  const pendingFees = totalFees - paidFees;

  const paidPercentage =
    totalFees > 0
      ? Math.round((paidFees / totalFees) * 100)
      : 0;

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusColor = (status: FeeItem['status']) => {
    if (status === 'Paid') {
      return '#16A34A';
    }

    if (status === 'Partial') {
      return '#D97706';
    }

    return '#DC2626';
  };

  const getStatusBackground = (
    status: FeeItem['status'],
  ) => {
    if (status === 'Paid') {
      return '#EAFBF1';
    }

    if (status === 'Partial') {
      return '#FFF7E6';
    }

    return '#FEF2F2';
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
              Fees
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage your fee payments
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="wallet-outline"
              size={24}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Pending Amount Card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardTop}>
            <View style={styles.mainCardLeft}>
              <Text style={styles.mainCardLabel}>
                TOTAL FEES DUE
              </Text>

              <Text style={styles.pendingAmount}>
                {formatCurrency(pendingFees)}
              </Text>

              <Text style={styles.mainCardSubtitle}>
                Pending amount
              </Text>
            </View>

            <View style={styles.walletCircle}>
              <Ionicons
                name="wallet"
                size={27}
                color="#fff"
              />
            </View>
          </View>

          <View style={styles.progressArea}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>
                Payment progress
              </Text>

              <Text style={styles.progressPercentage}>
                {paidPercentage}%
              </Text>
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${paidPercentage}%`,
                  },
                ]}
              />
            </View>
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
                size={20}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryLabel}>
              Paid
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(paidFees)}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#FFF7E6',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={20}
                color="#D97706"
              />
            </View>

            <Text style={styles.summaryLabel}>
              Pending
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(pendingFees)}
            </Text>
          </View>
        </View>

        {/* Due Date */}
        <View style={styles.dueDateCard}>
          <View style={styles.dueDateIcon}>
            <Ionicons
              name="calendar-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.dueDateContent}>
            <Text style={styles.dueDateLabel}>
              NEXT PAYMENT DUE
            </Text>

            <Text style={styles.dueDateValue}>
              25 Sep 2026
            </Text>

            <Text style={styles.dueDateAmount}>
              {formatCurrency(pendingFees)} remaining
            </Text>
          </View>

          <View style={styles.dueBadge}>
            <Text style={styles.dueBadgeText}>
              Due Soon
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <Pressable
            style={styles.payButton}
            onPress={onPayFeesPress}
          >
            <Ionicons
              name="card-outline"
              size={19}
              color="#fff"
            />

            <Text style={styles.payButtonText}>
              Pay Fees
            </Text>
          </Pressable>

          <Pressable
            style={styles.historyButton}
            onPress={onPaymentHistoryPress}
          >
            <Ionicons
              name="receipt-outline"
              size={19}
              color="#6630D7"
            />

            <Text style={styles.historyButtonText}>
              History
            </Text>
          </Pressable>
        </View>

        {/* Fee Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Fee Breakdown
          </Text>

          <Text style={styles.academicYear}>
            2026 - 27
          </Text>
        </View>

        {feeItems.map((item) => {
          const remaining =
            item.amount - item.paid;

          const statusColor = getStatusColor(
            item.status,
          );

          const statusBackground =
            getStatusBackground(item.status);

          const itemPercentage =
            item.amount > 0
              ? Math.round(
                  (item.paid / item.amount) * 100,
                )
              : 0;

          return (
            <View
              key={item.id}
              style={styles.feeCard}
            >
              <View style={styles.feeTopRow}>
                <View style={styles.feeIcon}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color="#6630D7"
                  />
                </View>

                <View style={styles.feeMain}>
                  <Text style={styles.feeTitle}>
                    {item.title}
                  </Text>

                  <Text style={styles.feeDueDate}>
                    Due: {item.dueDate}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusColor,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.feeAmountRow}>
                <View>
                  <Text style={styles.feeAmountLabel}>
                    Paid
                  </Text>

                  <Text style={styles.feeAmount}>
                    {formatCurrency(item.paid)}
                  </Text>
                </View>

                <View style={styles.amountRight}>
                  <Text style={styles.feeAmountLabel}>
                    Total
                  </Text>

                  <Text style={styles.feeTotal}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              </View>

              <View style={styles.feeProgressTrack}>
                <View
                  style={[
                    styles.feeProgressFill,
                    {
                      width: `${itemPercentage}%`,
                      backgroundColor:
                        statusColor,
                    },
                  ]}
                />
              </View>

              {remaining > 0 && (
                <View style={styles.remainingRow}>
                  <Text style={styles.remainingLabel}>
                    Remaining
                  </Text>

                  <Text
                    style={[
                      styles.remainingValue,
                      {
                        color: statusColor,
                      },
                    ]}
                  >
                    {formatCurrency(remaining)}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Payment Information */}
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
              Payment Information
            </Text>

            <Text style={styles.infoText}>
              You can make payments through the available
              payment methods. Payment receipts will be
              available in your payment history.
            </Text>
          </View>
        </View>

        {/* Security */}
        <View style={styles.securityCard}>
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color="#16A34A"
          />

          <Text style={styles.securityText}>
            Your payment information is securely processed.
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

  mainCard: {
    backgroundColor: '#6630D7',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  mainCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  mainCardLeft: {
    flex: 1,
  },

  mainCardLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#DCCFFF',
    letterSpacing: 0.8,
  },

  pendingAmount: {
    fontFamily: 'PoppinsBold',
    fontSize: 30,
    color: '#fff',
    marginTop: 3,
  },

  mainCardSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#DDD2FF',
  },

  walletCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  progressArea: {
    marginTop: 17,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  progressLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#DDD2FF',
  },

  progressPercentage: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#fff',
  },

  progressTrack: {
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 17,
    padding: 13,
  },

  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
  },

  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },

  dueDateCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  dueDateIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  dueDateContent: {
    flex: 1,
  },

  dueDateLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#8066A9',
    letterSpacing: 0.6,
  },

  dueDateValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#4B278F',
    marginTop: 2,
  },

  dueDateAmount: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#8066A9',
    marginTop: 1,
  },

  dueBadge: {
    backgroundColor: '#FFF7E6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  dueBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#D97706',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 19,
  },

  payButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  payButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#fff',
    marginLeft: 6,
  },

  historyButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD7E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#6630D7',
    marginLeft: 6,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
  },

  academicYear: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  feeCard: {
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

  feeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  feeIcon: {
    width: 41,
    height: 41,
    borderRadius: 12,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  feeMain: {
    flex: 1,
  },

  feeTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#333',
  },

  feeDueDate: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
  },

  feeAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  feeAmountLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  feeAmount: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#333',
    marginTop: 2,
  },

  amountRight: {
    alignItems: 'flex-end',
  },

  feeTotal: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },

  feeProgressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: '#F0EDF4',
    overflow: 'hidden',
    marginTop: 11,
  },

  feeProgressFill: {
    height: '100%',
    borderRadius: 5,
  },

  remainingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },

  remainingLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  remainingValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
  },

  infoCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    marginTop: 5,
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

  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
    paddingHorizontal: 10,
  },

  securityText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#777',
    marginLeft: 5,
  },
});