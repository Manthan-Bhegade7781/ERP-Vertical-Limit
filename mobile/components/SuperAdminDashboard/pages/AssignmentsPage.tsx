import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';
import {
  fetchAssignments,
  deleteAssignment as deleteAssignmentApi,
  updateAssignment,
  type AssignmentRecord,
} from '@/services/assignments';

type AssignmentStatus =
  | 'Active'
  | 'Upcoming'
  | 'Due Today'
  | 'Completed'
;

type SubmissionStatus =
  | 'Submitted'
  | 'Pending'
  | 'Late';

type Assignment = {
  id: string | number;
  title: string;
  code: string;
  course: string;
  chapter?: string;
  batch: string;
  branch: string;
  assignedDate: string;
  dueDate: string;
  dueTime: string;
  students: number;
  submitted: number;
  pending: number;
  late: number;
  maxMarks: number;
  description: string;
  instructions?: string;
  pdfUri?: string;
  pdfName?: string;
  hasAttachment?: boolean;
  status: AssignmentStatus;
  raw?: AssignmentRecord;
};

type StudentSubmission = {
  id: number;
  studentName: string;
  studentId: string;
  submissionDate: string;
  status: SubmissionStatus;
  marks: number | null;
  grade: string;
};

const initialAssignments: Assignment[] = [
  {
    id: 1,
    title: 'Chapter 1 - Electric Charges and Fields Assignment',
    code: 'PHY12-ASG-001',
    course: 'Physics',
    chapter: 'Electric Charges and Fields',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '01 Sep 2026',
    dueDate: '06 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 3,
    pending: 37,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 1: Electric Charges and Fields. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 2,
    title: 'Chapter 2 - Electrostatic Potential and Capacitance Assignment',
    code: 'PHY12-ASG-002',
    course: 'Physics',
    chapter: 'Electrostatic Potential and Capacitance',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '02 Sep 2026',
    dueDate: '07 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 6,
    pending: 34,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 2: Electrostatic Potential and Capacitance. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 3,
    title: 'Chapter 3 - Current Electricity Assignment',
    code: 'PHY12-ASG-003',
    course: 'Physics',
    chapter: 'Current Electricity',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '03 Sep 2026',
    dueDate: '08 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 3: Current Electricity. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 4,
    title: 'Chapter 4 - Moving Charges and Magnetism Assignment',
    code: 'PHY12-ASG-004',
    course: 'Physics',
    chapter: 'Moving Charges and Magnetism',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '04 Sep 2026',
    dueDate: '09 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 12,
    pending: 28,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 4: Moving Charges and Magnetism. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 5,
    title: 'Chapter 5 - Magnetism and Matter Assignment',
    code: 'PHY12-ASG-005',
    course: 'Physics',
    chapter: 'Magnetism and Matter',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '05 Sep 2026',
    dueDate: '10 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 15,
    pending: 25,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 5: Magnetism and Matter. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 6,
    title: 'Chapter 6 - Electromagnetic Induction Assignment',
    code: 'PHY12-ASG-006',
    course: 'Physics',
    chapter: 'Electromagnetic Induction',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '06 Sep 2026',
    dueDate: '11 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 18,
    pending: 22,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 6: Electromagnetic Induction. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 7,
    title: 'Chapter 7 - Alternating Current Assignment',
    code: 'PHY12-ASG-007',
    course: 'Physics',
    chapter: 'Alternating Current',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '07 Sep 2026',
    dueDate: '12 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 7: Alternating Current. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 8,
    title: 'Chapter 8 - Electromagnetic Waves Assignment',
    code: 'PHY12-ASG-008',
    course: 'Physics',
    chapter: 'Electromagnetic Waves',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '08 Sep 2026',
    dueDate: '13 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 24,
    pending: 16,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 8: Electromagnetic Waves. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 9,
    title: 'Chapter 9 - Ray Optics and Optical Instruments Assignment',
    code: 'PHY12-ASG-009',
    course: 'Physics',
    chapter: 'Ray Optics and Optical Instruments',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '09 Sep 2026',
    dueDate: '14 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 18,
    pending: 22,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 9: Ray Optics and Optical Instruments. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 10,
    title: 'Chapter 10 - Wave Optics Assignment',
    code: 'PHY12-ASG-010',
    course: 'Physics',
    chapter: 'Wave Optics',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '01 Oct 2026',
    dueDate: '06 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 0,
    pending: 40,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 10: Wave Optics. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 11,
    title: 'Chapter 11 - Dual Nature of Radiation and Matter Assignment',
    code: 'PHY12-ASG-011',
    course: 'Physics',
    chapter: 'Dual Nature of Radiation and Matter',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '02 Oct 2026',
    dueDate: '07 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 11: Dual Nature of Radiation and Matter. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 12,
    title: 'Chapter 12 - Atoms Assignment',
    code: 'PHY12-ASG-012',
    course: 'Physics',
    chapter: 'Atoms',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '03 Oct 2026',
    dueDate: '08 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 4,
    pending: 36,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 12: Atoms. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 13,
    title: 'Chapter 13 - Nuclei Assignment',
    code: 'PHY12-ASG-013',
    course: 'Physics',
    chapter: 'Nuclei',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '04 Oct 2026',
    dueDate: '09 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 6,
    pending: 34,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 13: Nuclei. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 14,
    title: 'Chapter 14 - Semiconductor Electronics Assignment',
    code: 'PHY12-ASG-014',
    course: 'Physics',
    chapter: 'Semiconductor Electronics',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '05 Oct 2026',
    dueDate: '10 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 8,
    pending: 32,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Physics assignment for Chapter 14: Semiconductor Electronics. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 15,
    title: 'Chapter 1 - Relations and Functions Assignment',
    code: 'MATH12-ASG-001',
    course: 'Mathematics',
    chapter: 'Relations and Functions',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '01 Sep 2026',
    dueDate: '06 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 3,
    pending: 37,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 1: Relations and Functions. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 16,
    title: 'Chapter 2 - Inverse Trigonometric Functions Assignment',
    code: 'MATH12-ASG-002',
    course: 'Mathematics',
    chapter: 'Inverse Trigonometric Functions',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '02 Sep 2026',
    dueDate: '07 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 6,
    pending: 34,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 2: Inverse Trigonometric Functions. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 17,
    title: 'Chapter 3 - Matrices Assignment',
    code: 'MATH12-ASG-003',
    course: 'Mathematics',
    chapter: 'Matrices',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '03 Sep 2026',
    dueDate: '08 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 3: Matrices. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 18,
    title: 'Chapter 4 - Determinants Assignment',
    code: 'MATH12-ASG-004',
    course: 'Mathematics',
    chapter: 'Determinants',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '04 Sep 2026',
    dueDate: '09 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 12,
    pending: 28,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 4: Determinants. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 19,
    title: 'Chapter 5 - Continuity and Differentiability Assignment',
    code: 'MATH12-ASG-005',
    course: 'Mathematics',
    chapter: 'Continuity and Differentiability',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '05 Sep 2026',
    dueDate: '10 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 15,
    pending: 25,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 5: Continuity and Differentiability. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 20,
    title: 'Chapter 6 - Application of Derivatives Assignment',
    code: 'MATH12-ASG-006',
    course: 'Mathematics',
    chapter: 'Application of Derivatives',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '06 Sep 2026',
    dueDate: '11 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 18,
    pending: 22,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 6: Application of Derivatives. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 21,
    title: 'Chapter 7 - Integrals Assignment',
    code: 'MATH12-ASG-007',
    course: 'Mathematics',
    chapter: 'Integrals',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '07 Sep 2026',
    dueDate: '12 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 7: Integrals. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 22,
    title: 'Chapter 8 - Application of Integrals Assignment',
    code: 'MATH12-ASG-008',
    course: 'Mathematics',
    chapter: 'Application of Integrals',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '08 Sep 2026',
    dueDate: '13 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 24,
    pending: 16,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 8: Application of Integrals. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 23,
    title: 'Chapter 9 - Differential Equations Assignment',
    code: 'MATH12-ASG-009',
    course: 'Mathematics',
    chapter: 'Differential Equations',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '09 Sep 2026',
    dueDate: '14 Sep 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 18,
    pending: 22,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 9: Differential Equations. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
  {
    id: 24,
    title: 'Chapter 10 - Vector Algebra Assignment',
    code: 'MATH12-ASG-010',
    course: 'Mathematics',
    chapter: 'Vector Algebra',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '01 Oct 2026',
    dueDate: '06 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 0,
    pending: 40,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 10: Vector Algebra. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 25,
    title: 'Chapter 11 - Three Dimensional Geometry Assignment',
    code: 'MATH12-ASG-011',
    course: 'Mathematics',
    chapter: 'Three Dimensional Geometry',
    batch: '12th Science - 2026',
    branch: 'Mumbai Branch',
    assignedDate: '02 Oct 2026',
    dueDate: '07 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 40,
    pending: 0,
    late: 2,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 11: Three Dimensional Geometry. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Completed',
  },
  {
    id: 26,
    title: 'Chapter 12 - Linear Programming Assignment',
    code: 'MATH12-ASG-012',
    course: 'Mathematics',
    chapter: 'Linear Programming',
    batch: '12th Science - 2026',
    branch: 'Main Branch',
    assignedDate: '03 Oct 2026',
    dueDate: '08 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 4,
    pending: 36,
    late: 0,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 12: Linear Programming. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Active',
  },
  {
    id: 27,
    title: 'Chapter 13 - Probability Assignment',
    code: 'MATH12-ASG-013',
    course: 'Mathematics',
    chapter: 'Probability',
    batch: '12th Science - 2026',
    branch: 'Pune Branch',
    assignedDate: '04 Oct 2026',
    dueDate: '09 Oct 2026',
    dueTime: '11:59 PM',
    students: 40,
    submitted: 6,
    pending: 34,
    late: 1,
    maxMarks: 100,
    description:
      'Complete the Mathematics assignment for Chapter 13: Probability. Cover the key concepts, important formulas or principles, solved examples, diagrams where applicable and practice questions.',
    instructions:
      'Prepare chapter notes, solve the assigned questions step by step and submit the completed work before the due date.',
    status: 'Upcoming',
  },
];

const submissions: Record<
  string,
  StudentSubmission[]
> = {
  'VLCC-ASG-001': [
    {
      id: 1,
      studentName: 'Kavya Mehta',
      studentId: 'VLCC-STU-001',
      submissionDate: '07 Sep 2026',
      status: 'Submitted',
      marks: 92,
      grade: 'A+',
    },
    {
      id: 2,
      studentName: 'Pooja Verma',
      studentId: 'VLCC-STU-002',
      submissionDate: '08 Sep 2026',
      status: 'Submitted',
      marks: 86,
      grade: 'A',
    },
    {
      id: 3,
      studentName: 'Sneha Deshmukh',
      studentId: 'VLCC-STU-003',
      submissionDate: '09 Sep 2026',
      status: 'Submitted',
      marks: 78,
      grade: 'B+',
    },
    {
      id: 4,
      studentName: 'Riya Kulkarni',
      studentId: 'VLCC-STU-004',
      submissionDate: '-',
      status: 'Pending',
      marks: null,
      grade: '-',
    },
    {
      id: 5,
      studentName: 'Ananya Patil',
      studentId: 'VLCC-STU-005',
      submissionDate: '10 Sep 2026',
      status: 'Late',
      marks: 72,
      grade: 'B',
    },
  ],

  'VLCC-ASG-002': [
    {
      id: 1,
      studentName: 'Aarav Sharma',
      studentId: 'VLCC-STU-006',
      submissionDate: '06 Sep 2026',
      status: 'Submitted',
      marks: 89,
      grade: 'A',
    },
    {
      id: 2,
      studentName: 'Neha Joshi',
      studentId: 'VLCC-STU-007',
      submissionDate: '07 Sep 2026',
      status: 'Submitted',
      marks: 84,
      grade: 'A',
    },
    {
      id: 3,
      studentName: 'Ishita Shah',
      studentId: 'VLCC-STU-008',
      submissionDate: '08 Sep 2026',
      status: 'Late',
      marks: 76,
      grade: 'B+',
    },
  ],
};

const statusColors: Record<
  AssignmentStatus,
  {
    bg: string;
    text: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Active: {
    bg: '#E7F8EF',
    text: '#35B878',
    icon: 'check-circle-outline',
  },

  Upcoming: {
    bg: '#F1EAFF',
    text: '#7040D5',
    icon: 'calendar-clock',
  },

  'Due Today': {
    bg: '#FFF1E2',
    text: '#F7941D',
    icon: 'clock-alert-outline',
  },

  Completed: {
    bg: '#EAF2FF',
    text: '#2675E8',
    icon: 'check-all',
  },

};

export default function AssignmentsPage() {
  const params = useLocalSearchParams<{
    newAssignment?: string;
    assignmentTitle?: string;
    assignmentCode?: string;
    assignmentStandard?: string;
    assignmentSubject?: string;
    assignmentBatch?: string;
    assignmentType?: string;
    assignmentAssignedDate?: string;
    assignmentSubmissionDate?: string;
    assignmentTotalMarks?: string;
    assignmentDescription?: string;
    assignmentInstructions?: string;
    assignmentPdfUri?: string;
    assignmentPdfName?: string;
    refreshAssignments?: string;
  }>();

  const processedAssignmentCode = useRef<string | null>(null);
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<
    'All' | AssignmentStatus
  >('All');

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState('');

  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);

  const [showActions, setShowActions] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [savingEdit, setSavingEdit] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editInstructions, setEditInstructions] = useState('');
  const [editAssignedDate, setEditAssignedDate] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editMarks, setEditMarks] = useState('');
  const [editPdfUri, setEditPdfUri] = useState<string | null>(null);
  const [editPdfName, setEditPdfName] = useState<string | null>(null);

  const [showSubmissionsModal, setShowSubmissionsModal] =
    useState(false);

  const [showEvaluationModal, setShowEvaluationModal] =
    useState(false);

  const [selectedStudent, setSelectedStudent] =
    useState<StudentSubmission | null>(null);

  const [marks, setMarks] = useState('');

  const [remarks, setRemarks] = useState('');

  const formatAssignmentDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getRelationName = (value: any, fallback = '-') =>
    typeof value === 'string' ? fallback : value?.name || value?.fullName || fallback;

  const mapAssignmentRecord = (item: AssignmentRecord): Assignment => {
    const batch: any = item.batchId;
    const subject: any = item.subjectId;
    const branch: any = item.branchId || batch?.branchId;
    const assigned = new Date(item.assignedDate);
    const due = new Date(item.submissionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignedDay = new Date(assigned);
    assignedDay.setHours(0, 0, 0, 0);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    const status: AssignmentStatus =
      assignedDay > today ? 'Upcoming' :
      dueDay.getTime() === today.getTime() ? 'Due Today' :
      dueDay < today ? 'Completed' : 'Active';

    return {
      id: item._id,
      title: item.assignmentTitle || 'Untitled assignment',
      code: item.assignmentCode || '-',
      course: getRelationName(subject, 'Subject'),
      batch: getRelationName(batch, 'Batch'),
      branch: getRelationName(branch, 'Branch'),
      assignedDate: formatAssignmentDate(item.assignedDate),
      dueDate: formatAssignmentDate(item.submissionDate),
      dueTime: '—',
      students: 0,
      submitted: 0,
      pending: 0,
      late: 0,
      maxMarks: Number(item.totalMarks) || 0,
      description: item.description || '',
      instructions: item.instructions || '',
      pdfName: item.attachment?.fileName || '',
      hasAttachment: Boolean(item.attachment?.fileName || item.attachment?.filePath),
      status,
      raw: item,
    };
  };

  const loadAssignments = async () => {
    try {
      setAssignmentsError('');
      setLoadingAssignments(true);
      const records = await fetchAssignments();
      setAssignments(records.map(mapAssignmentRecord));
    } catch (error) {
      setAssignmentsError(error instanceof Error ? error.message : 'Unable to load assignments.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    void loadAssignments();
  }, [params.refreshAssignments]);


  /* =====================================================
     FILTER
     ===================================================== */

  const filteredAssignments = useMemo(() => {
    const value = search.trim().toLowerCase();

    return assignments.filter((assignment) => {
      const matchesSearch =
        !value ||
        assignment.title
          .toLowerCase()
          .includes(value) ||
        assignment.code
          .toLowerCase()
          .includes(value) ||
        assignment.course
          .toLowerCase()
          .includes(value) ||
        (assignment.chapter || '')
          .toLowerCase()
          .includes(value) ||
        assignment.batch
          .toLowerCase()
          .includes(value) ||
        assignment.branch
          .toLowerCase()
          .includes(value);

      const matchesFilter =
        filter === 'All' ||
        assignment.status === filter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [search, filter, assignments]);

  /* =====================================================
     SUMMARY
     ===================================================== */

  const totalAssignments =
    assignments.length;

  const activeAssignments =
    assignments.filter(
      (item) => item.status === 'Active'
    ).length;

  const upcomingAssignments =
    assignments.filter(
      (item) => item.status === 'Upcoming'
    ).length;

  const dueToday =
    assignments.filter(
      (item) => item.status === 'Due Today'
    ).length;

  

  /* =====================================================
     ACTIONS
     ===================================================== */

  const openActions = (
    assignment: Assignment
  ) => {
    setSelectedAssignment(
      assignment
    );

    setShowActions(true);
  };

  const openView = (
    assignment: Assignment
  ) => {
    setSelectedAssignment(
      assignment
    );

    setShowActions(false);
    setShowViewModal(true);
  };

  const normalizeDate = (val?: string) => {
    if (!val) return undefined;
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    const dmyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return `${y}-${m}-${d}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
    return trimmed;
  };

  const handlePickEditPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const file = result.assets[0];
      setEditPdfUri(file.uri);
      setEditPdfName(file.name || 'Notes.pdf');
    } catch (error) {
      console.error('Pick PDF error:', error);
      Alert.alert('PDF Selection Error', 'Unable to pick PDF file.');
    }
  };

  const openEdit = (
    assignment: Assignment
  ) => {
    setSelectedAssignment(
      assignment
    );
    setEditTitle(assignment.title || '');
    setEditDescription(assignment.description || '');
    setEditInstructions(assignment.instructions || '');

    const rawAssigned = assignment.raw?.assignedDate;
    const rawDue = assignment.raw?.submissionDate;
    setEditAssignedDate(
      rawAssigned
        ? String(rawAssigned).slice(0, 10)
        : assignment.assignedDate && assignment.assignedDate !== '-'
          ? assignment.assignedDate
          : ''
    );
    setEditDueDate(
      rawDue
        ? String(rawDue).slice(0, 10)
        : assignment.dueDate && assignment.dueDate !== '-'
          ? assignment.dueDate
          : ''
    );
    setEditMarks(assignment.maxMarks ? String(assignment.maxMarks) : '');
    setEditPdfUri(null);
    setEditPdfName(null);

    setShowActions(false);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!selectedAssignment) return;
    if (!editTitle.trim()) {
      Alert.alert('Validation Error', 'Assignment title is required.');
      return;
    }

    const marksNum = Number(editMarks);
    if (!editMarks.trim() || !Number.isFinite(marksNum) || marksNum < 1) {
      Alert.alert('Validation Error', 'Enter valid total marks (minimum 1).');
      return;
    }

    try {
      setSavingEdit(true);

      const isMongoId =
        typeof selectedAssignment.id === 'string' &&
        /^[0-9a-fA-F]{24}$/.test(selectedAssignment.id);

      if (!isMongoId) {
        setAssignments((prev) =>
          prev.map((item) =>
            item.id === selectedAssignment.id
              ? {
                  ...item,
                  title: editTitle.trim(),
                  description: editDescription.trim(),
                  instructions: editInstructions.trim(),
                  maxMarks: marksNum,
                  assignedDate: editAssignedDate.trim() || item.assignedDate,
                  dueDate: editDueDate.trim() || item.dueDate,
                  ...(editPdfName ? { pdfName: editPdfName, hasAttachment: true } : {}),
                  ...(editPdfUri ? { pdfUri: editPdfUri } : {}),
                }
              : item
          )
        );
        setShowEditModal(false);
        Alert.alert('Updated', 'Assignment details have been updated successfully.');
        return;
      }

      const payload: any = {
        assignmentTitle: editTitle.trim(),
        description: editDescription.trim(),
        instructions: editInstructions.trim(),
        totalMarks: marksNum,
      };

      const normalizedAssigned = normalizeDate(editAssignedDate);
      if (normalizedAssigned) payload.assignedDate = normalizedAssigned;

      const normalizedDue = normalizeDate(editDueDate);
      if (normalizedDue) payload.submissionDate = normalizedDue;

      if (editPdfUri) {
        payload.file = {
          uri: editPdfUri,
          name: editPdfName || 'Notes.pdf',
          type: 'application/pdf',
        };
      }

      await updateAssignment(String(selectedAssignment.id), payload);

      setShowEditModal(false);
      await loadAssignments();
      Alert.alert('Updated', 'Assignment details have been updated successfully.');
    } catch (error: any) {
      console.error('Update assignment error:', error);
      Alert.alert('Update Failed', error?.message || 'Unable to update this assignment.');
    } finally {
      setSavingEdit(false);
    }
  };

  const openSubmissions = (
    assignment: Assignment
  ) => {
    setSelectedAssignment(
      assignment
    );

    setShowActions(false);
    setShowSubmissionsModal(true);
  };

  const openEvaluation = (
    assignment: Assignment
  ) => {
    setSelectedAssignment(
      assignment
    );

    setShowActions(false);
    setShowSubmissionsModal(true);
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const deleteAssignment = (assignment: Assignment) => {
    setShowActions(false);
    Alert.alert(
      'Delete Assignment',
      `Are you sure you want to delete "${assignment.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAssignmentApi(String(assignment.id));
              setAssignments((current) => current.filter((item) => String(item.id) !== String(assignment.id)));
              if (selectedAssignment && String(selectedAssignment.id) === String(assignment.id)) {
                setSelectedAssignment(null);
              }
              Alert.alert('Deleted', 'The assignment has been deleted successfully.');
            } catch (error) {
              Alert.alert('Delete failed', error instanceof Error ? error.message : 'Unable to delete assignment.');
            }
          },
        },
      ]
    );
  };

  /* =====================================================
     PDF HTML
     ===================================================== */

  const createAssignmentHtml = (
    assignment: Assignment
  ) => {
    const assignmentSubmissions =
      submissions[assignment.code] ?? [];

    const submitted =
      assignmentSubmissions.filter(
        (item) =>
          item.status ===
            'Submitted' ||
          item.status === 'Late'
      ).length;

    const pending =
      assignment.students -
      submitted;

    const late =
      assignmentSubmissions.filter(
        (item) =>
          item.status === 'Late'
      ).length;

    const submissionRate =
      assignment.students > 0
        ? (
            (submitted /
              assignment.students) *
            100
          ).toFixed(1)
        : '0';

    const submissionRows =
      assignmentSubmissions
        .map(
          (student, index) => `
            <tr>
              <td>${index + 1}</td>

              <td>
                <strong>
                  ${student.studentName}
                </strong>

                <br />

                <span class="student-id">
                  ${student.studentId}
                </span>
              </td>

              <td>
                ${student.submissionDate}
              </td>

              <td>
                <span class="${
                  student.status ===
                  'Submitted'
                    ? 'submitted'
                    : student.status ===
                      'Late'
                    ? 'late'
                    : 'pending'
                }">
                  ${student.status}
                </span>
              </td>

              <td>
                ${
                  student.marks !==
                  null
                    ? student.marks
                    : '-'
                }
              </td>

              <td>
                ${student.grade}
              </td>
            </tr>
          `
        )
        .join('');

    return `
      <!DOCTYPE html>

      <html>

        <head>

          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <style>

            body {
              font-family: Arial, sans-serif;
              padding: 30px;
              color: #172033;
            }

            .header {
              background: #7040D5;
              color: white;
              padding: 24px;
              border-radius: 12px;
              margin-bottom: 25px;
            }

            .brand {
              font-size: 13px;
              opacity: 0.85;
              margin-bottom: 6px;
            }

            h1 {
              margin: 0;
              font-size: 25px;
            }

            h2 {
              font-size: 18px;
              margin-top: 25px;
            }

            .details {
              border: 1px solid #e6e8ef;
              border-radius: 10px;
              padding: 18px;
              margin-bottom: 20px;
            }

            .detail {
              margin-bottom: 9px;
            }

            .label {
              color: #748096;
              font-size: 11px;
            }

            .value {
              font-size: 13px;
              font-weight: bold;
            }

            .description {
              background: #f7f8fc;
              border-radius: 10px;
              padding: 15px;
              margin-top: 12px;
              line-height: 1.5;
              font-size: 12px;
            }

            .summary {
              display: flex;
              gap: 10px;
              margin-bottom: 20px;
            }

            .summary-card {
              flex: 1;
              background: #f7f8fc;
              border-radius: 10px;
              padding: 15px;
              text-align: center;
            }

            .summary-value {
              font-size: 20px;
              font-weight: bold;
            }

            .summary-label {
              color: #748096;
              font-size: 10px;
              margin-top: 4px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 10px;
            }

            th {
              background: #f1eaff;
              color: #7040D5;
              padding: 10px;
              text-align: left;
            }

            td {
              border-bottom: 1px solid #eeeeee;
              padding: 10px;
            }

            .student-id {
              color: #748096;
              font-size: 8px;
            }

            .submitted {
              color: #35B878;
              font-weight: bold;
            }

            .late {
              color: #F7941D;
              font-weight: bold;
            }

            .pending {
              color: #E95386;
              font-weight: bold;
            }

            .footer {
              margin-top: 30px;
              text-align: center;
              color: #9aa3b2;
              font-size: 9px;
            }

          </style>

        </head>

        <body>

          <div class="header">

            <div class="brand">
              VLCC ERP PORTAL
            </div>

            <h1>
              Assignment Details
            </h1>

          </div>

          <div class="details">

            <div class="detail">

              <span class="label">
                Assignment
              </span>

              <br />

              <span class="value">
                ${assignment.title}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Assignment Code
              </span>

              <br />

              <span class="value">
                ${assignment.code}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Course
              </span>

              <br />

              <span class="value">
                ${assignment.course}
              </span>

            </div>

            ${
              assignment.chapter
                ? `
            <div class="detail">

              <span class="label">
                Chapter
              </span>

              <br />

              <span class="value">
                ${assignment.chapter}
              </span>

            </div>
              `
                : ''
            }

            <div class="detail">

              <span class="label">
                Batch
              </span>

              <br />

              <span class="value">
                ${assignment.batch}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Branch
              </span>

              <br />

              <span class="value">
                ${assignment.branch}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Assigned Date
              </span>

              <br />

              <span class="value">
                ${assignment.assignedDate}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Due Date
              </span>

              <br />

              <span class="value">
                ${assignment.dueDate}
                -
                ${assignment.dueTime}
              </span>

            </div>

            <div class="detail">

              <span class="label">
                Maximum Marks
              </span>

              <br />

              <span class="value">
                ${assignment.maxMarks}
              </span>

            </div>

            <div class="description">

              <strong>
                Assignment Description
              </strong>

              <br />

              ${assignment.description}

            </div>

          </div>

          <div class="summary">

            <div class="summary-card">

              <div class="summary-value">
                ${assignment.students}
              </div>

              <div class="summary-label">
                Students
              </div>

            </div>

            <div class="summary-card">

              <div class="summary-value">
                ${submitted}
              </div>

              <div class="summary-label">
                Submitted
              </div>

            </div>

            <div class="summary-card">

              <div class="summary-value">
                ${pending}
              </div>

              <div class="summary-label">
                Pending
              </div>

            </div>

            <div class="summary-card">

              <div class="summary-value">
                ${late}
              </div>

              <div class="summary-label">
                Late
              </div>

            </div>

            <div class="summary-card">

              <div class="summary-value">
                ${submissionRate}%
              </div>

              <div class="summary-label">
                Submission Rate
              </div>

            </div>

          </div>

          <h2>
            Student Submission Details
          </h2>

          ${
            assignmentSubmissions.length >
            0
              ? `
                <table>

                  <thead>

                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Submission Date</th>
                      <th>Status</th>
                      <th>Marks</th>
                      <th>Grade</th>
                    </tr>

                  </thead>

                  <tbody>
                    ${submissionRows}
                  </tbody>

                </table>
              `
              : `
                <p>
                  No student submission data is currently available.
                </p>
              `
          }

          <div class="footer">
            Generated by VLCC ERP Portal
          </div>

        </body>

      </html>
    `;
  };

  const shareLocalNotesPdf = async (assignment: Assignment) => {
    try {
      if (assignment.pdfUri && !assignment.pdfUri.startsWith('http')) {
        const available = await Sharing.isAvailableAsync();
        if (!available) {
          Alert.alert('Sharing Unavailable', 'PDF sharing is not available on this device.');
          return;
        }
        await Sharing.shareAsync(assignment.pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: `${assignment.title} - Notes PDF`,
          UTI: 'com.adobe.pdf',
        });
        return;
      }

      if (!assignment.hasAttachment && !assignment.pdfName && !assignment.pdfUri) {
        Alert.alert('PDF Not Found', 'No notes PDF is attached to this assignment.');
        return;
      }

      const url = `${API_BASE_URL}/assignments/${encodeURIComponent(String(assignment.id))}/attachment`;
      const token = await getToken();
      const rawName = assignment.pdfName || `${assignment.code || 'assignment'}.pdf`;
      const filename = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destination = `${FileSystem.cacheDirectory || ''}${filename.endsWith('.pdf') ? filename : `${filename}.pdf`}`;

      const result = await FileSystem.downloadAsync(url, destination, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (result.status < 200 || result.status >= 300) {
        throw new Error(`PDF download failed (${result.status}).`);
      }

      const available = await Sharing.isAvailableAsync();
      if (available) {
        await Sharing.shareAsync(result.uri, {
          mimeType: 'application/pdf',
          dialogTitle: `${assignment.title} - Notes PDF`,
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('PDF Downloaded', `Saved temporarily to: ${result.uri}`);
      }
    } catch (error: any) {
      console.error('Local notes PDF sharing error:', error);
      Alert.alert('PDF Unavailable', error?.message || 'Unable to open the selected notes PDF.');
    }
  };

  /* =====================================================
     DOWNLOAD PDF
     ===================================================== */

  const downloadAssignmentPDF = async (
    assignment: Assignment
  ) => {
    try {
      const { uri } =
        await Print.printToFileAsync({
          html:
            createAssignmentHtml(
              assignment
            ),
        });

      const available =
        await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          'PDF Generated',
          'The assignment PDF was generated successfully.'
        );

        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle:
          `${assignment.title} - Assignment PDF`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error(
        'Assignment PDF error:',
        error
      );

      Alert.alert(
        'PDF Error',
        'Unable to generate the assignment PDF.'
      );
    }
  };

  /* =====================================================
     STAT CARD
     ===================================================== */

  const renderSummaryCard = (
    title: string,
    value: number,
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    type:
      | 'purple'
      | 'blue'
      | 'green'
      | 'orange'
      | 'pink'
  ) => {
    const backgrounds = {
      purple: '#F1EAFF',
      blue: '#EAF2FF',
      green: '#E7F8EF',
      orange: '#FFF1E2',
      pink: '#FFE9F0',
    };

    const icons = {
      purple: '#7040D5',
      blue: '#2675E8',
      green: '#35B878',
      orange: '#F7941D',
      pink: '#E95386',
    };

    return (
      <View
        style={[
          styles.summaryCard,
          {
            width: isDesktop
              ? '31.8%'
              : '48%',
          },
        ]}
      >
        <View
          style={[
            styles.summaryIcon,
            {
              backgroundColor:
                backgrounds[type],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={21}
            color={icons[type]}
          />
        </View>

        <Text style={styles.summaryValue}>
          {value}
        </Text>

        <Text style={styles.summaryLabel}>
          {title}
        </Text>
      </View>
    );
  };

  /* =====================================================
     ASSIGNMENT CARD
     ===================================================== */

  const renderAssignmentCard = (
    assignment: Assignment
  ) => {
    const status =
      statusColors[
        assignment.status
      ];



    return (
      <View
        key={assignment.id}
        style={[
          styles.assignmentCard,
          {
            width: isDesktop
              ? '48.9%'
              : '100%',
          },
        ]}
      >
        <View
          style={styles.assignmentTop}
        >
          <View
            style={styles.assignmentIcon}
          >
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={24}
              color="#7040D5"
            />
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() =>
              openActions(
                assignment
              )
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={21}
              color="#748096"
            />
          </TouchableOpacity>
        </View>

        <Text
          style={styles.assignmentTitle}
          numberOfLines={2}
        >
          {assignment.title}
        </Text>

        <Text
          style={styles.assignmentCode}
        >
          {assignment.code}
        </Text>

        {assignment.pdfUri || assignment.hasAttachment || assignment.pdfName ? (
          <View style={styles.notesPdfCard}>
            <View style={styles.notesPdfIcon}>
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={20}
                color="#D84343"
              />
            </View>

            <View style={styles.notesPdfContent}>
              <Text style={styles.notesPdfLabel}>Notes PDF</Text>
              <Text
                style={styles.notesPdfName}
                numberOfLines={1}
              >
                {assignment.pdfName || 'Attached PDF'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.notesPdfShareButton}
              onPress={() => shareLocalNotesPdf(assignment)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="share-variant-outline"
                size={17}
                color="#7040D5"
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="book-open-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {assignment.course}
          </Text>
        </View>

        {assignment.chapter ? (
          <View style={styles.infoRow}>
            <MaterialCommunityIcons
              name="book-education-outline"
              size={15}
              color="#748096"
            />

            <Text
              style={styles.infoText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {assignment.chapter}
            </Text>
          </View>
        ) : null}

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {assignment.batch}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {assignment.branch}
          </Text>
        </View>

        <View
          style={styles.dateRow}
        >
          <View
            style={styles.dateItem}
          >
            <MaterialCommunityIcons
              name="calendar-arrow-right"
              size={15}
              color="#7040D5"
            />

            <Text
              style={styles.dateText}
            >
              {assignment.assignedDate}
            </Text>
          </View>

          <View
            style={styles.dateItem}
          >
            <MaterialCommunityIcons
              name="calendar-alert"
              size={15}
              color="#E95386"
            />

            <Text
              style={styles.dateText}
            >
              {assignment.dueDate}
            </Text>
          </View>
        </View>

        <View
          style={styles.assignmentBottom}
        >
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  status.bg,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={status.icon}
              size={13}
              color={status.text}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color: status.text,
                },
              ]}
            >
              {assignment.status}
            </Text>
          </View>

          <Text
            style={styles.studentCount}
          >
            {assignment.maxMarks > 0 ? `${assignment.maxMarks} Marks` : 'Assignment'}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.downloadSmallButton
          }
          onPress={() =>
            downloadAssignmentPDF(
              assignment
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
              styles.downloadSmallText
            }
          >
            Download Assignment PDF
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  /* =====================================================
     SUBMISSIONS
     ===================================================== */

  const assignmentSubmissions =
    selectedAssignment
      ? submissions[
          selectedAssignment.code
        ] ?? []
      : [];

  const submittedCount =
    assignmentSubmissions.filter(
      (item) =>
        item.status ===
          'Submitted' ||
        item.status === 'Late'
    ).length;

  const pendingCount =
    selectedAssignment
      ? Math.max(
          selectedAssignment.students -
            submittedCount,
          0
        )
      : 0;

  const lateCount =
    assignmentSubmissions.filter(
      (item) =>
        item.status === 'Late'
    ).length;

  /* =====================================================
     EVALUATION
     ===================================================== */

  const openStudentEvaluation = (
    student: StudentSubmission
  ) => {
    setSelectedStudent(student);

    setMarks(
      student.marks !== null
        ? String(student.marks)
        : ''
    );

    setRemarks('');

    setShowEvaluationModal(true);
  };

  const saveEvaluation = () => {
    if (!selectedStudent) {
      return;
    }

    if (!marks.trim()) {
      Alert.alert(
        'Marks Required',
        'Please enter marks before saving.'
      );

      return;
    }

    const numericMarks =
      Number(marks);

    if (
      Number.isNaN(numericMarks) ||
      numericMarks < 0 ||
      numericMarks > 100
    ) {
      Alert.alert(
        'Invalid Marks',
        'Marks must be between 0 and 100.'
      );

      return;
    }

    setShowEvaluationModal(
      false
    );

    Alert.alert(
      'Evaluation Saved',
      `Evaluation saved for ${selectedStudent.studentName}.`
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
        },
      ]}
    >
      {/* =====================================================
          HEADER
          ===================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={22}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <View
          style={styles.headerTextContainer}
        >
          <Text
            style={styles.headerTitle}
          >
            Assignments
          </Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.push({
              pathname: '/(super_admin)/explore',
              params: { feature: 'Add Assignment' },
            });
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons
            name="plus"
            size={17}
            color="#7040D5"
          />

          <Text
            style={styles.addButtonText}
            numberOfLines={1}
          >
            Add Assignment
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              insets.bottom + 30,
          },
        ]}
      >
        {/* =====================================================
            TITLE
            ===================================================== */}

        <Text
          style={styles.managementTitle}
        >
          Assignment Management
        </Text>

        <Text
          style={styles.managementSubtitle}
        >
          Create, organize and manage assignments and homework.
        </Text>

        {/* =====================================================
            SUMMARY
            ===================================================== */}

        <View
          style={styles.summaryGrid}
        >
          {renderSummaryCard(
            'Total Assignments',
            totalAssignments,
            'clipboard-text-multiple-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Active',
            activeAssignments,
            'clipboard-check-outline',
            'green'
          )}

          {renderSummaryCard(
            'Upcoming',
            upcomingAssignments,
            'calendar-clock',
            'blue'
          )}

          {renderSummaryCard(
            'Due Today',
            dueToday,
            'clock-alert-outline',
            'orange'
          )}

        </View>

        {/* =====================================================
            SEARCH
            ===================================================== */}

        <View
          style={styles.searchContainer}
        >
          <View
            style={styles.searchBox}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#9AA3B2"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search assignment, subject, chapter, batch or branch..."
              placeholderTextColor="#A0A8B5"
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() =>
                  setSearch('')
                }
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#9AA3B2"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* =====================================================
            FILTERS
            ===================================================== */}

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
            'Active',
            'Upcoming',
            'Due Today',
            'Completed',
          ].map((item) => {
            const active =
              filter === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,
                  active &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilter(
                    item as
                      | 'All'
                      | AssignmentStatus
                  )
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    active &&
                      styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* =====================================================
            LIST
            ===================================================== */}

        {loadingAssignments ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Loading assignments...</Text>
          </View>
        ) : assignmentsError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Could not load assignments</Text>
            <Text style={styles.emptySubtitle}>{assignmentsError}</Text>
            <TouchableOpacity onPress={() => void loadAssignments()} style={styles.addButton}>
              <Text style={styles.addButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredAssignments.length ===
        0 ? (
          <View
            style={styles.emptyState}
          >
            <MaterialCommunityIcons
              name="clipboard-search-outline"
              size={48}
              color="#B1B8C5"
            />

            <Text
              style={styles.emptyTitle}
            >
              No assignments found
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          <View
            style={styles.assignmentGrid}
          >
            {filteredAssignments.map(
              renderAssignmentCard
            )}
          </View>
        )}
      </ScrollView>

      {/* =====================================================
          ACTION MODAL
          ===================================================== */}

      <Modal
        visible={showActions}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowActions(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setShowActions(false)
          }
        >
          <Pressable
            style={styles.actionModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View
              style={styles.modalHandle}
            />

            <Text
              style={styles.modalTitle}
            >
              Assignment Actions
            </Text>

            <Text
              style={styles.modalSubtitle}
              numberOfLines={2}
            >
              {selectedAssignment?.title}
            </Text>

            {/* VIEW */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (
                  selectedAssignment
                ) {
                  openView(
                    selectedAssignment
                  );
                }
              }}
            >
              <View
                style={styles.actionIcon}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <Text
                style={styles.actionText}
              >
                View Assignment
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A8B5"
              />
            </TouchableOpacity>

            {/* EDIT */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (
                  selectedAssignment
                ) {
                  openEdit(
                    selectedAssignment
                  );
                }
              }}
            >
              <View
                style={styles.actionIcon}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <Text
                style={styles.actionText}
              >
                Edit Assignment
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A8B5"
              />
            </TouchableOpacity>

            {/* DOWNLOAD PDF */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (
                  selectedAssignment
                ) {
                  setShowActions(
                    false
                  );

                  downloadAssignmentPDF(
                    selectedAssignment
                  );
                }
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      '#F1EAFF',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <Text
                style={styles.actionText}
              >
                Download Assignment PDF
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A8B5"
              />
            </TouchableOpacity>

            {/* DELETE */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (
                  selectedAssignment
                ) {
                  deleteAssignment(
                    selectedAssignment
                  );
                }
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      '#FFE9F0',
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
                    color: '#E95386',
                  },
                ]}
              >
                Delete Assignment
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A8B5"
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          VIEW ASSIGNMENT
          ===================================================== */}

      <Modal
        visible={showViewModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowViewModal(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.largeModal,
              {
                maxHeight: '90%',
                width: isDesktop
                  ? 650
                  : '94%',
              },
            ]}
          >
            <View
              style={styles.modalHeader}
            >
              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={styles.modalTitle}
                >
                  Assignment Details
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  {
                    selectedAssignment?.code
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowViewModal(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#748096"
                />
              </TouchableOpacity>
            </View>

            {selectedAssignment && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.viewAssignmentHeader
                  }
                >
                  <View
                    style={
                      styles.viewAssignmentIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="clipboard-text-outline"
                      size={27}
                      color="#7040D5"
                    />
                  </View>

                  <View
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={
                        styles.detailTitle
                      }
                    >
                      {
                        selectedAssignment.title
                      }
                    </Text>

                    <Text
                      style={
                        styles.assignmentCode
                      }
                    >
                      {
                        selectedAssignment.code
                      }
                    </Text>
                  </View>
                </View>

                <View
                  style={
                    styles.detailGrid
                  }
                >
                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Course
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.course
                      }
                    </Text>
                  </View>

                  {selectedAssignment.chapter ? (
                    <View
                      style={
                        styles.detailBox
                      }
                    >
                      <Text
                        style={
                          styles.detailLabel
                        }
                      >
                        Chapter
                      </Text>

                      <Text
                        style={
                          styles.detailValue
                        }
                        numberOfLines={2}
                      >
                        {
                          selectedAssignment.chapter
                        }
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Batch
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.batch
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Branch
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.branch
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Maximum Marks
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.maxMarks
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Assigned Date
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.assignedDate
                      }
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailBox
                    }
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Due Date
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {
                        selectedAssignment.dueDate
                      }
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.descriptionTitle
                  }
                >
                  Assignment Description
                </Text>

                <View
                  style={
                    styles.descriptionBox
                  }
                >
                  <Text
                    style={
                      styles.descriptionText
                    }
                  >
                    {
                      selectedAssignment.description
                    }
                  </Text>
                </View>

                {/* DOWNLOAD BUTTON */}
                <TouchableOpacity
                  style={
                    styles.downloadResultButton
                  }
                  onPress={() =>
                    downloadAssignmentPDF(
                      selectedAssignment
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={21}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.downloadResultButtonText
                    }
                  >
                    Download Assignment PDF
                  </Text>
                </TouchableOpacity>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =====================================================
          EDIT MODAL
          ===================================================== */}

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowEditModal(false)
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.largeModal,
              {
                width: isDesktop
                  ? 600
                  : '94%',
              },
            ]}
          >
            <View
              style={styles.modalHeader}
            >
              <View>
                <Text
                  style={styles.modalTitle}
                >
                  Edit Assignment
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Update assignment information
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowEditModal(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color="#748096"
                />
              </TouchableOpacity>
            </View>

            {selectedAssignment && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <Text style={styles.inputLabel}>Assignment Title *</Text>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  style={styles.input}
                  placeholder="Assignment title"
                  placeholderTextColor="#A0A8B5"
                />

                <View style={styles.twoInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Course</Text>
                    <View style={[styles.input, styles.readOnlyInput]}>
                      <Text style={styles.readOnlyText} numberOfLines={1}>
                        {selectedAssignment.course}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Batch</Text>
                    <View style={[styles.input, styles.readOnlyInput]}>
                      <Text style={styles.readOnlyText} numberOfLines={1}>
                        {selectedAssignment.batch}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    {
                      minHeight: 80,
                      paddingTop: 11,
                    },
                  ]}
                  placeholder="Description"
                  placeholderTextColor="#A0A8B5"
                />

                <Text style={styles.inputLabel}>Instructions</Text>
                <TextInput
                  value={editInstructions}
                  onChangeText={setEditInstructions}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    {
                      minHeight: 70,
                      paddingTop: 11,
                    },
                  ]}
                  placeholder="Instructions for students"
                  placeholderTextColor="#A0A8B5"
                />

                <View style={styles.twoInputs}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Assigned Date (YYYY-MM-DD)</Text>
                    <TextInput
                      value={editAssignedDate}
                      onChangeText={setEditAssignedDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#A0A8B5"
                      style={styles.input}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Due Date (YYYY-MM-DD)</Text>
                    <TextInput
                      value={editDueDate}
                      onChangeText={setEditDueDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#A0A8B5"
                      style={styles.input}
                    />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Maximum Marks *</Text>
                <TextInput
                  value={editMarks}
                  onChangeText={setEditMarks}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor="#A0A8B5"
                  style={styles.input}
                />

                <Text style={styles.inputLabel}>Notes PDF Attachment</Text>
                <View style={styles.attachmentEditRow}>
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={22}
                    color="#D84343"
                  />
                  <Text style={styles.attachmentEditText} numberOfLines={1}>
                    {editPdfName || (selectedAssignment.pdfName ? selectedAssignment.pdfName : 'No PDF attached')}
                  </Text>
                  <TouchableOpacity
                    style={styles.pickPdfBtn}
                    onPress={handlePickEditPdf}
                  >
                    <Text style={styles.pickPdfBtnText}>
                      {editPdfName || selectedAssignment.pdfName ? 'Replace' : 'Attach PDF'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    savingEdit && { opacity: 0.7 },
                  ]}
                  disabled={savingEdit}
                  onPress={() => void saveEdit()}
                >
                  {savingEdit ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      Save Changes
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     MAIN
     ===================================================== */

  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  /* =====================================================
     HEADER
     ===================================================== */

  header: {
    minHeight: 72,
    backgroundColor: '#7040D5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 7,
    justifyContent: 'center',
  },

  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#FFFFFF',
  },

  addButton: {
    minHeight: 34,
    width: 126,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    paddingHorizontal: 9,
    marginLeft: 8,
  },

  addButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
    flexShrink: 1,
  },

  /* =====================================================
     CONTENT
     ===================================================== */

  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  managementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
  },

  managementSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#748096',
    marginTop: 3,
    marginBottom: 17,
  },

  /* =====================================================
     SUMMARY
     ===================================================== */

  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },

  summaryCard: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 13,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 2,
  },

  summaryIcon: {
    width: 39,
    height: 39,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    color: '#172033',
    marginTop: 7,
  },

  summaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#748096',
    marginTop: 1,
  },

  /* =====================================================
     SEARCH
     ===================================================== */

  searchContainer: {
    marginTop: 18,
  },

  searchBox: {
    minHeight: 45,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 11,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 8,
  },

  /* =====================================================
     FILTER
     ===================================================== */

  filterContainer: {
    paddingVertical: 14,
    gap: 8,
  },

  filterButton: {
    paddingHorizontal: 14,
    minHeight: 34,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#748096',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  /* =====================================================
     ASSIGNMENT CARD
     ===================================================== */

  assignmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    justifyContent: 'space-between',
  },

  notesPdfCard: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#E8E0F7',
    borderRadius: 10,
    backgroundColor: '#F9F6FE',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    marginTop: 9,
    marginBottom: 7,
  },

  notesPdfIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FDEDED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  notesPdfContent: {
    flex: 1,
    minWidth: 0,
  },

  notesPdfLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
  },

  notesPdfName: {
    marginTop: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#626675',
  },

  notesPdfShareButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2D8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 7,
  },

  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  assignmentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  assignmentIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  assignmentTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#172033',
    marginTop: 12,
  },

  assignmentCode: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#7040D5',
    marginTop: 2,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  infoText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#748096',
    marginLeft: 7,
  },

  dateRow: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.8,
    color: '#566176',
    marginLeft: 5,
  },

  progressSection: {
    marginTop: 13,
  },

  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  progressLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.8,
    color: '#748096',
  },

  progressPercentage: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#7040D5',
  },

  progressTrack: {
    height: 6,
    borderRadius: 5,
    backgroundColor: '#ECEEF3',
    marginTop: 6,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#7040D5',
    borderRadius: 5,
  },

  assignmentBottom: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.8,
    marginLeft: 4,
  },

  studentCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#748096',
  },

  downloadSmallButton: {
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  downloadSmallText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.3,
    color: '#7040D5',
    marginLeft: 5,
  },

  /* =====================================================
     EMPTY
     ===================================================== */

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    borderWidth: 1,
    borderColor: '#EEF0F5',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#172033',
    marginTop: 12,
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#748096',
    marginTop: 3,
  },

  /* =====================================================
     MODALS
     ===================================================== */

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(20, 24, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },

  actionModal: {
    width: '94%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  modalHandle: {
    width: 35,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D9DDE5',
    alignSelf: 'center',
    marginBottom: 14,
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
    fontSize: 9,
    color: '#748096',
    marginTop: 2,
  },

  actionItem: {
    minHeight: 54,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#172033',
    marginLeft: 11,
  },

  largeModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 19,
  },

  detailTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#172033',
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 15,
  },

  detailBox: {
    width: '48%',
    minHeight: 70,
    backgroundColor: '#F7F8FC',
    borderRadius: 11,
    padding: 11,
  },

  detailLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#748096',
  },

  detailValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
    marginTop: 5,
  },

  viewAssignmentHeader: {
    backgroundColor: '#F7F4FF',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAssignmentIcon: {
    width: 49,
    height: 49,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  descriptionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
    marginTop: 18,
    marginBottom: 8,
  },

  descriptionBox: {
    backgroundColor: '#F7F8FC',
    borderRadius: 11,
    padding: 13,
  },

  descriptionText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 16,
    color: '#566176',
  },

  submissionOverview: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },

  overviewItem: {
    flex: 1,
    minHeight: 68,
    borderRadius: 10,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  overviewLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#748096',
    marginTop: 2,
  },

  downloadResultButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 16,
  },

  downloadResultButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#FFFFFF',
    marginLeft: 6,
  },

  viewSubmissionsButton: {
    height: 43,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },

  viewSubmissionsButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 6,
  },

  /* =====================================================
     EDIT
     ===================================================== */

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#566176',
    marginBottom: 5,
    marginTop: 8,
  },

  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 11,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#172033',
  },

  twoInputs: {
    flexDirection: 'row',
    gap: 10,
  },

  readOnlyInput: {
    backgroundColor: '#F4F5F8',
    justifyContent: 'center',
  },

  readOnlyText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#687282',
  },

  attachmentEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E3E6ED',
    borderRadius: 10,
    paddingHorizontal: 11,
    minHeight: 43,
    gap: 8,
    backgroundColor: '#FAFBFD',
  },

  attachmentEditText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#172033',
  },

  pickPdfBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#EFEAFF',
  },

  pickPdfBtnText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  saveButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },

  /* =====================================================
     SUBMISSIONS
     ===================================================== */

  resultsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  resultSummaryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
    marginBottom: 12,
  },

  resultSummaryCard: {
    flex: 1,
    minHeight: 68,
    borderRadius: 11,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultSummaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  resultSummaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#748096',
    marginTop: 2,
  },

  submissionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 12,
    padding: 11,
    marginBottom: 9,
  },

  submissionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  studentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  studentAvatarText: {
    fontFamily: 'PoppinsBold',
    fontSize: 12,
    color: '#7040D5',
  },

  studentInfo: {
    flex: 1,
    marginLeft: 9,
  },

  studentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
  },

  studentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8B94A5',
    marginTop: 1,
  },

  submissionStatus: {
    minWidth: 56,
    height: 25,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  submissionStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  submissionBottom: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  submissionDetail: {
    flex: 1,
  },

  submissionLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8B94A5',
  },

  submissionValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#172033',
    marginTop: 2,
  },

  evaluateButton: {
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7040D5',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  evaluateButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
    color: '#FFFFFF',
    marginLeft: 4,
  },

  noSubmissionState: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  noSubmissionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
    marginTop: 10,
  },

  noSubmissionText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#748096',
    textAlign: 'center',
    marginTop: 4,
  },

  /* =====================================================
     EVALUATION
     ===================================================== */

  evaluationModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 19,
  },
});
