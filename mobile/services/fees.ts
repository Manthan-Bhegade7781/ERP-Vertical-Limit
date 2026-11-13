import { API_BASE_URL } from '../config/api';
import { getToken } from './auth';

export type StudentPaymentRecord = {
  _id?: string;
  id?: string;
  amount: number;
  paymentDate: string;
  method: string;
  receiptNumber: string;
  reference?: string;
  remarks?: string;
  feeType?: string;
  feeRecordId?: string;
  studentName?: string;
  studentId?: string;
  standard?: string;
  batchName?: string;
};

export type StudentFeeRecord = {
  _id: string;
  studentId: string;
  batchId?: {
    _id: string;
    name: string;
    code: string;
    standard?: string;
  };
  branchId?: {
    _id: string;
    name: string;
    code?: string;
  };
  feeType: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  notes?: string;
  payments?: StudentPaymentRecord[];
  createdAt?: string;
};

export type StudentFeesSummary = {
  records: StudentFeeRecord[];
  totalFees: number;
  paidFees: number;
  pendingFees: number;
  paidPercentage: number;
  payments: StudentPaymentRecord[];
};

type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  count?: number;
  data?: T;
};

const getAuthHeaders = async () => {
  const token = await getToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const getMyFees = async (): Promise<StudentFeesSummary> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/fees/my`, {
    method: 'GET',
    headers,
  });

  const responseText = await response.text();
  let result: ApiEnvelope<StudentFeeRecord[]> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText) as ApiEnvelope<StudentFeeRecord[]>;
    } catch {
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 80)}`);
    }
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || 'Failed to fetch student fees');
  }

  const records = result.data || [];

  let totalFees = 0;
  let paidFees = 0;
  const allPayments: StudentPaymentRecord[] = [];

  for (const record of records) {
    totalFees += Number(record.totalAmount || 0);
    paidFees += Number(record.paidAmount || 0);

    if (Array.isArray(record.payments)) {
      for (const p of record.payments) {
        allPayments.push({
          ...p,
          feeType: record.feeType,
          feeRecordId: record._id,
          studentName: (record as any).studentInfo?.name,
          studentId: (record as any).studentInfo?.studentId,
          standard: record.batchId?.standard || (record as any).studentInfo?.standard,
          batchName: record.batchId?.name || (record as any).studentInfo?.batchName,
        });
      }
    }
  }

  // Sort payments newest first
  allPayments.sort(
    (a, b) =>
      new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
  );

  const pendingFees = Math.max(0, totalFees - paidFees);
  const paidPercentage =
    totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0;

  return {
    records,
    totalFees,
    paidFees,
    pendingFees,
    paidPercentage,
    payments: allPayments,
  };
};

export type PayFeeInput = {
  feeRecordId: string;
  amount: number;
  method?: string;
  reference?: string;
  remarks?: string;
};

export type PayFeeResult = {
  payment: StudentPaymentRecord;
  fee: StudentFeeRecord;
};

export const payStudentFee = async (
  input: PayFeeInput,
): Promise<PayFeeResult> => {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/fees/my/pay`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  const responseText = await response.text();
  let result: ApiEnvelope<PayFeeResult> = {};

  if (responseText.trim()) {
    try {
      result = JSON.parse(responseText) as ApiEnvelope<PayFeeResult>;
    } catch {
      throw new Error(`Invalid JSON response: ${responseText.slice(0, 80)}`);
    }
  }

  if (!response.ok || result.success === false || !result.data) {
    throw new Error(result.message || 'Failed to process fee payment');
  }

  return result.data;
};
