import React, { useMemo, useState } from 'react';

import {
  Alert,
  Linking,
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
import { router } from 'expo-router';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import Svg, { Circle } from 'react-native-svg';

type ExaminationStatus =
  | 'Upcoming'
  | 'Ongoing'
  | 'Completed'
  | 'Results Published';

type Examination = {
  id: number;
  name: string;
  code: string;
  course: string;
  batch: string;
  branch: string;
  date: string;
  time: string;
  duration: string;
  students: number;
  status: ExaminationStatus;
};

type ResultStudent = {
  id: number;
  studentName: string;
  studentId: string;
  theory: number;
  practical: number;
  total: number;
  percentage: number;
  result: 'Pass' | 'Fail';
};

const examinations: Examination[] = [
  { id: 1, name: 'JEE Full Syllabus Mock Test - 01', code: 'VLCC-EXM-001', course: 'JEE Main & Advanced Preparation', batch: '12th JEE - Morning', branch: 'Pune Branch', date: '15 Sep 2026', time: '09:00 AM', duration: '3 Hours', students: 72, status: 'Upcoming' },
  { id: 2, name: 'NEET Full Syllabus Mock Test - 01', code: 'VLCC-EXM-002', course: 'NEET Preparation', batch: '12th NEET - Morning', branch: 'Mumbai Branch', date: '18 Sep 2026', time: '09:00 AM', duration: '3 Hours 20 Min', students: 68, status: 'Upcoming' },
  { id: 3, name: 'MHT-CET PCM Mock Test - 02', code: 'VLCC-EXM-003', course: 'MHT-CET PCM Preparation', batch: '11th MHT-CET - Evening', branch: 'Pune Branch', date: '20 Sep 2026', time: '02:00 PM', duration: '3 Hours', students: 64, status: 'Upcoming' },
  { id: 4, name: 'Class 10 Science Unit Test', code: 'VLCC-EXM-004', course: 'Foundation - Classes 8 to 10', batch: '10th Foundation - Afternoon', branch: 'Nashik Branch', date: '12 Sep 2026', time: '03:00 PM', duration: '2 Hours', students: 58, status: 'Ongoing' },
  { id: 5, name: 'Class 9 Mathematics Unit Test', code: 'VLCC-EXM-005', course: 'Foundation - Classes 8 to 10', batch: '9th Foundation - Evening', branch: 'Nagpur Branch', date: '05 Sep 2026', time: '06:00 PM', duration: '90 Minutes', students: 52, status: 'Completed' },
  { id: 6, name: 'Class 8 Foundation Assessment', code: 'VLCC-EXM-006', course: 'Foundation - Classes 8 to 10', batch: '8th Foundation - Evening', branch: 'Main Branch', date: '02 Sep 2026', time: '05:30 PM', duration: '90 Minutes', students: 48, status: 'Results Published' },
];

const publishedResults: Record<string, ResultStudent[]> = {
  'VLCC-EXM-005': [
    {
      id: 1,
      studentName: 'Kavya Mehta',
      studentId: 'VLCC-STU-001',
      theory: 82,
      practical: 88,
      total: 170,
      percentage: 85,
      result: 'Pass',
    },
    {
      id: 2,
      studentName: 'Pooja Verma',
      studentId: 'VLCC-STU-002',
      theory: 76,
      practical: 84,
      total: 160,
      percentage: 80,
      result: 'Pass',
    },
    {
      id: 3,
      studentName: 'Sneha Deshmukh',
      studentId: 'VLCC-STU-003',
      theory: 71,
      practical: 79,
      total: 150,
      percentage: 75,
      result: 'Pass',
    },
    {
      id: 4,
      studentName: 'Riya Kulkarni',
      studentId: 'VLCC-STU-004',
      theory: 42,
      practical: 38,
      total: 80,
      percentage: 40,
      result: 'Fail',
    },
    {
      id: 5,
      studentName: 'Ananya Patil',
      studentId: 'VLCC-STU-005',
      theory: 68,
      practical: 73,
      total: 141,
      percentage: 70.5,
      result: 'Pass',
    },
  ],

  'VLCC-EXM-006': [
    {
      id: 1,
      studentName: 'Aarav Sharma',
      studentId: 'VLCC-STU-006',
      theory: 88,
      practical: 91,
      total: 179,
      percentage: 89.5,
      result: 'Pass',
    },
    {
      id: 2,
      studentName: 'Neha Joshi',
      studentId: 'VLCC-STU-007',
      theory: 79,
      practical: 86,
      total: 165,
      percentage: 82.5,
      result: 'Pass',
    },
    {
      id: 3,
      studentName: 'Ishita Shah',
      studentId: 'VLCC-STU-008',
      theory: 62,
      practical: 69,
      total: 131,
      percentage: 65.5,
      result: 'Pass',
    },
  ],
};

const statusColors: Record<
  ExaminationStatus,
  {
    bg: string;
    text: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }
> = {
  Upcoming: {
    bg: '#FFF1E2',
    text: '#F7941D',
    icon: 'clock-outline',
  },

  Ongoing: {
    bg: '#EAF2FF',
    text: '#2675E8',
    icon: 'progress-clock',
  },

  Completed: {
    bg: '#E7F8EF',
    text: '#35B878',
    icon: 'check-circle-outline',
  },

  'Results Published': {
    bg: '#F1EAFF',
    text: '#7040D5',
    icon: 'file-certificate-outline',
  },
};

export default function ExaminationsPage() {
  const insets = useSafeAreaInsets();

  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const [search, setSearch] = useState('');

  const [filter, setFilter] =
    useState<'All' | ExaminationStatus>('All');

  const [selectedExam, setSelectedExam] =
    useState<Examination | null>(null);

  const [showActions, setShowActions] =
    useState(false);

  const [showViewModal, setShowViewModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showResultsModal, setShowResultsModal] =
    useState(false);

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredExaminations = useMemo(() => {
    const value = search.trim().toLowerCase();

    return examinations.filter((exam) => {
      const matchesSearch =
        !value ||
        exam.name.toLowerCase().includes(value) ||
        exam.code.toLowerCase().includes(value) ||
        exam.course.toLowerCase().includes(value) ||
        exam.batch.toLowerCase().includes(value) ||
        exam.branch.toLowerCase().includes(value);

      const matchesFilter =
        filter === 'All' ||
        exam.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  /* =====================================================
     SUMMARY
     ===================================================== */

  const totalExams = examinations.length;

  const upcoming = examinations.filter(
    (item) => item.status === 'Upcoming'
  ).length;

  const ongoing = examinations.filter(
    (item) => item.status === 'Ongoing'
  ).length;

  const completed = examinations.filter(
    (item) => item.status === 'Completed'
  ).length;

  const published = examinations.filter(
    (item) => item.status === 'Results Published'
  ).length;

  /* =====================================================
     TOP 3
     ===================================================== */

  const topThreeStudents = useMemo(() => {
    const allResults =
      Object.values(publishedResults).flat();

    return [...allResults]
      .sort(
        (a, b) =>
          b.percentage - a.percentage
      )
      .slice(0, 3);
  }, []);

  /* =====================================================
     ACTIONS
     ===================================================== */

  const openActions = (
    exam: Examination
  ) => {
    setSelectedExam(exam);
    setShowActions(true);
  };

  const openView = (
    exam: Examination
  ) => {
    setSelectedExam(exam);
    setShowActions(false);
    setShowViewModal(true);
  };

  const openEdit = (
    exam: Examination
  ) => {
    setSelectedExam(exam);
    setShowActions(false);
    setShowEditModal(true);
  };

  const openPublishedResults = (
    exam: Examination
  ) => {
    setSelectedExam(exam);
    setShowActions(false);
    setShowViewModal(false);
    setShowResultsModal(true);
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const deleteExam = (
    exam: Examination
  ) => {
    setShowActions(false);

    Alert.alert(
      'Delete Examination',
      `Are you sure you want to delete "${exam.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Deleted',
              'The examination has been deleted.'
            );
          },
        },
      ]
    );
  };

  /* =====================================================
     PUBLISH
     ===================================================== */

  const publishResults = (
    exam: Examination
  ) => {
    setShowActions(false);

    Alert.alert(
      'Publish Results',
      `Publish results for ${exam.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Publish',
          onPress: () => {
            Alert.alert(
              'Results Published',
              'The examination results have been published successfully.'
            );
          },
        },
      ]
    );
  };

  /* =====================================================
     RESULTS
     ===================================================== */

  const getResults = (
    exam: Examination | null
  ) => {
    if (!exam) {
      return [];
    }

    return publishedResults[exam.code] ?? [];
  };

  const results =
    getResults(selectedExam);

  const passedResults =
    results.filter(
      (item) => item.result === 'Pass'
    ).length;

  const failedResults =
    results.filter(
      (item) => item.result === 'Fail'
    ).length;

  const passPercentage =
    results.length > 0
      ? (
          (passedResults /
            results.length) *
          100
        ).toFixed(1)
      : '0';

  /* =====================================================
     PDF HTML
     ===================================================== */

  const createResultHtml = (
    exam: Examination
  ) => {
    const examResults =
      getResults(exam);

    const passed =
      examResults.filter(
        (student) =>
          student.result === 'Pass'
      ).length;

    const failed =
      examResults.filter(
        (student) =>
          student.result === 'Fail'
      ).length;

    const passRate =
      examResults.length > 0
        ? (
            (passed /
              examResults.length) *
            100
          ).toFixed(1)
        : '0';

    const rows = examResults
      .map(
        (student, index) => `
          <tr>
            <td>${index + 1}</td>

            <td>
              <strong>
                ${student.studentName}
              </strong>

              <br/>

              <span class="student-id">
                ${student.studentId}
              </span>
            </td>

            <td>
              ${student.theory}
            </td>

            <td>
              ${student.practical}
            </td>

            <td>
              ${student.total}
            </td>

            <td>
              ${student.percentage}%
            </td>

            <td>
              <span class="${
                student.result === 'Pass'
                  ? 'pass'
                  : 'fail'
              }">
                ${student.result}
              </span>
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
              margin-bottom: 8px;
            }

            .label {
              color: #748096;
              font-size: 11px;
            }

            .value {
              font-size: 13px;
              font-weight: bold;
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

            .pass {
              color: #35B878;
              font-weight: bold;
            }

            .fail {
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
              Published Examination Result
            </h1>
          </div>

          <div class="details">

            <div class="detail">
              <span class="label">
                Examination
              </span>

              <br/>

              <span class="value">
                ${exam.name}
              </span>
            </div>

            <div class="detail">
              <span class="label">
                Examination Code
              </span>

              <br/>

              <span class="value">
                ${exam.code}
              </span>
            </div>

            <div class="detail">
              <span class="label">
                Course
              </span>

              <br/>

              <span class="value">
                ${exam.course}
              </span>
            </div>

            <div class="detail">
              <span class="label">
                Batch
              </span>

              <br/>

              <span class="value">
                ${exam.batch}
              </span>
            </div>

            <div class="detail">
              <span class="label">
                Branch
              </span>

              <br/>

              <span class="value">
                ${exam.branch}
              </span>
            </div>

            <div class="detail">
              <span class="label">
                Examination Date
              </span>

              <br/>

              <span class="value">
                ${exam.date}
              </span>
            </div>

          </div>

          <div class="summary">

            <div class="summary-card">
              <div class="summary-value">
                ${examResults.length}
              </div>

              <div class="summary-label">
                Students
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-value">
                ${passed}
              </div>

              <div class="summary-label">
                Passed
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-value">
                ${failed}
              </div>

              <div class="summary-label">
                Failed
              </div>
            </div>

            <div class="summary-card">
              <div class="summary-value">
                ${passRate}%
              </div>

              <div class="summary-label">
                Pass Percentage
              </div>
            </div>

          </div>

          <h2>
            Student-wise Result
          </h2>

          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Theory</th>
                <th>Practical</th>
                <th>Total</th>
                <th>%</th>
                <th>Result</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <div class="footer">
            Generated by VLCC ERP Portal
          </div>

        </body>
      </html>
    `;
  };

  /* =====================================================
     GENERATE PDF
     ===================================================== */

  const generateResultPDF = async (
    exam: Examination
  ): Promise<string | null> => {
    try {
      const examResults =
        getResults(exam);

      if (examResults.length === 0) {
        Alert.alert(
          'No Results',
          'No published results are available for this examination.'
        );

        return null;
      }

      const { uri } =
        await Print.printToFileAsync({
          html: createResultHtml(exam),
        });

      return uri;
    } catch (error) {
      console.error(
        'PDF generation error:',
        error
      );

      Alert.alert(
        'PDF Error',
        'Unable to generate the result PDF.'
      );

      return null;
    }
  };

  /* =====================================================
     DOWNLOAD PDF
     ===================================================== */

  const downloadResultPDF = async (
    exam: Examination
  ) => {
    const uri =
      await generateResultPDF(exam);

    if (!uri) {
      return;
    }

    try {
      const available =
        await Sharing.isAvailableAsync();

      if (!available) {
        Alert.alert(
          'PDF Generated',
          'The result PDF was generated successfully.'
        );

        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle:
          `${exam.name} - Result PDF`,
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error(
        'PDF sharing error:',
        error
      );

      Alert.alert(
        'Share Error',
        'Unable to share the result PDF.'
      );
    }
  };

  /* =====================================================
     DIRECT WHATSAPP
     ===================================================== */

  const shareResultOnWhatsApp = async (
    exam: Examination
  ) => {
    const examResults =
      getResults(exam);

    if (examResults.length === 0) {
      Alert.alert(
        'No Results',
        'No published results are available for this examination.'
      );

      return;
    }

    const passed =
      examResults.filter(
        (item) =>
          item.result === 'Pass'
      ).length;

    const failed =
      examResults.filter(
        (item) =>
          item.result === 'Fail'
      ).length;

    const passRate =
      (
        (passed /
          examResults.length) *
        100
      ).toFixed(1);

    const topStudent =
      [...examResults].sort(
        (a, b) =>
          b.percentage - a.percentage
      )[0];

    const message =
      `*VLCC ERP Portal*\n\n` +
      `*Published Examination Result*\n\n` +
      `*Examination:* ${exam.name}\n` +
      `*Code:* ${exam.code}\n` +
      `*Course:* ${exam.course}\n` +
      `*Batch:* ${exam.batch}\n` +
      `*Branch:* ${exam.branch}\n` +
      `*Date:* ${exam.date}\n\n` +
      `*Result Summary*\n` +
      `Students: ${examResults.length}\n` +
      `Passed: ${passed}\n` +
      `Failed: ${failed}\n` +
      `Pass Rate: ${passRate}%\n\n` +
      `*Top Performer*\n` +
      `${topStudent.studentName} - ${topStudent.percentage}%\n\n` +
      `The detailed result PDF is available from the VLCC ERP Portal.`;

    try {
      const whatsappUrl =
        `whatsapp://send?text=${encodeURIComponent(
          message
        )}`;

      const supported =
        await Linking.canOpenURL(
          whatsappUrl
        );

      if (supported) {
        await Linking.openURL(
          whatsappUrl
        );

        return;
      }

      /*
       * Fallback for devices where
       * the whatsapp:// scheme is unavailable.
       */
      const webUrl =
        `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;

      await Linking.openURL(
        webUrl
      );
    } catch (error) {
      console.error(
        'WhatsApp error:',
        error
      );

      Alert.alert(
        'WhatsApp Error',
        'WhatsApp could not be opened on this device.'
      );
    }
  };

  /* =====================================================
     SUMMARY CARD
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
  ) => {
    const backgrounds = {
      purple: '#F1EAFF',
      blue: '#EAF2FF',
      green: '#E7F8EF',
      orange: '#FFF1E2',
    };

    const icons = {
      purple: '#7040D5',
      blue: '#2675E8',
      green: '#35B878',
      orange: '#F7941D',
    };

    return (
      <View
        style={[
          styles.summaryCard,
          {
            width: isDesktop
              ? '18.8%'
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
     TOP 3 ATTRACTIVE SVG CARD
     ===================================================== */

  const renderTopThreeCard = () => {
    const size = isDesktop ? 100 : 94;

    const center = 50;
    const outerRadius = 38;
    const innerRadius = 29;

    const outerCircumference =
      2 *
      Math.PI *
      outerRadius;

    const innerCircumference =
      2 *
      Math.PI *
      innerRadius;

    return (
      <View
        style={[
          styles.topThreeCard,
          {
            width: isDesktop
              ? '18.8%'
              : '48%',
          },
        ]}
      >
        <View
          style={styles.topThreeTitleRow}
        >
          <MaterialCommunityIcons
            name="trophy-outline"
            size={15}
            color="#7040D5"
          />

          <Text
            style={styles.topThreeSmallTitle}
          >
            TOP PERFORMERS
          </Text>
        </View>

        <View
          style={[
            styles.topThreeCircle,
            {
              width: size,
              height: size,
            },
          ]}
        >
          <Svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
          >
            {/* outer outline */}
            <Circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="none"
              stroke="#E7DDFB"
              strokeWidth="3"
            />

            {/* outer progress */}
            <Circle
              cx={center}
              cy={center}
              r={outerRadius}
              fill="none"
              stroke="#7040D5"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${outerCircumference} ${outerCircumference}`}
              strokeDashoffset={
                outerCircumference * 0.08
              }
              transform="rotate(-90 50 50)"
            />

            {/* inner outline */}
            <Circle
              cx={center}
              cy={center}
              r={innerRadius}
              fill="none"
              stroke="#F0EAFE"
              strokeWidth="2"
            />
          </Svg>

          <View
            style={styles.topThreeCenter}
          >
            <MaterialCommunityIcons
              name="trophy"
              size={17}
              color="#F7941D"
            />

            <Text
              style={styles.topThreeText}
            >
              Top 3
            </Text>

            <Text
              style={styles.topThreeSubtext}
            >
              Students
            </Text>
          </View>
        </View>

        <View
          style={styles.medalRow}
        >
          <View
            style={[
              styles.medalDot,
              {
                backgroundColor:
                  '#F7941D',
              },
            ]}
          >
            <Text
              style={styles.medalNumber}
            >
              1
            </Text>
          </View>

          <View
            style={[
              styles.medalDot,
              {
                backgroundColor:
                  '#8B94A5',
              },
            ]}
          >
            <Text
              style={styles.medalNumber}
            >
              2
            </Text>
          </View>

          <View
            style={[
              styles.medalDot,
              {
                backgroundColor:
                  '#C77B45',
              },
            ]}
          >
            <Text
              style={styles.medalNumber}
            >
              3
            </Text>
          </View>
        </View>
      </View>
    );
  };

  /* =====================================================
     EXAM CARD
     ===================================================== */

  const renderExaminationCard = (
    exam: Examination
  ) => {
    const status =
      statusColors[exam.status];

    return (
      <View
        key={exam.id}
        style={[
          styles.examCard,
          {
            width: isDesktop
              ? '48.9%'
              : '100%',
          },
        ]}
      >
        <View style={styles.examTop}>
          <View style={styles.examIcon}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color="#7040D5"
            />
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() =>
              openActions(exam)
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
          style={styles.examName}
          numberOfLines={2}
        >
          {exam.name}
        </Text>

        <Text style={styles.examCode}>
          {exam.code}
        </Text>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="book-open-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {exam.course}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {exam.batch}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="office-building-outline"
            size={15}
            color="#748096"
          />

          <Text style={styles.infoText}>
            {exam.branch}
          </Text>
        </View>

        <View style={styles.examDetails}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="calendar-outline"
              size={16}
              color="#7040D5"
            />

            <Text style={styles.detailText}>
              {exam.date}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={16}
              color="#7040D5"
            />

            <Text style={styles.detailText}>
              {exam.time}
            </Text>
          </View>
        </View>

        <View style={styles.examBottom}>
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
              {exam.status}
            </Text>
          </View>

          <Text style={styles.studentCount}>
            {exam.students} Students
          </Text>
        </View>

        {exam.status ===
          'Results Published' && (
          <TouchableOpacity
            style={
              styles.viewResultsSmallButton
            }
            onPress={() =>
              openPublishedResults(exam)
            }
          >
            <MaterialCommunityIcons
              name="file-eye-outline"
              size={17}
              color="#7040D5"
            />

            <Text
              style={
                styles.viewResultsSmallText
              }
            >
              View Published Results
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
        {/* BACK ARROW */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
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
          <Text style={styles.headerTitle}>
            Examinations
          </Text>
        </View>

        {/* SMALL ADD EXAMINATION BUTTON */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/explore',
              params: { feature: 'Add Examination' },
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
            Add Examination
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
            MANAGEMENT TITLE
            ===================================================== */}

        <Text
          style={styles.managementTitle}
        >
          Examination Management
        </Text>

        <Text
          style={styles.managementSubtitle}
        >
          Manage upcoming examinations, ongoing assessments and published results.
        </Text>

        {/* =====================================================
            SUMMARY CARDS
            ===================================================== */}

        <View
          style={styles.summaryGrid}
        >
          {renderSummaryCard(
            'Total Exams',
            totalExams,
            'file-document-multiple-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Upcoming',
            upcoming,
            'calendar-clock',
            'orange'
          )}

          {renderSummaryCard(
            'Ongoing',
            ongoing,
            'progress-clock',
            'blue'
          )}

          {renderSummaryCard(
            'Completed',
            completed,
            'check-circle-outline',
            'green'
          )}

          {renderSummaryCard(
            'Results Published',
            published,
            'file-certificate-outline',
            'purple'
          )}

          {renderTopThreeCard()}
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
              placeholder="Search examination, course, batch or branch..."
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
            'Upcoming',
            'Ongoing',
            'Completed',
            'Results Published',
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
                      | ExaminationStatus
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
            EXAMINATION LIST
            ===================================================== */}

        {filteredExaminations.length ===
        0 ? (
          <View
            style={styles.emptyState}
          >
            <MaterialCommunityIcons
              name="file-search-outline"
              size={48}
              color="#B1B8C5"
            />

            <Text
              style={styles.emptyTitle}
            >
              No examinations found
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Try changing your search or filter.
            </Text>
          </View>
        ) : (
          <View
            style={styles.examGrid}
          >
            {filteredExaminations.map(
              renderExaminationCard
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
              Examination Actions
            </Text>

            <Text
              style={styles.modalSubtitle}
              numberOfLines={2}
            >
              {selectedExam?.name}
            </Text>

            {/* VIEW */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (selectedExam) {
                  openView(
                    selectedExam
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
                View Examination
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
                if (selectedExam) {
                  openEdit(
                    selectedExam
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
                Edit Examination
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A8B5"
              />
            </TouchableOpacity>

            {/* PUBLISH */}
            {selectedExam?.status !==
              'Results Published' && (
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  if (selectedExam) {
                    publishResults(
                      selectedExam
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
                    name="publish"
                    size={20}
                    color="#35B878"
                  />
                </View>

                <Text
                  style={
                    styles.actionText
                  }
                >
                  Publish Results
                </Text>

                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#A0A8B5"
                />
              </TouchableOpacity>
            )}

            {/* DELETE */}
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (selectedExam) {
                  deleteExam(
                    selectedExam
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
                Delete Examination
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
          VIEW EXAMINATION
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
              <View>
                <Text
                  style={styles.modalTitle}
                >
                  Examination Details
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  {selectedExam?.code}
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

            {selectedExam && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <Text
                  style={styles.detailTitle}
                >
                  {selectedExam.name}
                </Text>

                <View
                  style={styles.detailGrid}
                >
                  <View
                    style={styles.detailBox}
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
                      {selectedExam.course}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
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
                      {selectedExam.batch}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
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
                      {selectedExam.branch}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Date
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {selectedExam.date}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Time
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {selectedExam.time}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Duration
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {selectedExam.duration}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Students
                    </Text>

                    <Text
                      style={
                        styles.detailValue
                      }
                    >
                      {selectedExam.students}
                    </Text>
                  </View>

                  <View
                    style={styles.detailBox}
                  >
                    <Text
                      style={
                        styles.detailLabel
                      }
                    >
                      Status
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          alignSelf:
                            'flex-start',
                          backgroundColor:
                            statusColors[
                              selectedExam
                                .status
                            ].bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusColors[
                                selectedExam
                                  .status
                              ].text,
                          },
                        ]}
                      >
                        {
                          selectedExam.status
                        }
                      </Text>
                    </View>
                  </View>
                </View>

                {selectedExam.status ===
                  'Results Published' && (
                  <TouchableOpacity
                    style={
                      styles.resultsButton
                    }
                    onPress={() =>
                      openPublishedResults(
                        selectedExam
                      )
                    }
                  >
                    <MaterialCommunityIcons
                      name="file-certificate-outline"
                      size={20}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.resultsButtonText
                      }
                    >
                      View Published Results
                    </Text>
                  </TouchableOpacity>
                )}
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
                  Edit Examination
                </Text>

                <Text
                  style={styles.modalSubtitle}
                >
                  Update examination information
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

            {selectedExam && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <Text
                  style={styles.inputLabel}
                >
                  Examination Name
                </Text>

                <TextInput
                  defaultValue={
                    selectedExam.name
                  }
                  style={styles.input}
                />

                <Text
                  style={styles.inputLabel}
                >
                  Course
                </Text>

                <TextInput
                  defaultValue={
                    selectedExam.course
                  }
                  style={styles.input}
                />

                <Text
                  style={styles.inputLabel}
                >
                  Batch
                </Text>

                <TextInput
                  defaultValue={
                    selectedExam.batch
                  }
                  style={styles.input}
                />

                <Text
                  style={styles.inputLabel}
                >
                  Branch
                </Text>

                <TextInput
                  defaultValue={
                    selectedExam.branch
                  }
                  style={styles.input}
                />

                <View
                  style={styles.twoInputs}
                >
                  <View
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={
                        styles.inputLabel
                      }
                    >
                      Date
                    </Text>

                    <TextInput
                      defaultValue={
                        selectedExam.date
                      }
                      style={styles.input}
                    />
                  </View>

                  <View
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={
                        styles.inputLabel
                      }
                    >
                      Time
                    </Text>

                    <TextInput
                      defaultValue={
                        selectedExam.time
                      }
                      style={styles.input}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={
                    styles.saveButton
                  }
                  onPress={() => {
                    setShowEditModal(
                      false
                    );

                    Alert.alert(
                      'Updated',
                      'Examination details have been updated.'
                    );
                  }}
                >
                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =====================================================
          PUBLISHED RESULTS
          ===================================================== */}

      <Modal
        visible={showResultsModal}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setShowResultsModal(
            false
          )
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.resultsModal,
              {
                width: isDesktop
                  ? 850
                  : '96%',
                maxHeight: '92%',
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
                  Published Results
                </Text>

                <Text
                  style={styles.modalSubtitle}
                  numberOfLines={2}
                >
                  {selectedExam?.name}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setShowResultsModal(
                    false
                  )
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color="#748096"
                />
              </TouchableOpacity>
            </View>

            {selectedExam && (
              <>
                <ScrollView
                  showsVerticalScrollIndicator={
                    false
                  }
                  contentContainerStyle={{
                    paddingBottom: 10,
                  }}
                >
                  {/* EXAM HEADER */}
                  <View
                    style={
                      styles.resultExamHeader
                    }
                  >
                    <View
                      style={
                        styles.resultExamIcon
                      }
                    >
                      <MaterialCommunityIcons
                        name="file-certificate-outline"
                        size={27}
                        color="#7040D5"
                      />
                    </View>

                    <View
                      style={{ flex: 1 }}
                    >
                      <Text
                        style={
                          styles.resultExamName
                        }
                      >
                        {
                          selectedExam.name
                        }
                      </Text>

                      <Text
                        style={
                          styles.resultExamCode
                        }
                      >
                        {
                          selectedExam.code
                        }{' '}
                        •{' '}
                        {
                          selectedExam.branch
                        }
                      </Text>
                    </View>
                  </View>

                  {/* RESULT SUMMARY */}
                  <View
                    style={
                      styles.resultSummaryContainer
                    }
                  >
                    <View
                      style={
                        styles.resultSummaryCard
                      }
                    >
                      <Text
                        style={
                          styles.resultSummaryValue
                        }
                      >
                        {results.length}
                      </Text>

                      <Text
                        style={
                          styles.resultSummaryLabel
                        }
                      >
                        Students
                      </Text>
                    </View>

                    <View
                      style={
                        styles.resultSummaryCard
                      }
                    >
                      <Text
                        style={[
                          styles.resultSummaryValue,
                          {
                            color:
                              '#35B878',
                          },
                        ]}
                      >
                        {passedResults}
                      </Text>

                      <Text
                        style={
                          styles.resultSummaryLabel
                        }
                      >
                        Passed
                      </Text>
                    </View>

                    <View
                      style={
                        styles.resultSummaryCard
                      }
                    >
                      <Text
                        style={[
                          styles.resultSummaryValue,
                          {
                            color:
                              '#E95386',
                          },
                        ]}
                      >
                        {failedResults}
                      </Text>

                      <Text
                        style={
                          styles.resultSummaryLabel
                        }
                      >
                        Failed
                      </Text>
                    </View>

                    <View
                      style={
                        styles.resultSummaryCard
                      }
                    >
                      <Text
                        style={[
                          styles.resultSummaryValue,
                          {
                            color:
                              '#7040D5',
                          },
                        ]}
                      >
                        {passPercentage}%
                      </Text>

                      <Text
                        style={
                          styles.resultSummaryLabel
                        }
                      >
                        Pass Rate
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={
                      styles.resultsSectionTitle
                    }
                  >
                    Student-wise Results
                  </Text>

                  {/* RESULTS */}
                  <View
                    style={styles.resultsList}
                  >
                    {results.map(
                      (
                        student,
                        index
                      ) => (
                        <View
                          key={
                            student.id
                          }
                          style={
                            styles.resultStudentCard
                          }
                        >
                          <View
                            style={
                              styles.resultStudentTop
                            }
                          >
                            <View
                              style={
                                styles.resultStudentNumber
                              }
                            >
                              <Text
                                style={
                                  styles.resultStudentNumberText
                                }
                              >
                                {index + 1}
                              </Text>
                            </View>

                            <View
                              style={
                                styles.resultStudentInfo
                              }
                            >
                              <Text
                                style={
                                  styles.resultStudentName
                                }
                              >
                                {
                                  student.studentName
                                }
                              </Text>

                              <Text
                                style={
                                  styles.resultStudentId
                                }
                              >
                                {
                                  student.studentId
                                }
                              </Text>
                            </View>

                            <View
                              style={[
                                styles.resultBadge,
                                {
                                  backgroundColor:
                                    student.result ===
                                    'Pass'
                                      ? '#E7F8EF'
                                      : '#FFE9F0',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.resultBadgeText,
                                  {
                                    color:
                                      student.result ===
                                      'Pass'
                                        ? '#35B878'
                                        : '#E95386',
                                  },
                                ]}
                              >
                                {
                                  student.result
                                }
                              </Text>
                            </View>
                          </View>

                          <View
                            style={
                              styles.marksRow
                            }
                          >
                            <View
                              style={
                                styles.markItem
                              }
                            >
                              <Text
                                style={
                                  styles.markLabel
                                }
                              >
                                Theory
                              </Text>

                              <Text
                                style={
                                  styles.markValue
                                }
                              >
                                {
                                  student.theory
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.markItem
                              }
                            >
                              <Text
                                style={
                                  styles.markLabel
                                }
                              >
                                Practical
                              </Text>

                              <Text
                                style={
                                  styles.markValue
                                }
                              >
                                {
                                  student.practical
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.markItem
                              }
                            >
                              <Text
                                style={
                                  styles.markLabel
                                }
                              >
                                Total
                              </Text>

                              <Text
                                style={
                                  styles.markValue
                                }
                              >
                                {
                                  student.total
                                }
                              </Text>
                            </View>

                            <View
                              style={
                                styles.markItem
                              }
                            >
                              <Text
                                style={
                                  styles.markLabel
                                }
                              >
                                Percentage
                              </Text>

                              <Text
                                style={[
                                  styles.markValue,
                                  {
                                    color:
                                      '#7040D5',
                                  },
                                ]}
                              >
                                {
                                  student.percentage
                                }
                                %
                              </Text>
                            </View>
                          </View>
                        </View>
                      )
                    )}
                  </View>
                </ScrollView>

                {/* RESULT ACTIONS */}
                <View
                  style={
                    styles.resultActionContainer
                  }
                >
                  {/* PDF */}
                  <TouchableOpacity
                    style={
                      styles.downloadResultButton
                    }
                    onPress={() =>
                      downloadResultPDF(
                        selectedExam
                      )
                    }
                    activeOpacity={0.85}
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
                      Download Result PDF
                    </Text>
                  </TouchableOpacity>

                  {/* DIRECT WHATSAPP */}
                  <TouchableOpacity
                    style={
                      styles.whatsappButton
                    }
                    onPress={() =>
                      shareResultOnWhatsApp(
                        selectedExam
                      )
                    }
                    activeOpacity={0.85}
                  >
                    <MaterialCommunityIcons
                      name="whatsapp"
                      size={22}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.whatsappButtonText
                      }
                    >
                      Share via WhatsApp
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
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

  /*
   * Compact button so it fits
   * properly on mobile.
   */
  addButton: {
    minHeight: 34,
    width: 132,
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
     TOP 3 CARD
     ===================================================== */

  topThreeCard: {
    minHeight: 105,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,

    /*
     * Attractive purple outline
     */
    borderWidth: 1.5,
    borderColor: '#DCCCF8',

    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#7040D5',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 2,
  },

  topThreeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -1,
  },

  topThreeSmallTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 6.5,
    color: '#7040D5',
    letterSpacing: 0.5,
    marginLeft: 3,
  },

  topThreeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  topThreeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topThreeText: {
    fontFamily: 'PoppinsBold',
    fontSize: 13,
    color: '#172033',
    marginTop: 0,
  },

  topThreeSubtext: {
    fontFamily: 'PoppinsMedium',
    fontSize: 6.5,
    color: '#748096',
  },

  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: -1,
  },

  medalDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  medalNumber: {
    fontFamily: 'PoppinsBold',
    fontSize: 6,
    color: '#FFFFFF',
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
     EXAM CARDS
     ===================================================== */

  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 13,
    justifyContent: 'space-between',
  },

  examCard: {
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

  examTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  examIcon: {
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

  examName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    lineHeight: 19,
    color: '#172033',
    marginTop: 12,
  },

  examCode: {
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

  examDetails: {
    marginTop: 13,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#566176',
    marginLeft: 5,
  },

  examBottom: {
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
    fontSize: 8,
    marginLeft: 4,
  },

  studentCount: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#748096',
  },

  viewResultsSmallButton: {
    height: 36,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewResultsSmallText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
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
    marginBottom: 14,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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

  resultsButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  resultsButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
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
     RESULTS MODAL
     ===================================================== */

  resultsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },

  resultExamHeader: {
    backgroundColor: '#F7F4FF',
    borderRadius: 13,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultExamIcon: {
    width: 49,
    height: 49,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  resultExamName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#172033',
  },

  resultExamCode: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#748096',
    marginTop: 3,
  },

  resultSummaryContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 13,
  },

  resultSummaryCard: {
    flex: 1,
    minHeight: 75,
    borderRadius: 11,
    backgroundColor: '#F7F8FC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultSummaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  resultSummaryLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 7.5,
    color: '#748096',
    marginTop: 2,
  },

  resultsSectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
    marginTop: 17,
    marginBottom: 8,
  },

  resultsList: {
    gap: 9,
  },

  resultStudentCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 12,
    padding: 11,
  },

  resultStudentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  resultStudentNumber: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultStudentNumberText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
  },

  resultStudentInfo: {
    flex: 1,
    marginLeft: 9,
  },

  resultStudentName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
  },

  resultStudentId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8B94A5',
    marginTop: 1,
  },

  resultBadge: {
    minWidth: 48,
    height: 25,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },

  resultBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  marksRow: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
  },

  markItem: {
    flex: 1,
  },

  markLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8B94A5',
  },

  markValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#172033',
    marginTop: 2,
  },

  /* =====================================================
     RESULT BUTTONS
     ===================================================== */

  resultActionContainer: {
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingTop: 12,
    marginTop: 12,
    gap: 8,
  },

  downloadResultButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  downloadResultButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#FFFFFF',
    marginLeft: 6,
  },

  /*
   * Green WhatsApp button.
   *
   * This now opens WhatsApp directly
   * instead of expo-sharing.
   */
  whatsappButton: {
    height: 45,
    borderRadius: 10,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  whatsappButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#FFFFFF',
    marginLeft: 6,
  },
});
