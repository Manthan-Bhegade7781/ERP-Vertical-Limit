import React, { useMemo, useState } from 'react';
import {
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
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type ReportType =
  | 'Student'
  | 'Attendance'
  | 'Fees'
  | 'Academic'
  | 'Staff';

type ReportStatus =
  | 'Generated'
  | 'Pending'
  | 'Scheduled';

type ReportRecord = {
  id: number;
  reportId: string;
  title: string;
  type: ReportType;
  description: string;
  branch: string;
  generatedBy: string;
  date: string;
  time: string;
  status: ReportStatus;
  records: string;
  format: 'PDF' | 'Excel';
};

const initialReports: ReportRecord[] = [
  {
    id: 1,
    reportId: 'VLCC-RPT-001',
    title: 'Monthly Student Report',
    type: 'Student',
    description:
      'Complete student strength, admission and branch-wise student report.',
    branch: 'All Branches',
    generatedBy: 'Super Admin',
    date: '05 Sep 2026',
    time: '09:30 AM',
    status: 'Generated',
    records: '2,568',
    format: 'PDF',
  },
  {
    id: 2,
    reportId: 'VLCC-RPT-002',
    title: 'Attendance Summary',
    type: 'Attendance',
    description:
      'Monthly student attendance summary including present, absent, late and leave.',
    branch: 'Pune Branch',
    generatedBy: 'Super Admin',
    date: '04 Sep 2026',
    time: '05:15 PM',
    status: 'Generated',
    records: '842',
    format: 'PDF',
  },
  {
    id: 3,
    reportId: 'VLCC-RPT-003',
    title: 'Fee Collection Report',
    type: 'Fees',
    description:
      'Branch-wise fee collection, pending fees and overdue payment report.',
    branch: 'All Branches',
    generatedBy: 'Karan Malhotra',
    date: '04 Sep 2026',
    time: '03:45 PM',
    status: 'Generated',
    records: '2,568',
    format: 'PDF',
  },
  {
    id: 4,
    reportId: 'VLCC-RPT-004',
    title: 'Academic Performance Report',
    type: 'Academic',
    description:
      'Student performance report based on examinations, assignments and attendance.',
    branch: 'Mumbai Branch',
    generatedBy: 'Super Admin',
    date: '03 Sep 2026',
    time: '02:20 PM',
    status: 'Generated',
    records: '614',
    format: 'PDF',
  },
  {
    id: 5,
    reportId: 'VLCC-RPT-005',
    title: 'Staff Attendance Report',
    type: 'Staff',
    description:
      'Staff attendance, leave and working-day summary for the selected period.',
    branch: 'Nashik Branch',
    generatedBy: 'Administrator',
    date: '02 Sep 2026',
    time: '11:40 AM',
    status: 'Generated',
    records: '58',
    format: 'Excel',
  },
  {
    id: 6,
    reportId: 'VLCC-RPT-006',
    title: 'Branch Performance Report',
    type: 'Academic',
    description:
      'Overall branch performance including students, attendance, fees and academics.',
    branch: 'Nagpur Branch',
    generatedBy: 'Super Admin',
    date: '01 Sep 2026',
    time: '04:10 PM',
    status: 'Scheduled',
    records: '306',
    format: 'PDF',
  },
  {
    id: 7,
    reportId: 'VLCC-RPT-007',
    title: 'New Admissions Report',
    type: 'Student',
    description:
      'New admissions received during the current academic period.',
    branch: 'Pune Branch',
    generatedBy: 'Branch Manager',
    date: '31 Aug 2026',
    time: '01:15 PM',
    status: 'Generated',
    records: '126',
    format: 'PDF',
  },
  {
    id: 8,
    reportId: 'VLCC-RPT-008',
    title: 'Pending Fee Report',
    type: 'Fees',
    description:
      'List of students with pending or overdue fee payments.',
    branch: 'All Branches',
    generatedBy: 'Accountant',
    date: '30 Aug 2026',
    time: '10:20 AM',
    status: 'Pending',
    records: '284',
    format: 'PDF',
  },
];

const reportTypes: ReportType[] = [
  'Student',
  'Attendance',
  'Fees',
  'Academic',
  'Staff',
];

const branches = [
  'All Branches',
  'Pune Branch',
  'Mumbai Branch',
  'Nashik Branch',
  'Nagpur Branch',
  'Main Branch',
];

export default function ReportsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const contentWidth = width - 32;
  const statGap = 10;
  const statCardWidth =
    (contentWidth - statGap * 2) / 3;

  const [reports, setReports] =
    useState<ReportRecord[]>(
      initialReports
    );

  const [search, setSearch] =
    useState('');

  const [activeFilter, setActiveFilter] =
    useState<'All' | ReportType>('All');

  const [selectedReport, setSelectedReport] =
    useState<ReportRecord | null>(null);

  const [actionVisible, setActionVisible] =
    useState(false);

  const [viewVisible, setViewVisible] =
    useState(false);

  const [generateVisible, setGenerateVisible] =
    useState(false);

  const [generateType, setGenerateType] =
    useState<ReportType>('Student');

  const [generateBranch, setGenerateBranch] =
    useState('All Branches');

  const [dateFrom, setDateFrom] =
    useState('01 Sep 2026');

  const [dateTo, setDateTo] =
    useState('05 Sep 2026');

  const totalReports = reports.length;

  const studentReports = reports.filter(
    (report) => report.type === 'Student'
  ).length;

  const attendanceReports = reports.filter(
    (report) =>
      report.type === 'Attendance'
  ).length;

  const feeReports = reports.filter(
    (report) => report.type === 'Fees'
  ).length;

  const academicReports = reports.filter(
    (report) =>
      report.type === 'Academic'
  ).length;

  const staffReports = reports.filter(
    (report) => report.type === 'Staff'
  ).length;

  const filteredReports = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.title
          .toLowerCase()
          .includes(query) ||
        report.reportId
          .toLowerCase()
          .includes(query) ||
        report.branch
          .toLowerCase()
          .includes(query) ||
        report.generatedBy
          .toLowerCase()
          .includes(query) ||
        report.description
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        activeFilter === 'All' ||
        report.type === activeFilter;

      return (
        matchesSearch &&
        matchesFilter
      );
    });
  }, [
    reports,
    search,
    activeFilter,
  ]);

  const openActions = (
    report: ReportRecord
  ) => {
    setSelectedReport(report);
    setActionVisible(true);
  };

  const viewReport = (
    report: ReportRecord
  ) => {
    setSelectedReport(report);
    setActionVisible(false);
    setViewVisible(true);
  };

  const generateReport = () => {
    const nextId =
      Math.max(
        0,
        ...reports.map(
          (report) => report.id
        )
      ) + 1;

    const newReport: ReportRecord = {
      id: nextId,
      reportId: `VLCC-RPT-${String(
        nextId
      ).padStart(3, '0')}`,
      title: `${generateType} Report`,
      type: generateType,
      description: `${generateType} report generated for the selected branch and date range.`,
      branch: generateBranch,
      generatedBy: 'Super Admin',
      date: '05 Sep 2026',
      time: '10:00 PM',
      status: 'Generated',
      records: '0',
      format: 'PDF',
    };

    setReports((current) => [
      newReport,
      ...current,
    ]);

    setGenerateVisible(false);

    Alert.alert(
      'Report Generated',
      `${newReport.title} has been generated successfully.`
    );
  };

  const downloadReport = async (
    report: ReportRecord
  ) => {
    try {
      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 30px;
                color: #172033;
              }
              h1 {
                color: #7040D5;
                margin-bottom: 4px;
              }
              h2 {
                margin-top: 30px;
              }
              .meta {
                color: #667085;
                margin-bottom: 20px;
              }
              .box {
                border: 1px solid #E5E7EB;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 10px;
              }
              .label {
                color: #667085;
                font-size: 12px;
              }
              .value {
                font-size: 16px;
                font-weight: bold;
              }
            </style>
          </head>

          <body>
            <h1>VLCC ERP Portal</h1>
            <h2>${report.title}</h2>

            <div class="meta">
              Report ID: ${report.reportId}
            </div>

            <div class="box">
              <div class="label">Report Type</div>
              <div class="value">${report.type}</div>
            </div>

            <div class="box">
              <div class="label">Branch</div>
              <div class="value">${report.branch}</div>
            </div>

            <div class="box">
              <div class="label">Records</div>
              <div class="value">${report.records}</div>
            </div>

            <div class="box">
              <div class="label">Generated By</div>
              <div class="value">${report.generatedBy}</div>
            </div>

            <div class="box">
              <div class="label">Generated Date</div>
              <div class="value">${report.date} ${report.time}</div>
            </div>

            <h3>Report Description</h3>
            <p>${report.description}</p>
          </body>
        </html>
      `;

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
            mimeType:
              'application/pdf',
            dialogTitle:
              `Share ${report.title}`,
          }
        );
      } else {
        Alert.alert(
          'PDF Generated',
          'The report PDF was generated successfully.'
        );
      }
    } catch {
      Alert.alert(
        'Error',
        'Unable to generate the report PDF.'
      );
    }
  };

  const shareReport = async (
    report: ReportRecord
  ) => {
    await downloadReport(report);
  };

  const deleteReport = (
    report: ReportRecord
  ) => {
    setActionVisible(false);

    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${report.title}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setReports((current) =>
              current.filter(
                (item) =>
                  item.id !== report.id
              )
            );

            Alert.alert(
              'Deleted',
              'Report has been deleted successfully.'
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
            width:
              statCardWidth,
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
            size={19}
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
        >
          {value}
        </Text>
      </View>
    );
  };

  const renderReportCard = (
    report: ReportRecord
  ) => {
    return (
      <TouchableOpacity
        key={report.id}
        activeOpacity={0.9}
        style={styles.reportCard}
        onPress={() =>
          viewReport(report)
        }
      >
        <View
          style={styles.reportTopRow}
        >
          <View
            style={
              styles.reportIconBox
            }
          >
            <MaterialCommunityIcons
              name={getReportIcon(
                report.type
              )}
              size={22}
              color={getReportColor(
                report.type
              )}
            />
          </View>

          <View
            style={
              styles.reportMain
            }
          >
            <Text
              style={
                styles.reportTitle
              }
              numberOfLines={2}
            >
              {report.title}
            </Text>

            <Text
              style={
                styles.reportId
              }
            >
              {report.reportId}
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.moreButton
            }
            onPress={(event) => {
              event.stopPropagation();
              openActions(report);
            }}
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#59657A"
            />
          </TouchableOpacity>
        </View>

        <Text
          style={
            styles.reportDescription
          }
          numberOfLines={2}
        >
          {report.description}
        </Text>

        <View
          style={
            styles.reportDetails
          }
        >
          <DetailItem
            icon="office-building-outline"
            label="Branch"
            value={report.branch}
          />

          <DetailItem
            icon="file-document-outline"
            label="Records"
            value={report.records}
          />

          <DetailItem
            icon="calendar-outline"
            label="Date"
            value={report.date}
          />
        </View>

        <View
          style={
            styles.reportFooter
          }
        >
          <View
            style={
              styles.typeBadge
            }
          >
            <Text
              style={
                styles.typeBadgeText
              }
            >
              {report.type}
            </Text>
          </View>

          <View
            style={
              styles.footerRight
            }
          >
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    getStatusColor(
                      report.status
                    ).bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      getStatusColor(
                        report.status
                      ).text,
                  },
                ]}
              >
                {report.status}
              </Text>
            </View>

            <Text
              style={
                styles.formatText
              }
            >
              {report.format}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop:
            insets.top,
        },
      ]}
    >
      {/* HEADER */}

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
          Reports
        </Text>

        <TouchableOpacity
          style={styles.generateButton}
          onPress={() =>
            setGenerateVisible(
              true
            )
          }
        >
          <MaterialCommunityIcons
            name="file-plus-outline"
            size={15}
            color="#7040D5"
          />

          <Text
            style={
              styles.generateButtonText
            }
          >
            Generate
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
          Report Management
        </Text>

        <Text
          style={
            styles.managementSubtitle
          }
        >
          Generate, manage and download ERP reports
        </Text>

        {/* SUMMARY */}

        <View
          style={
            styles.summaryGrid
          }
        >
          {renderSummaryCard(
            'Total Reports',
            String(totalReports),
            'file-chart-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Student Reports',
            String(studentReports),
            'account-group-outline',
            'blue'
          )}

          {renderSummaryCard(
            'Attendance Reports',
            String(attendanceReports),
            'calendar-check-outline',
            'green'
          )}

          {renderSummaryCard(
            'Fee Reports',
            String(feeReports),
            'cash-multiple',
            'orange'
          )}

          {renderSummaryCard(
            'Academic Reports',
            String(academicReports),
            'school-outline',
            'purple'
          )}

          {renderSummaryCard(
            'Staff Reports',
            String(staffReports),
            'account-tie-outline',
            'pink'
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
            placeholder="Search report, branch or report ID..."
            placeholderTextColor="#A2AABB"
            style={
              styles.searchInput
            }
          />

          {search.length > 0 && (
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

        {/* FILTER */}

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
            ...reportTypes,
          ].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                activeFilter ===
                  filter &&
                  styles.filterButtonActive,
              ]}
              onPress={() =>
                setActiveFilter(
                  filter as
                    | 'All'
                    | ReportType
                )
              }
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

        {/* LIST HEADER */}

        <View
          style={
            styles.listHeader
          }
        >
          <Text
            style={
              styles.listTitle
            }
          >
            Reports
          </Text>

          <Text
            style={
              styles.recordCount
            }
          >
            {filteredReports.length}{' '}
            Records
          </Text>
        </View>

        {/* REPORT LIST */}

        {filteredReports.length ===
        0 ? (
          <View
            style={
              styles.emptyBox
            }
          >
            <MaterialCommunityIcons
              name="file-search-outline"
              size={44}
              color="#A7AFBD"
            />

            <Text
              style={
                styles.emptyTitle
              }
            >
              No reports found
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Try another search or report type.
            </Text>
          </View>
        ) : (
          filteredReports.map(
            renderReportCard
          )
        )}
      </ScrollView>

      {/* =========================
          ACTION MODAL
      ========================== */}

      <Modal
        visible={actionVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionVisible(false)
        }
      >
        <Pressable
          style={
            styles.modalOverlay
          }
          onPress={() =>
            setActionVisible(false)
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Report Actions
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                  numberOfLines={1}
                >
                  {
                    selectedReport?.title
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setActionVisible(
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

            <ActionButton
              icon="eye-outline"
              color="#7040D5"
              text="View Report"
              onPress={() => {
                if (
                  selectedReport
                ) {
                  viewReport(
                    selectedReport
                  );
                }
              }}
            />

            <ActionButton
              icon="file-refresh-outline"
              color="#2675E8"
              text="Generate Report"
              onPress={() => {
                setActionVisible(
                  false
                );
                setGenerateType(
                  selectedReport?.type ||
                    'Student'
                );
                setGenerateBranch(
                  selectedReport?.branch ||
                    'All Branches'
                );
                setGenerateVisible(
                  true
                );
              }}
            />

            <ActionButton
              icon="file-pdf-box"
              color="#D84B63"
              text="Download PDF"
              onPress={() => {
                if (
                  selectedReport
                ) {
                  setActionVisible(
                    false
                  );
                  downloadReport(
                    selectedReport
                  );
                }
              }}
            />

            <ActionButton
              icon="share-variant-outline"
              color="#35B878"
              text="Share Report"
              onPress={() => {
                if (
                  selectedReport
                ) {
                  setActionVisible(
                    false
                  );
                  shareReport(
                    selectedReport
                  );
                }
              }}
            />

            <ActionButton
              icon="delete-outline"
              color="#D84B63"
              text="Delete Report"
              onPress={() => {
                if (
                  selectedReport
                ) {
                  deleteReport(
                    selectedReport
                  );
                }
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* =========================
          VIEW REPORT
      ========================== */}

      <Modal
        visible={viewVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewVisible(false)
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Report Details
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  {
                    selectedReport?.reportId
                  }
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setViewVisible(
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

            {selectedReport && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={
                    styles.reportPreview
                  }
                >
                  <View
                    style={
                      styles.previewIcon
                    }
                  >
                    <MaterialCommunityIcons
                      name="file-chart-outline"
                      size={29}
                      color="#7040D5"
                    />
                  </View>

                  <Text
                    style={
                      styles.previewTitle
                    }
                  >
                    {
                      selectedReport.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.previewId
                    }
                  >
                    {
                      selectedReport.reportId
                    }
                  </Text>
                </View>

                <View
                  style={
                    styles.detailGrid
                  }
                >
                  <DetailBox
                    label="Report Type"
                    value={
                      selectedReport.type
                    }
                  />

                  <DetailBox
                    label="Branch"
                    value={
                      selectedReport.branch
                    }
                  />

                  <DetailBox
                    label="Records"
                    value={
                      selectedReport.records
                    }
                  />

                  <DetailBox
                    label="Format"
                    value={
                      selectedReport.format
                    }
                  />

                  <DetailBox
                    label="Generated By"
                    value={
                      selectedReport.generatedBy
                    }
                  />

                  <DetailBox
                    label="Status"
                    value={
                      selectedReport.status
                    }
                  />
                </View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  Description
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
                      selectedReport.description
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.sectionLabel
                  }
                >
                  Generated
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
                    {selectedReport.date}{' '}
                    at{' '}
                    {
                      selectedReport.time
                    }
                  </Text>
                </View>

                <TouchableOpacity
                  style={
                    styles.primaryButton
                  }
                  onPress={() =>
                    downloadReport(
                      selectedReport
                    )
                  }
                >
                  <MaterialCommunityIcons
                    name="file-pdf-box"
                    size={19}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Download / Share PDF
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* =========================
          GENERATE REPORT
      ========================== */}

      <Modal
        visible={
          generateVisible
        }
        transparent
        animationType="slide"
        onRequestClose={() =>
          setGenerateVisible(
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Generate Report
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Select report criteria
                </Text>
              </View>

              <TouchableOpacity
                onPress={() =>
                  setGenerateVisible(
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

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <Text
                style={
                  styles.inputLabel
                }
              >
                Report Type
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.optionContainer
                }
              >
                {reportTypes.map(
                  (type) => (
                    <OptionButton
                      key={type}
                      label={type}
                      selected={
                        generateType ===
                        type
                      }
                      onPress={() =>
                        setGenerateType(
                          type
                        )
                      }
                    />
                  )
                )}
              </ScrollView>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Branch
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.optionContainer
                }
              >
                {branches.map(
                  (branch) => (
                    <OptionButton
                      key={branch}
                      label={branch}
                      selected={
                        generateBranch ===
                        branch
                      }
                      onPress={() =>
                        setGenerateBranch(
                          branch
                        )
                      }
                    />
                  )
                )}
              </ScrollView>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Date From
              </Text>

              <View
                style={
                  styles.dateInput
                }
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#7040D5"
                />

                <TextInput
                  value={dateFrom}
                  onChangeText={
                    setDateFrom
                  }
                  style={
                    styles.dateTextInput
                  }
                  placeholder="DD MMM YYYY"
                  placeholderTextColor="#A2AABB"
                />
              </View>

              <Text
                style={
                  styles.inputLabel
                }
              >
                Date To
              </Text>

              <View
                style={
                  styles.dateInput
                }
              >
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={18}
                  color="#7040D5"
                />

                <TextInput
                  value={dateTo}
                  onChangeText={
                    setDateTo
                  }
                  style={
                    styles.dateTextInput
                  }
                  placeholder="DD MMM YYYY"
                  placeholderTextColor="#A2AABB"
                />
              </View>

              <View
                style={
                  styles.generatePreview
                }
              >
                <MaterialCommunityIcons
                  name="file-chart-outline"
                  size={23}
                  color="#7040D5"
                />

                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={
                      styles.generatePreviewTitle
                    }
                  >
                    {generateType} Report
                  </Text>

                  <Text
                    style={
                      styles.generatePreviewText
                    }
                  >
                    {generateBranch}
                    {' • '}
                    {dateFrom}
                    {' - '}
                    {dateTo}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                onPress={
                  generateReport
                }
              >
                <MaterialCommunityIcons
                  name="file-plus-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.primaryButtonText
                  }
                >
                  Generate Report
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================
   COMPONENTS
========================= */

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.detailItem
      }
    >
      <MaterialCommunityIcons
        name={icon}
        size={15}
        color="#8A93A4"
      />

      <View
        style={{
          flex: 1,
        }}
      >
        <Text
          style={
            styles.detailItemLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.detailItemValue
          }
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.detailBox
      }
    >
      <Text
        style={
          styles.detailBoxLabel
        }
      >
        {label}
      </Text>

      <Text
        style={
          styles.detailBoxValue
        }
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function ActionButton({
  icon,
  color,
  text,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionIcon,
          {
            backgroundColor:
              `${color}18`,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={color}
        />
      </View>

      <Text
        style={
          styles.actionText
        }
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
}

function OptionButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.optionButton,
        selected &&
          styles.optionButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.optionText,
          selected &&
            styles.optionTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* =========================
   HELPERS
========================= */

function getReportIcon(
  type: ReportType
): keyof typeof MaterialCommunityIcons.glyphMap {
  switch (type) {
    case 'Student':
      return 'account-group-outline';

    case 'Attendance':
      return 'calendar-check-outline';

    case 'Fees':
      return 'cash-multiple';

    case 'Academic':
      return 'school-outline';

    case 'Staff':
      return 'account-tie-outline';
  }
}

function getReportColor(
  type: ReportType
) {
  switch (type) {
    case 'Student':
      return '#2675E8';

    case 'Attendance':
      return '#35B878';

    case 'Fees':
      return '#F7941D';

    case 'Academic':
      return '#7040D5';

    case 'Staff':
      return '#E95386';
  }
}

function getStatusColor(
  status: ReportStatus
) {
  switch (status) {
    case 'Generated':
      return {
        bg: '#E7F8EF',
        text: '#22945F',
      };

    case 'Pending':
      return {
        bg: '#FFF1E2',
        text: '#D97900',
      };

    case 'Scheduled':
      return {
        bg: '#EAF2FF',
        text: '#2675E8',
      };
  }
}

/* =========================
   STYLES
========================= */

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

  generateButton: {
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  generateButtonText: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
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

  /* SUMMARY */

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
    fontSize: 8.8,
    lineHeight: 12,
    marginTop: 3,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 13.5,
  },

  /* SEARCH */

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

  /* FILTER */

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

  /* LIST */

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

  /* REPORT CARD */

  reportCard: {
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

  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportIconBox: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportMain: {
    flex: 1,
    marginLeft: 10,
  },

  reportTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#172033',
    fontSize: 12.5,
  },

  reportId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8.5,
    marginTop: 1,
  },

  moreButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportDescription: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 11,
  },

  reportDetails: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  detailItem: {
    flex: 1,
    minWidth: 95,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  detailItemLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#9AA2B1',
    fontSize: 7.5,
  },

  detailItemValue: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 8.5,
    marginTop: 1,
  },

  reportFooter: {
    marginTop: 13,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  typeBadge: {
    backgroundColor: '#F1EAFF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  typeBadgeText: {
    fontFamily: 'PoppinsMedium',
    color: '#7040D5',
    fontSize: 7.5,
  },

  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
  },

  formatText: {
    fontFamily: 'PoppinsMedium',
    color: '#8A93A4',
    fontSize: 8,
  },

  /* EMPTY */

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

  /* MODALS */

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

  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#313B4E',
  },

  /* VIEW */

  reportPreview: {
    backgroundColor: '#F8F9FC',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },

  previewIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previewTitle: {
    fontFamily: 'PoppinsBold',
    color: '#172033',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },

  previewId: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 9,
    marginTop: 2,
  },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginTop: 14,
  },

  detailBox: {
    width: '48%',
    minHeight: 68,
    backgroundColor: '#F8F9FC',
    borderRadius: 10,
    padding: 10,
  },

  detailBoxLabel: {
    fontFamily: 'PoppinsRegular',
    color: '#8A93A4',
    fontSize: 8,
  },

  detailBoxValue: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10,
    marginTop: 4,
  },

  sectionLabel: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 11,
    marginTop: 15,
    marginBottom: 6,
  },

  descriptionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 10,
    padding: 12,
  },

  descriptionText: {
    fontFamily: 'PoppinsRegular',
    color: '#687386',
    fontSize: 9.5,
    lineHeight: 16,
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

  /* GENERATE */

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    color: '#59657A',
    fontSize: 9.5,
    marginBottom: 5,
    marginTop: 10,
  },

  optionContainer: {
    gap: 7,
    paddingBottom: 2,
  },

  optionButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E5EC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonActive: {
    backgroundColor: '#F1EAFF',
    borderColor: '#7040D5',
  },

  optionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#687386',
  },

  optionTextActive: {
    color: '#7040D5',
    fontFamily: 'PoppinsSemiBold',
  },

  dateInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E3EA',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateTextInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#172033',
  },

  generatePreview: {
    marginTop: 16,
    backgroundColor: '#F1EAFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  generatePreviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    color: '#313B4E',
    fontSize: 10.5,
  },

  generatePreviewText: {
    fontFamily: 'PoppinsRegular',
    color: '#7B8496',
    fontSize: 8.5,
    marginTop: 2,
  },
});