import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { useAuth } from '../../../context/AuthContext';
import { getMyClasses } from '../../../services/classes';

export type FeeReceiptPayment = {
  id?: string;
  receiptNumber?: string;
  date?: string;
  title?: string;
  amount?: number;
  method?: string;
  status?: string;
  transactionId?: string;
  studentName?: string;
  studentId?: string;
  standard?: string;
  batchName?: string;
};

export type StudentReceiptInfo = {
  name?: string;
  studentId?: string;
  standard?: string;
  batchName?: string;
};

export type FeeReceiptProps = {
  payment?: FeeReceiptPayment | null;
  studentInfo?: StudentReceiptInfo;
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
};

const getInitials = (name: string): string => {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const generateReceiptHtml = (data: {
  receiptNumber: string;
  date: string;
  title: string;
  amount: number;
  method: string;
  transactionId: string;
  status: string;
  studentName: string;
  studentId: string;
  standard: string;
  batchName?: string;
}) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Fee Receipt - ${data.receiptNumber}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 24px;
      color: #1f2937;
      background-color: #ffffff;
    }
    .receipt-container {
      max-width: 660px;
      margin: 0 auto;
      border: 2px solid #6630D7;
      border-radius: 16px;
      padding: 32px;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #E5E7EB;
      padding-bottom: 20px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #6630D7;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #171827;
      margin: 0;
      letter-spacing: -0.3px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #6B7280;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .receipt-badge {
      text-align: right;
    }
    .receipt-tag {
      display: inline-block;
      background: #EDE9FE;
      color: #6630D7;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .receipt-status {
      margin-top: 6px;
      color: #16A34A;
      font-weight: 700;
      font-size: 13px;
    }
    .hero-amount {
      background: #F7F5FC;
      border: 1px dashed #6630D7;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      text-align: center;
    }
    .amount-label {
      font-size: 11px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .amount-value {
      font-size: 32px;
      font-weight: 800;
      color: #6630D7;
      margin: 6px 0 2px 0;
    }
    .amount-status {
      font-size: 12px;
      color: #16A34A;
      font-weight: 600;
    }
    .info-section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      border-bottom: 1px solid #F3F4F6;
      padding-bottom: 6px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      font-size: 13px;
      vertical-align: top;
    }
    .info-table .label {
      color: #6B7280;
      width: 40%;
    }
    .info-table .val {
      color: #111827;
      font-weight: 600;
      text-align: right;
      width: 60%;
    }
    .student-card {
      background: #F9FAFB;
      border-radius: 10px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .student-details h4 {
      margin: 0;
      font-size: 14px;
      color: #111827;
    }
    .student-details p {
      margin: 3px 0 0 0;
      font-size: 12px;
      color: #6B7280;
    }
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px dashed #D1D5DB;
      text-align: center;
    }
    .footer p {
      margin: 4px 0;
      font-size: 11px;
      color: #9CA3AF;
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <div class="header">
      <div class="brand-logo">
        <div class="logo-badge">VL</div>
        <div>
          <h1 class="brand-title">VERTICAL LIMITS</h1>
          <div class="brand-subtitle">Coaching Portal • Fee Receipt</div>
        </div>
      </div>
      <div class="receipt-badge">
        <span class="receipt-tag">Original Copy</span>
        <div class="receipt-status">✓ ${data.status}</div>
      </div>
    </div>

    <div class="hero-amount">
      <div class="amount-label">Total Amount Received</div>
      <div class="amount-value">₹${data.amount.toLocaleString('en-IN')}</div>
      <div class="amount-status">Payment Verified & Settled</div>
    </div>

    <div class="info-section">
      <div class="section-title">Student Information</div>
      <div class="student-card">
        <div class="student-details">
          <h4>${data.studentName}</h4>
          <p>${data.standard}${data.batchName ? ` • ${data.batchName}` : ''}</p>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; color: #6B7280;">Student ID</span>
          <div style="font-size: 13px; font-weight: 700; color: #6630D7;">${data.studentId}</div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="section-title">Payment & Transaction Details</div>
      <table class="info-table">
        <tr>
          <td class="label">Receipt Number</td>
          <td class="val">${data.receiptNumber}</td>
        </tr>
        <tr>
          <td class="label">Payment Date</td>
          <td class="val">${data.date}</td>
        </tr>
        <tr>
          <td class="label">Fee Particulars</td>
          <td class="val">${data.title}</td>
        </tr>
        <tr>
          <td class="label">Payment Mode</td>
          <td class="val">${data.method}</td>
        </tr>
        <tr>
          <td class="label">Transaction Reference ID</td>
          <td class="val" style="font-family: monospace;">${data.transactionId}</td>
        </tr>
        <tr>
          <td class="label">Payment Status</td>
          <td class="val" style="color: #16A34A;">${data.status}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p><strong>Vertical Limits Coaching Institute</strong></p>
      <p>Thank you for your payment. This is a computer-generated digital receipt and requires no physical signature.</p>
      <p style="font-size: 9px; margin-top: 8px;">Date Generated: ${new Date().toLocaleString('en-IN')}</p>
    </div>
  </div>
</body>
</html>`;
};

export default function FeeReceipt({
  payment,
  studentInfo,
  onContentScroll,
  onBack,
}: FeeReceiptProps) {
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const [classesBatch, setClassesBatch] = useState<{
    standard?: string;
    batchName?: string;
  } | null>(null);

  useEffect(() => {
    if (!studentInfo?.standard && !user?.standard) {
      getMyClasses()
        .then((res) => {
          if (res?.currentBatch) {
            setClassesBatch({
              standard: res.currentBatch.standard,
              batchName: res.currentBatch.name,
            });
          }
        })
        .catch(() => {});
    }
  }, [studentInfo, user]);

  const studentName =
    studentInfo?.name || payment?.studentName || user?.fullName || 'Student';

  const studentId =
    studentInfo?.studentId ||
    payment?.studentId ||
    user?.studentId ||
    (user?.id ? `VL-STU-${user.id.slice(-4).toUpperCase()}` : 'VL-STU-1024');

  const standard =
    studentInfo?.standard ||
    payment?.standard ||
    user?.standard ||
    classesBatch?.standard ||
    '10th Standard';

  const batchName =
    studentInfo?.batchName ||
    payment?.batchName ||
    user?.batchName ||
    classesBatch?.batchName ||
    '';

  const avatarInitials = getInitials(studentName);

  const formatCurrency = (amount: number = 0) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const handleDownloadReceipt = async () => {
    if (downloading || !payment) return;
    try {
      setDownloading(true);

      const html = generateReceiptHtml({
        receiptNumber:
          payment.receiptNumber ||
          `VL-REC-${Date.now().toString().slice(-6)}`,
        date:
          payment.date ||
          new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        title: payment.title || 'Fee Payment',
        amount: Number(payment.amount || 0),
        method: payment.method || 'Online',
        transactionId: payment.transactionId || `TXN${Date.now()}`,
        status: payment.status || 'Payment Successful',
        studentName,
        studentId,
        standard,
        batchName,
      });

      if (Platform.OS === 'web') {
        await Print.printAsync({ html });
      } else {
        const file = await Print.printToFileAsync({ html });
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(file.uri, {
            mimeType: 'application/pdf',
            dialogTitle: `Fee_Receipt_${payment.receiptNumber || 'Receipt'}.pdf`,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Receipt PDF Created',
            `Receipt saved to device: ${file.uri}`
          );
        }
      }
    } catch (err: any) {
      console.error('Download fee receipt error:', err);
      Alert.alert(
        'Receipt Error',
        err?.message || 'Unable to generate receipt PDF. Please try again.'
      );
    } finally {
      setDownloading(false);
    }
  };

  if (!payment) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          onScroll={onContentScroll}
          scrollEventThrottle={16}
        >
          <View
            style={[
              styles.receiptCard,
              { padding: 32, alignItems: 'center', justifyContent: 'center' },
            ]}
          >
            <Ionicons name="receipt-outline" size={44} color="#A3A3AD" />
            <Text
              style={{
                fontFamily: 'PoppinsBold',
                fontSize: 16,
                color: '#171827',
                marginTop: 12,
              }}
            >
              No Receipt Selected
            </Text>
            <Text
              style={{
                fontFamily: 'PoppinsRegular',
                fontSize: 11,
                color: '#777',
                textAlign: 'center',
                marginTop: 4,
              }}
            >
              Select a payment from Payment History to view its receipt.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const receipt = payment;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}

        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* School Header */}
          <View style={styles.schoolSection}>
            <View style={styles.schoolLogo}>
              <Image
                source={require('@/assets/images/android-icon-foreground.png')}
                style={styles.schoolLogoImage}
                resizeMode="contain"
              />
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
                  {avatarInitials}
                </Text>
              </View>

              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>
                  {studentName}
                </Text>

                <Text style={styles.studentDetails}>
                  {standard}{batchName ? ` • ${batchName}` : ' • Student'}
                </Text>

                <Text style={styles.studentDetails}>
                  Student ID: {studentId}
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

          <Pressable
            style={[styles.primaryButton, downloading && { opacity: 0.7 }]}
            onPress={handleDownloadReceipt}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name="download-outline"
                size={17}
                color="#fff"
              />
            )}

            <Text style={styles.primaryButtonText}>
              {downloading ? 'Downloading...' : 'Download Receipt'}
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
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#F0ECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  schoolLogoImage: {
    width: 46,
    height: 46,
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