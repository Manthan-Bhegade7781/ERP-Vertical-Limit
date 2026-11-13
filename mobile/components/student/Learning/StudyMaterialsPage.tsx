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
import { getMyClasses, StudentClassesData } from '../../../services/classes';
import LearningTabNav, { LearningTabKey } from './LearningTabNav';

type StudyMaterialsPageProps = {
  onContentScroll?: (event: any) => void;
  onNavigate?: (page: LearningTabKey) => void;
};

type MaterialType =
  | 'All'
  | 'PDF'
  | 'Document'
  | 'Worksheet'
  | 'Revision'
  | 'Homework';

type StudyMaterial = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  type: MaterialType;
  size?: string;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  background: string;
  attachment?: {
    fileName?: string;
    filePath?: string;
    mimeType?: string;
    fileSize?: number;
  };
  description?: string;
};

export default function StudyMaterialsPage({
  onContentScroll,
  onNavigate,
}: StudyMaterialsPageProps) {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [classesData, setClassesData] = useState<StudentClassesData | null>(null);
  const [materialsList, setMaterialsList] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [assignments, classes] = await Promise.all([
        fetchAssignments().catch(() => []),
        getMyClasses().catch(() => null),
      ]);

      if (classes) setClassesData(classes);

      const mapped: StudyMaterial[] = assignments.map((item) => {
        const subName =
          typeof item.subjectId === 'object' && item.subjectId?.name
            ? item.subjectId.name
            : 'General';

        const teacherName =
          typeof item.batchId === 'object' && (item as any).createdBy?.fullName
            ? (item as any).createdBy.fullName
            : 'Faculty';

        const isPdf =
          Boolean(item.attachment?.fileName) ||
          item.assignmentType === 'worksheet' ||
          item.assignmentType === 'homework';

        let formattedSize: string | undefined;
        if (item.attachment?.fileSize) {
          const kb = item.attachment.fileSize / 1024;
          formattedSize =
            kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
        } else if (item.attachment?.fileName) {
          formattedSize = 'PDF Document';
        }

        const dateStr = item.assignedDate
          ? new Date(item.assignedDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent';

        return {
          id: item._id,
          title: item.assignmentTitle,
          subject: subName,
          teacher: teacherName,
          type: item.attachment?.fileName ? 'PDF' : 'Document',
          size: formattedSize,
          date: dateStr,
          icon: isPdf ? 'document-text-outline' : 'document-outline',
          color: isPdf ? '#E4515D' : '#1670E8',
          background: isPdf ? '#FFE9EA' : '#E6F0FF',
          attachment: item.attachment,
          description: item.description || item.instructions,
        };
      });

      setMaterialsList(mapped);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleOpenMaterial = async (material: StudyMaterial) => {
    if (!material.attachment?.fileName) {
      Alert.alert(
        material.title,
        material.description ||
          'This resource has no downloadable file attached.',
      );
      return;
    }

    try {
      setDownloadingId(material.id);
      const token = await getToken();
      const url = `${API_BASE_URL}/assignments/${material.id}/attachment`;
      const localUri = `${FileSystem.documentDirectory}${material.attachment.fileName}`;

      const res = await FileSystem.downloadAsync(url, localUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(res.uri, {
            mimeType: material.attachment.mimeType || 'application/pdf',
            dialogTitle: material.attachment.fileName,
          });
        } else {
          Alert.alert('Downloaded', `File saved to ${res.uri}`);
        }
      } else {
        Alert.alert('Download Failed', 'Could not download attachment.');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      Alert.alert('Error', err?.message || 'Could not download resource.');
    } finally {
      setDownloadingId(null);
    }
  };

  const availableSubjects = useMemo(() => {
    const list = ['All'];
    if (classesData?.currentBatch?.subjects) {
      classesData.currentBatch.subjects.forEach((s) => {
        if (s.name && !list.includes(s.name)) {
          list.push(s.name);
        }
      });
    }
    return list;
  }, [classesData]);

  const filteredMaterials = useMemo(() => {
    return materialsList.filter((material) => {
      const subjectMatch =
        selectedSubject === 'All' ||
        material.subject.toLowerCase() === selectedSubject.toLowerCase();

      const typeMatch =
        selectedType === 'All' ||
        material.type.toLowerCase() === selectedType.toLowerCase();

      return subjectMatch && typeMatch;
    });
  }, [selectedSubject, selectedType, materialsList]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
          <View style={styles.headerContent}>
            <Text style={styles.title}>Study Materials</Text>

            <Text style={styles.subtitle}>
              Notes and resources shared by your teachers
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="library-outline" size={24} color="#6630D7" />
          </View>
        </View>

        {/* Learning Navigation Tabs */}
        <View style={{ paddingHorizontal: 16 }}>
          <LearningTabNav
            activeTab="studyMaterials"
            onNavigate={onNavigate}
          />
        </View>

        {/* Loading */}
        {loading && (
          <View style={{ paddingVertical: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#6630D7" />
            <Text
              style={{
                fontFamily: 'PoppinsRegular',
                fontSize: 10,
                color: '#888',
                marginTop: 6,
              }}
            >
              Loading resources...
            </Text>
          </View>
        )}

        {/* Quick Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Ionicons name="folder-open-outline" size={22} color="#6630D7" />
          </View>

          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Learning Library</Text>

            <Text style={styles.summaryText}>
              {materialsList.length} resources available
            </Text>
          </View>

          <View style={styles.resourceCount}>
            <Text style={styles.resourceCountText}>
              {filteredMaterials.length}
            </Text>

            <Text style={styles.resourceCountLabel}>Showing</Text>
          </View>
        </View>

        {/* Subject Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Subject</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {availableSubjects.map((subject) => {
              const selected = selectedSubject === subject;

              return (
                <Pressable
                  key={subject}
                  style={[
                    styles.filterButton,
                    selected && styles.selectedFilter,
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.selectedFilterText,
                    ]}
                  >
                    {subject}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Type Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Material Type</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            {['All', 'PDF', 'Document'].map((type) => {
              const selected = selectedType === type;

              return (
                <Pressable
                  key={type}
                  style={[
                    styles.filterButton,
                    selected && styles.selectedFilter,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.selectedFilterText,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Materials */}
        <View style={styles.materialSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Available Materials</Text>

              <Text style={styles.sectionSubtitle}>
                Select a resource to open or download
              </Text>
            </View>

            <Text style={styles.resultCount}>{filteredMaterials.length}</Text>
          </View>

          {filteredMaterials.map((material, index) => (
            <Pressable
              key={material.id}
              style={({ pressed }) => [
                styles.materialCard,
                index !== filteredMaterials.length - 1 && styles.materialBorder,
                pressed && styles.pressed,
              ]}
              onPress={() => handleOpenMaterial(material)}
              disabled={downloadingId === material.id}
            >
              <View
                style={[
                  styles.materialIcon,
                  {
                    backgroundColor: material.background,
                  },
                ]}
              >
                {downloadingId === material.id ? (
                  <ActivityIndicator size="small" color={material.color} />
                ) : (
                  <Ionicons
                    name={material.icon}
                    size={21}
                    color={material.color}
                  />
                )}
              </View>

              <View style={styles.materialContent}>
                <Text style={styles.materialTitle} numberOfLines={2}>
                  {material.title}
                </Text>

                <Text style={styles.materialSubject}>
                  {material.subject} • {material.teacher}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.typeBadge}>
                    <Text
                      style={[
                        styles.typeBadgeText,
                        {
                          color: material.color,
                        },
                      ]}
                    >
                      {material.type}
                    </Text>
                  </View>

                  {material.size && (
                    <>
                      <View style={styles.metaDot} />

                      <Text style={styles.metaText}>{material.size}</Text>
                    </>
                  )}

                  <View style={styles.metaDot} />

                  <Text style={styles.metaText}>{material.date}</Text>
                </View>
              </View>

              <Ionicons
                name={
                  material.attachment?.fileName
                    ? 'download-outline'
                    : 'chevron-forward'
                }
                size={18}
                color={material.attachment?.fileName ? '#6630D7' : '#A0A0AA'}
              />
            </Pressable>
          ))}

          {filteredMaterials.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="folder-open-outline"
                  size={28}
                  color="#6630D7"
                />
              </View>

              <Text style={styles.emptyTitle}>No materials found</Text>

              <Text style={styles.emptyText}>
                No study materials or worksheets have been shared for your batch
                yet.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ===================================== */
/* Styles */
/* ===================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 110,
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    color: '#111528',
    fontSize: 22,
    fontFamily: 'PoppinsBold',
  },

  subtitle: {
    color: '#858592',
    fontSize: 9,
    fontFamily: 'PoppinsMedium',
    marginTop: 1,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  /* Summary */

  summaryCard: {
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  summaryContent: {
    flex: 1,
  },

  summaryTitle: {
    color: '#171A2B',
    fontSize: 11.5,
    fontFamily: 'PoppinsBold',
  },

  summaryText: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  resourceCount: {
    alignItems: 'center',
    paddingLeft: 10,
  },

  resourceCountText: {
    color: '#6630D7',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  resourceCountLabel: {
    color: '#9999A5',
    fontSize: 7,
    fontFamily: 'PoppinsMedium',
  },

  /* Filters */

  filterSection: {
    marginTop: 14,
  },

  filterTitle: {
    color: '#555564',
    fontSize: 9.5,
    fontFamily: 'PoppinsBold',
    marginLeft: 16,
    marginBottom: 6,
  },

  filterContainer: {
    paddingHorizontal: 16,
    gap: 7,
  },

  filterButton: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  selectedFilter: {
    backgroundColor: '#6630D7',
  },

  filterText: {
    color: '#777784',
    fontSize: 8.5,
    fontFamily: 'PoppinsSemiBold',
  },

  selectedFilterText: {
    color: '#FFFFFF',
  },

  /* Materials */

  materialSection: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 15,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  sectionTitle: {
    color: '#171A2B',
    fontSize: 14.5,
    fontFamily: 'PoppinsBold',
  },

  sectionSubtitle: {
    color: '#858592',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    marginTop: 1,
  },

  resultCount: {
    width: 26,
    height: 26,
    borderRadius: 9,
    backgroundColor: '#EEE7FF',
    color: '#6630D7',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 9,
    fontFamily: 'PoppinsBold',
    overflow: 'hidden',
    paddingTop: 5,
  },

  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  materialBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEF3',
  },

  materialIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  materialContent: {
    flex: 1,
    paddingRight: 7,
  },

  materialTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    lineHeight: 15,
    fontFamily: 'PoppinsBold',
  },

  materialSubject: {
    color: '#777784',
    fontSize: 8,
    fontFamily: 'PoppinsMedium',
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    flexWrap: 'wrap',
  },

  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F5F3FA',
  },

  typeBadgeText: {
    fontSize: 6.8,
    fontFamily: 'PoppinsBold',
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#B5B5BE',
    marginHorizontal: 5,
  },

  metaText: {
    color: '#9999A5',
    fontSize: 7,
    fontFamily: 'PoppinsRegular',
  },

  /* Empty */

  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyTitle: {
    color: '#555564',
    fontSize: 11,
    fontFamily: 'PoppinsBold',
    marginTop: 8,
  },

  emptyText: {
    color: '#9999A5',
    fontSize: 8.5,
    fontFamily: 'PoppinsRegular',
    textAlign: 'center',
    marginTop: 3,
  },

  /* Recent */

  recentCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 13,
    borderRadius: 17,
    backgroundColor: '#F8F5FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  recentIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  recentContent: {
    flex: 1,
  },

  recentTitle: {
    color: '#171A2B',
    fontSize: 10.5,
    fontFamily: 'PoppinsBold',
  },

  recentText: {
    color: '#777784',
    fontSize: 8.5,
    lineHeight: 13,
    fontFamily: 'PoppinsRegular',
    marginTop: 2,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },

  bottomSpace: {
    height: 25,
  },
});