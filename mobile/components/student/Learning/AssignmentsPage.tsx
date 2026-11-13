import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { API_BASE_URL } from '../../../config/api';
import { getToken } from '../../../services/auth';
import { fetchAssignments, AssignmentRecord } from '../../../services/assignments';
import LearningTabNav, { LearningTabKey } from './LearningTabNav';

type AssignmentsPageProps = {
  onContentScroll?: (event: any) => void;
  onNavigate?: (page: LearningTabKey) => void;
};

type Assignment = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string;
  assignedDate?: string;
  status: 'Pending' | 'Submitted' | 'Graded';
  marks?: string;
  feedback?: string;
  assignmentType?: string;
  attachment?: {
    fileName?: string;
    filePath?: string;
    mimeType?: string;
    fileSize?: number;
  };
};

const filters = [
  'All',
  'Pending',
  'Submitted',
  'Graded',
];

export default function AssignmentsPage({
  onContentScroll,
  onNavigate,
}: AssignmentsPageProps) {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      const records = await fetchAssignments();
      const mapped: Assignment[] = records.map((item) => {
        const subName =
          typeof item.subjectId === 'object' && item.subjectId?.name
            ? item.subjectId.name
            : 'Subject';

        const due = item.submissionDate
          ? new Date(item.submissionDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'No due date';

        const assigned = item.assignedDate
          ? new Date(item.assignedDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : undefined;

        return {
          id: item._id,
          title: item.assignmentTitle,
          subject: subName,
          description:
            item.description ||
            item.instructions ||
            'Review the assignment instructions and solve all required questions.',
          dueDate: due,
          assignedDate: assigned,
          status: 'Pending' as const,
          marks: item.totalMarks ? `${item.totalMarks} Marks` : undefined,
          assignmentType: item.assignmentType,
          attachment: item.attachment,
        };
      });

      setAssignmentsList(mapped);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
  };

  const handleDownloadAttachment = async (assignment: Assignment) => {
    if (!assignment.attachment?.fileName) {
      Alert.alert('Notice', 'No attachment file available for this assignment.');
      return;
    }

    try {
      setDownloadingId(assignment.id);
      const token = await getToken();
      const url = `${API_BASE_URL}/assignments/${encodeURIComponent(assignment.id)}/attachment`;
      const rawName = assignment.attachment.fileName || 'assignment.pdf';
      const cleanName = rawName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
      const localUri = `${baseDir}${cleanName.endsWith('.pdf') ? cleanName : `${cleanName}.pdf`}`;

      const downloadResult = await FileSystem.downloadAsync(url, localUri, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (downloadResult.status >= 200 && downloadResult.status < 300) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: assignment.attachment.mimeType || 'application/pdf',
            dialogTitle: assignment.attachment.fileName,
            UTI: 'com.adobe.pdf',
          });
        } else {
          Alert.alert(
            'Download Complete',
            `Attachment saved to: ${downloadResult.uri}`,
          );
        }
      } else {
        Alert.alert('Download Failed', `Could not download attachment file (status ${downloadResult.status}).`);
      }
    } catch (error: any) {
      console.error('Attachment download error:', error);
      Alert.alert(
        'Download Error',
        error?.message || 'Failed to download attachment.',
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const filteredAssignments = useMemo(() => {
    if (selectedFilter === 'All') {
      return assignmentsList;
    }

    return assignmentsList.filter(
      (assignment) => assignment.status === selectedFilter,
    );
  }, [selectedFilter, assignmentsList]);

  const pendingCount = assignmentsList.filter(
    (assignment) => assignment.status === 'Pending',
  ).length;

  const submittedCount = assignmentsList.filter(
    (assignment) => assignment.status === 'Submitted',
  ).length;

  const gradedCount = assignmentsList.filter(
    (assignment) => assignment.status === 'Graded',
  ).length;

  const getSubjectIcon = (subject: string) => {
    if (subject === 'Physics') {
      return 'flash-outline';
    }

    if (subject === 'Mathematics') {
      return 'calculator-outline';
    }

    return 'flask-outline';
  };

  const getSubjectColors = (subject: string) => {
    if (subject === 'Physics') {
      return {
        background: '#EAF4FF',
        icon: '#2563EB',
      };
    }

    if (subject === 'Mathematics') {
      return {
        background: '#EEE7FF',
        icon: '#6630D7',
      };
    }

    return {
      background: '#EAFBF1',
      icon: '#16A34A',
    };
  };

  const getStatusColors = (status: Assignment['status']) => {
    if (status === 'Pending') {
      return {
        background: '#FFF1DD',
        text: '#C56A00',
      };
    }

    if (status === 'Submitted') {
      return {
        background: '#EAF4FF',
        text: '#2563EB',
      };
    }

    return {
      background: '#EAFBF1',
      text: '#16A34A',
    };
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>
              Assignments
            </Text>

            <Text style={styles.subtitle}>
              Track and manage your assignments
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons
              name="document-text-outline"
              size={23}
              color="#6630D7"
            />
          </View>
        </View>

        {/* Learning Navigation Tabs */}
        <LearningTabNav
          activeTab="assignments"
          onNavigate={onNavigate}
        />

        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#6630D7" />
            <Text style={styles.loadingText}>Loading assignments...</Text>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#FFF1DD',
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={18}
                color="#C56A00"
              />
            </View>

            <Text style={styles.summaryValue}>
              {pendingCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Pending
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
                name="paper-plane-outline"
                size={18}
                color="#2563EB"
              />
            </View>

            <Text style={styles.summaryValue}>
              {submittedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Submitted
            </Text>
          </View>

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
                size={18}
                color="#16A34A"
              />
            </View>

            <Text style={styles.summaryValue}>
              {gradedCount}
            </Text>

            <Text style={styles.summaryLabel}>
              Graded
            </Text>
          </View>
        </View>

        {/* Filter */}
        <Text style={styles.sectionTitle}>
          Assignment Status
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {filters.map((filter) => {
            const selected =
              selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                onPress={() =>
                  setSelectedFilter(filter)
                }
                style={[
                  styles.filterChip,
                  selected &&
                    styles.filterChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected &&
                      styles.filterTextSelected,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Assignment List */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>
            My Assignments
          </Text>

          <Text style={styles.countText}>
            {filteredAssignments.length} total
          </Text>
        </View>

        {filteredAssignments.map((assignment) => {
          const subjectColors =
            getSubjectColors(assignment.subject);

          const statusColors =
            getStatusColors(assignment.status);

          return (
            <View
              key={assignment.id}
              style={styles.assignmentCard}
            >
              {/* Top */}
              <View style={styles.assignmentTop}>
                <View
                  style={[
                    styles.subjectIcon,
                    {
                      backgroundColor:
                        subjectColors.background,
                    },
                  ]}
                >
                  <Ionicons
                    name={getSubjectIcon(
                      assignment.subject,
                    )}
                    size={21}
                    color={subjectColors.icon}
                  />
                </View>

                <View style={styles.assignmentMain}>
                  <Text style={styles.assignmentTitle}>
                    {assignment.title}
                  </Text>

                  <Text style={styles.assignmentSubject}>
                    {assignment.subject}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        statusColors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: statusColors.text,
                      },
                    ]}
                  >
                    {assignment.status}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text
                style={styles.description}
                numberOfLines={3}
              >
                {assignment.description}
              </Text>

              {/* Due Date */}
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={14}
                    color="#888"
                  />

                  <View style={styles.infoTextWrapper}>
                    <Text style={styles.infoLabel}>
                      Due Date
                    </Text>

                    <Text style={styles.infoValue}>
                      {assignment.dueDate}
                    </Text>
                  </View>
                </View>

                {assignment.marks && (
                  <View style={styles.marksBox}>
                    <Text style={styles.marksLabel}>
                      Marks
                    </Text>

                    <Text style={styles.marksValue}>
                      {assignment.marks}
                    </Text>
                  </View>
                )}
              </View>

              {/* Feedback */}
              {assignment.feedback && (
                <View style={styles.feedbackBox}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={15}
                    color="#6630D7"
                  />

                  <View style={styles.feedbackContent}>
                    <Text style={styles.feedbackLabel}>
                      Teacher Feedback
                    </Text>

                    <Text style={styles.feedbackText}>
                      {assignment.feedback}
                    </Text>
                  </View>
                </View>
              )}

              {/* Attachment Download */}
              {assignment.attachment?.fileName && (
                <Pressable
                  style={styles.attachmentButton}
                  onPress={() => handleDownloadAttachment(assignment)}
                  disabled={downloadingId === assignment.id}
                >
                  {downloadingId === assignment.id ? (
                    <ActivityIndicator size="small" color="#6630D7" />
                  ) : (
                    <Ionicons
                      name="document-attach-outline"
                      size={15}
                      color="#6630D7"
                    />
                  )}

                  <Text style={styles.attachmentText} numberOfLines={1}>
                    {assignment.attachment.fileName}
                  </Text>

                  <Ionicons
                    name="download-outline"
                    size={14}
                    color="#6630D7"
                  />
                </Pressable>
              )}

              {/* Action */}
              <Pressable
                style={[
                  styles.actionButton,
                  assignment.status === 'Graded' &&
                    styles.actionButtonGraded,
                ]}
                onPress={() => {
                  if (assignment.attachment?.fileName) {
                    void handleDownloadAttachment(assignment);
                  } else {
                    Alert.alert(
                      assignment.title,
                      assignment.description,
                    );
                  }
                }}
              >
                <Ionicons
                  name={
                    assignment.attachment?.fileName
                      ? 'download-outline'
                      : assignment.status === 'Pending'
                        ? 'cloud-upload-outline'
                        : 'eye-outline'
                  }
                  size={16}
                  color={
                    assignment.status === 'Graded'
                      ? '#6630D7'
                      : '#fff'
                  }
                />

                <Text
                  style={[
                    styles.actionText,
                    assignment.status === 'Graded' &&
                      styles.actionTextGraded,
                  ]}
                >
                  {assignment.attachment?.fileName
                    ? 'Download Worksheet / PDF'
                    : assignment.status === 'Pending'
                      ? 'Submit Assignment'
                      : 'View Assignment'}
                </Text>
              </Pressable>
            </View>
          );
        })}

        {/* Empty State */}
        {filteredAssignments.length === 0 && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={29}
                color="#6630D7"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No Assignments Found
            </Text>

            <Text style={styles.emptyText}>
              There are no assignments in this category.
            </Text>
          </View>
        )}

        {/* Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoCardIcon}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6630D7"
            />
          </View>

          <View style={styles.infoCardContent}>
            <Text style={styles.infoCardTitle}>
              Assignment Updates
            </Text>

            <Text style={styles.infoCardText}>
              Your teachers can add assignments, update
              due dates, review submissions and provide
              feedback here.
            </Text>
          </View>
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 17,
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#292532',
  },

  subtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
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
    width: 35,
    height: 35,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#333',
  },

  summaryLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  filterContainer: {
    gap: 8,
    paddingBottom: 17,
  },

  filterChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E0EC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  filterChipSelected: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#666',
  },

  filterTextSelected: {
    color: '#fff',
  },

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#6630D7',
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },

  assignmentCard: {
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

  assignmentTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  subjectIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  assignmentMain: {
    flex: 1,
  },

  assignmentTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#333',
  },

  assignmentSubject: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
  },

  description: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    lineHeight: 13,
    color: '#777',
    marginTop: 11,
  },

  infoRow: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDF3',
    marginTop: 11,
    paddingTop: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoTextWrapper: {
    marginLeft: 6,
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#555',
    marginTop: 1,
  },

  marksBox: {
    alignItems: 'flex-end',
  },

  marksLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
  },

  marksValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 10,
    color: '#16A34A',
    marginTop: 1,
  },

  feedbackBox: {
    backgroundColor: '#F3EEFF',
    borderRadius: 10,
    padding: 9,
    flexDirection: 'row',
    marginTop: 10,
  },

  feedbackContent: {
    flex: 1,
    marginLeft: 6,
  },

  feedbackLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7,
    color: '#6630D7',
  },

  feedbackText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    lineHeight: 11,
    color: '#75678E',
    marginTop: 2,
  },

  actionButton: {
    height: 35,
    borderRadius: 10,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 11,
  },

  actionButtonGraded: {
    backgroundColor: '#EEE7FF',
  },

  actionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#fff',
    marginLeft: 5,
  },

  actionTextGraded: {
    color: '#6630D7',
  },

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },

  emptyIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#333',
    marginTop: 10,
  },

  emptyText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },

  infoCard: {
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
  },

  infoCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  infoCardContent: {
    flex: 1,
  },

  infoCardTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#4B278F',
  },

  infoCardText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    lineHeight: 12,
    color: '#66558A',
    marginTop: 3,
  },

  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F1FD',
    borderWidth: 1,
    borderColor: '#D8CAF8',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
    gap: 6,
  },

  attachmentText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#6630D7',
  },

  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },

  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#888',
    marginTop: 8,
  },
});
