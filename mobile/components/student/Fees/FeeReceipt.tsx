import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type FeeReceiptPayment = {
  id?: string;
  receiptNumber?: string;
  date?: string;
  title?: string;
  amount?: number;
  method?: string;
  status?: string;
  transactionId?: string;
};

type FeeReceiptProps = {
  payment?: FeeReceiptPayment | null;
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

const defaultPayment: FeeReceiptPayment = {
  id: 'payment-demo',
  receiptNumber: 'VL-2026-00124',
  date: '10 Sep 2026',
  title: 'Development Fee',
  amount: 6000,
  method: 'UPI',
  status: 'Paid',
  transactionId: 'TXN84920173',
};

export default function FeeReceipt({
  payment,
  onContentScroll,
  onBack,
}: FeeReceiptProps) {
  const receipt = payment ?? defaultPayment;

  const formatCurrency = (amount: number = 0) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
          <Pressable
            style={styles.backButton}
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
              Fee Receipt
            </Text>

            <Text style={styles.pageSubtitle}>
              Payment confirmation
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="receipt-outline"
              size={22}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* School Header */}
          <View style={styles.schoolSection}>
            <View style={styles.schoolLogo}>
              <Text style={styles.schoolLogoText}>
                VL
              </Text>
            </View>

            <Text style={styles.schoolName}>
              Vertical Limits
            </Text>

            <Text style={styles.schoolSubtitle}>
              Coaching Portal
            </Text>
          </View>

          <View style={styles.receiptDivider} />

          {/* Receipt Title */}
          <View style={styles.receiptTitleSection}>
            <Text style={styles.receiptTitle}>
              PAYMENT RECEIPT
            </Text>

            <View style={styles.paidBadge}>
              <Ionicons
                name="checkmark-circle"
                size={13}
                color="#16A34A"
              />

              <Text style={styles.paidText}>
                {receipt.status ?? 'Paid'}
              </Text>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={styles.amountLabel}>
              AMOUNT PAID
            </Text>

            <Text style={styles.amount}>
              {formatCurrency(receipt.amount)}
            </Text>
          </View>

          {/* Receipt Details */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Receipt Number
              </Text>

              <Text style={styles.detailValue}>
                {receipt.receiptNumber}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Payment Date
              </Text>

              <Text style={styles.detailValue}>
                {receipt.date}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Fee Type
              </Text>

              <Text style={styles.detailValue}>
                {receipt.title}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Payment Method
              </Text>

              <Text style={styles.detailValue}>
                {receipt.method}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                Transaction ID
              </Text>

              <Text style={styles.detailValue}>
                {receipt.transactionId}
              </Text>
            </View>

            <View
              style={[
                styles.detailRow,
                styles.lastDetailRow,
              ]}
            >
              <Text style={styles.detailLabel}>
                Status
              </Text>

              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  Payment Successful
                </Text>
              </View>
            </View>
          </View>

          {/* Student Information */}
          <View style={styles.studentSection}>
            <Text style={styles.sectionHeading}>
              STUDENT INFORMATION
            </Text>

            <View style={styles.studentRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  AM
                </Text>
              </View>

              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  Aarav Mehta
                </Text>

                <Text style={styles.studentDetails}>
                  10th Standard • Student
                </Text>

                <Text style={styles.studentDetails}>
                  Student ID: VL-STU-1024
                </Text>
              </View>
            </View>
          </View>

          {/* Fee Note */}
          <View style={styles.noteBox}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#6630D7"
            />

            <Text style={styles.noteText}>
              This receipt confirms that the above fee
              amount has been successfully received.
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.receiptFooter}>
            <Text style={styles.footerText}>
              Thank you for your payment.
            </Text>

            <Text style={styles.footerSmall}>
              This is a digitally generated receipt.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back-outline"
              size={17}
              color="#6630D7"
            />

            <Text style={styles.secondaryButtonText}>
              Back
            </Text>
          </Pressable>

          <Pressable style={styles.primaryButton}>
            <Ionicons
              name="download-outline"
              size={17}
              color="#fff"
            />

            <Text style={styles.primaryButtonText}>
              Download Receipt
            </Text>
          </Pressable>
        </View>

        {/* Security */}
        <View style={styles.securityRow}>
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color="#16A34A"
          />

          <Text style={styles.securityText}>
            Receipt generated securely
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
    alignItems: 'center',
    marginBottom: 17,
  },

  backButton: {
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

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  receiptCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  schoolSection: {
    alignItems: 'center',
  },

  schoolLogo: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: '#6630D7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  schoolLogoText: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#fff',
  },

  schoolName: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#292532',
  },

  schoolSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    marginTop: 1,
  },

  receiptDivider: {
    height: 1,
    backgroundColor: '#ECE8F1',
    marginVertical: 15,
  },

  receiptTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  receiptTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#555',
    letterSpacing: 0.6,
  },

  paidBadge: {
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  paidText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#16A34A',
    marginLeft: 3,
  },

  amountSection: {
    alignItems: 'center',
    backgroundColor: '#F7F4FF',
    borderRadius: 15,
    paddingVertical: 16,
    marginTop: 13,
  },

  amountLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#8069B0',
    letterSpacing: 0.7,
  },

  amount: {
    fontFamily: 'PoppinsBold',
    fontSize: 29,
    color: '#6630D7',
    marginTop: 2,
  },

  detailsBox: {
    marginTop: 16,
    borderRadius: 13,
    backgroundColor: '#FAF9FC',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  detailRow: {
    minHeight: 39,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ECE9F0',
  },

  lastDetailRow: {
    borderBottomWidth: 0,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
  },

  detailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#444',
    maxWidth: '58%',
    textAlign: 'right',
  },

  statusBadge: {
    backgroundColor: '#EAFBF1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#16A34A',
  },

  studentSection: {
    marginTop: 18,
  },

  sectionHeading: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#999',
    letterSpacing: 0.7,
    marginBottom: 9,
  },

  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  avatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 12,
    color: '#6630D7',
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  studentDetails: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  noteBox: {
    backgroundColor: '#EEE7FF',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 17,
  },

  noteText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    lineHeight: 11,
    color: '#66558A',
    marginLeft: 7,
  },

  receiptFooter: {
    alignItems: 'center',
    marginTop: 18,
  },

  footerText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#666',
  },

  footerSmall: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#AAA',
    marginTop: 3,
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },

  secondaryButton: {
    width: 80,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  secondaryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#6630D7',
    marginLeft: 5,
  },

  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#6630D7',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  primaryButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#fff',
    marginLeft: 6,
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