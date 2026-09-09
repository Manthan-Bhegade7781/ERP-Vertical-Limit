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
  View,
  useWindowDimensions,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

type BatchStatus =
  | 'Active'
  | 'Intermediate'
  | 'Upcoming'
  | 'Completed'
  | 'Stopped';

type Batch = {
  id: string;
  name: string;
  code: string;
  course: string;
  branch: string;
  trainer: string;
  startDate: string;
  endDate: string;
  students: number;
  capacity: number;
  schedule: string;
  status: BatchStatus;
  stopReason?: string;
  stoppedDate?: string;
};

const initialBatches: Batch[] = [
  {
    id: '1',
    name: 'Professional Makeup - Morning',
    code: 'VLCC-BAT-001',
    course: 'Professional Makeup',
    branch: 'Pune Branch',
    trainer: 'Anita Sharma',
    startDate: '01 Jun 2026',
    endDate: '31 Aug 2026',
    students: 32,
    capacity: 40,
    schedule: 'Mon - Fri, 9:00 AM',
    status: 'Active',
  },
  {
    id: '2',
    name: 'Beauty Therapy - Evening',
    code: 'VLCC-BAT-002',
    course: 'Beauty Therapy',
    branch: 'Mumbai Branch',
    trainer: 'Priya Mehta',
    startDate: '15 May 2026',
    endDate: '14 Nov 2026',
    students: 38,
    capacity: 45,
    schedule: 'Mon - Fri, 4:00 PM',
    status: 'Active',
  },
  {
    id: '3',
    name: 'Hair Dressing - Morning',
    code: 'VLCC-BAT-003',
    course: 'Hair Dressing',
    branch: 'Pune Branch',
    trainer: 'Rohit Patil',
    startDate: '01 Jul 2026',
    endDate: '31 Oct 2026',
    students: 28,
    capacity: 35,
    schedule: 'Mon - Fri, 9:30 AM',
    status: 'Intermediate',
  },
  {
    id: '4',
    name: 'Skin Care Specialist',
    code: 'VLCC-BAT-004',
    course: 'Skin Care Specialist',
    branch: 'Nashik Branch',
    trainer: 'Sneha Joshi',
    startDate: '15 Sep 2026',
    endDate: '14 Mar 2027',
    students: 24,
    capacity: 30,
    schedule: 'Mon - Sat, 10:00 AM',
    status: 'Upcoming',
  },
  {
    id: '5',
    name: 'Nail Art Professional',
    code: 'VLCC-BAT-005',
    course: 'Nail Art Professional',
    branch: 'Nagpur Branch',
    trainer: 'Neha Kulkarni',
    startDate: '01 Apr 2026',
    endDate: '31 May 2026',
    students: 22,
    capacity: 25,
    schedule: 'Mon - Fri, 2:00 PM',
    status: 'Completed',
  },
  {
    id: '6',
    name: 'Advanced Beauty Therapy',
    code: 'VLCC-BAT-006',
    course: 'Beauty Therapy',
    branch: 'Mumbai Branch',
    trainer: 'Kavita Deshmukh',
    startDate: '01 Jan 2026',
    endDate: '30 Jun 2026',
    students: 30,
    capacity: 35,
    schedule: 'Mon - Fri, 11:00 AM',
    status: 'Stopped',
    stopReason:
      'Batch stopped midway due to trainer availability and operational changes.',
    stoppedDate: '28 Mar 2026',
  },
];

const statusConfig: Record<
  BatchStatus,
  {
    background: string;
    text: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    chartColor: string;
  }
> = {
  Active: {
    background: '#E7F8EF',
    text: '#20A463',
    icon: 'play-circle-outline',
    chartColor: '#35B878',
  },
  Intermediate: {
    background: '#F1EAFF',
    text: '#7040D5',
    icon: 'progress-clock',
    chartColor: '#7040D5',
  },
  Upcoming: {
    background: '#FFF1E2',
    text: '#E88913',
    icon: 'clock-outline',
    chartColor: '#F7941D',
  },
  Completed: {
    background: '#EAF2FF',
    text: '#2675E8',
    icon: 'check-circle-outline',
    chartColor: '#2675E8',
  },
  Stopped: {
    background: '#FFE9F0',
    text: '#E95386',
    icon: 'pause-circle-outline',
    chartColor: '#E95386',
  },
};

const chartStatuses: BatchStatus[] = [
  'Active',
  'Intermediate',
  'Upcoming',
  'Completed',
  'Stopped',
];

function BatchStatusDonut({
  counts,
  total,
}: {
  counts: Record<BatchStatus, number>;
  total: number;
}) {
  const size = 78;
  const strokeWidth = 9;
  const radius = 29;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <View style={styles.donutWrapper}>
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F0F1F5"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {chartStatuses.map((status) => {
          const value = counts[status];

          if (value === 0) {
            return null;
          }

          const segmentLength =
            (value / total) * circumference;

          const gap = Math.min(
            2.5,
            segmentLength * 0.08,
          );

          const visibleLength = Math.max(
            segmentLength - gap,
            0,
          );

          const dashOffset = -accumulated;

          accumulated += segmentLength;

          return (
            <Circle
              key={status}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={statusConfig[status].chartColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${visibleLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          );
        })}
      </Svg>

      <View style={styles.donutCenter}>
        <Text style={styles.donutTotal}>{total}</Text>
        <Text style={styles.donutLabel}>Batches</Text>
      </View>
    </View>
  );
}

export default function BatchesPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 390;

  const [batches, setBatches] =
    useState<Batch[]>(initialBatches);

  const [search, setSearch] = useState('');

  const [filter, setFilter] = useState<
    'All' | BatchStatus
  >('All');

  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);

  const [actionVisible, setActionVisible] =
    useState(false);

  const [viewVisible, setViewVisible] =
    useState(false);

  const [editVisible, setEditVisible] =
    useState(false);

  const [editName, setEditName] = useState('');
  const [editCourse, setEditCourse] = useState('');
  const [editBranch, setEditBranch] = useState('');
  const [editTrainer, setEditTrainer] = useState('');
  const [editSchedule, setEditSchedule] = useState('');

  const filteredBatches = useMemo(() => {
    const value = search.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch =
        !value ||
        batch.name.toLowerCase().includes(value) ||
        batch.code.toLowerCase().includes(value) ||
        batch.course.toLowerCase().includes(value) ||
        batch.branch.toLowerCase().includes(value) ||
        batch.trainer.toLowerCase().includes(value);

      const matchesFilter =
        filter === 'All' ||
        batch.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [batches, search, filter]);

  const activeCount = batches.filter(
    (batch) => batch.status === 'Active',
  ).length;

  const intermediateCount = batches.filter(
    (batch) => batch.status === 'Intermediate',
  ).length;

  const upcomingCount = batches.filter(
    (batch) => batch.status === 'Upcoming',
  ).length;

  const completedCount = batches.filter(
    (batch) => batch.status === 'Completed',
  ).length;

  const stoppedCount = batches.filter(
    (batch) => batch.status === 'Stopped',
  ).length;

  const totalStudents = batches.reduce(
    (sum, batch) => sum + batch.students,
    0,
  );

  const statusCounts: Record<BatchStatus, number> = {
    Active: activeCount,
    Intermediate: intermediateCount,
    Upcoming: upcomingCount,
    Completed: completedCount,
    Stopped: stoppedCount,
  };

  const openActions = (batch: Batch) => {
    setSelectedBatch(batch);
    setActionVisible(true);
  };

  const openView = () => {
    setActionVisible(false);
    setViewVisible(true);
  };

  const openEdit = () => {
    if (!selectedBatch) return;

    setEditName(selectedBatch.name);
    setEditCourse(selectedBatch.course);
    setEditBranch(selectedBatch.branch);
    setEditTrainer(selectedBatch.trainer);
    setEditSchedule(selectedBatch.schedule);

    setActionVisible(false);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!selectedBatch) return;

    if (
      !editName.trim() ||
      !editCourse.trim() ||
      !editTrainer.trim()
    ) {
      Alert.alert(
        'Required Fields',
        'Please enter batch name, course and trainer.',
      );
      return;
    }

    setBatches((current) =>
      current.map((batch) =>
        batch.id === selectedBatch.id
          ? {
              ...batch,
              name: editName.trim(),
              course: editCourse.trim(),
              branch: editBranch.trim(),
              trainer: editTrainer.trim(),
              schedule: editSchedule.trim(),
            }
          : batch,
      ),
    );

    setSelectedBatch(null);
    setEditVisible(false);
  };

  const deleteBatch = () => {
    if (!selectedBatch) return;

    setActionVisible(false);

    Alert.alert(
      'Delete Batch',
      `Are you sure you want to delete "${selectedBatch.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setBatches((current) =>
              current.filter(
                (batch) =>
                  batch.id !== selectedBatch.id,
              ),
            );

            setSelectedBatch(null);
          },
        },
      ],
    );
  };

  const renderSummaryCard = (
    icon: keyof typeof MaterialCommunityIcons.glyphMap,
    title: string,
    value: string,
    background: string,
    iconColor: string,
  ) => (
    <View
      style={[
        styles.summaryCard,
        {
          width: isSmallScreen ? '48.5%' : '31.8%',
        },
      ]}
    >
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <Text
        style={styles.summaryTitle}
        numberOfLines={1}
      >
        {title}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={styles.safeArea}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            minHeight: insets.top + 66,
          },
        ]}
      >
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

        <Text style={styles.headerTitle}>
          Batches
        </Text>

        <TouchableOpacity
          style={styles.headerAddButton}
          activeOpacity={0.8}
          onPress={() => {
            router.push({
              pathname: '/(tabs)/explore',
              params: {
                feature: 'Create Batch',
              },
            });
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={17}
            color="#7040D5"
          />

          <Text style={styles.headerAddButtonText}>
            Add Batch
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PAGE TITLE */}
        <View style={styles.pageTitleRow}>
          <View style={styles.pageTitleContainer}>
            <Text style={styles.pageTitle}>
              Batch Management
            </Text>

            <Text style={styles.pageSubtitle}>
              Manage courses, trainers and student batches
            </Text>
          </View>


        </View>

        {/* SUMMARY CARDS */}
        <View style={styles.summaryGrid}>
          {renderSummaryCard(
            'google-circles-communities',
            'Total Batches',
            String(batches.length),
            '#F1EAFF',
            '#7040D5',
          )}

          {renderSummaryCard(
            'play-circle-outline',
            'Active Batches',
            String(activeCount),
            '#E7F8EF',
            '#35B878',
          )}

          {renderSummaryCard(
            'progress-clock',
            'Intermediate',
            String(intermediateCount),
            '#F1EAFF',
            '#7040D5',
          )}

          {renderSummaryCard(
            'clock-outline',
            'Upcoming',
            String(upcomingCount),
            '#FFF1E2',
            '#F7941D',
          )}

          {renderSummaryCard(
            'check-circle-outline',
            'Completed',
            String(completedCount),
            '#EAF2FF',
            '#2675E8',
          )}

          {renderSummaryCard(
            'pause-circle-outline',
            'Stopped',
            String(stoppedCount),
            '#FFE9F0',
            '#E95386',
          )}

          {/* TOTAL STUDENTS */}
          <View
            style={[
              styles.summaryCard,
              {
                width: isSmallScreen
                  ? '48.5%'
                  : '31.8%',
              },
            ]}
          >
            <View
              style={[
                styles.summaryIcon,
                {
                  backgroundColor: '#EAF2FF',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={20}
                color="#2675E8"
              />
            </View>

            <Text
              style={styles.summaryTitle}
              numberOfLines={1}
            >
              Total Students
            </Text>

            <Text style={styles.summaryValue}>
              {totalStudents}
            </Text>
          </View>

          {/* REAL DONUT STATUS CARD */}
          <View
            style={[
              styles.statusOverviewCard,
              {
                width: isSmallScreen
                  ? '48.5%'
                  : '31.8%',
              },
            ]}
          >
            <Text style={styles.statusOverviewTitle}>
              Batch Status
            </Text>

            <View style={styles.statusOverviewContent}>
              <BatchStatusDonut
                counts={statusCounts}
                total={batches.length}
              />

              <View style={styles.statusLegend}>
                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          '#35B878',
                      },
                    ]}
                  />

                  <Text
                    style={styles.legendText}
                    numberOfLines={1}
                  >
                    Active {activeCount}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          '#7040D5',
                      },
                    ]}
                  />

                  <Text
                    style={styles.legendText}
                    numberOfLines={1}
                  >
                    Intermediate {intermediateCount}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          '#F7941D',
                      },
                    ]}
                  />

                  <Text
                    style={styles.legendText}
                    numberOfLines={1}
                  >
                    Upcoming {upcomingCount}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          '#2675E8',
                      },
                    ]}
                  />

                  <Text
                    style={styles.legendText}
                    numberOfLines={1}
                  >
                    Completed {completedCount}
                  </Text>
                </View>

                <View style={styles.legendItem}>
                  <View
                    style={[
                      styles.legendDot,
                      {
                        backgroundColor:
                          '#E95386',
                      },
                    ]}
                  />

                  <Text
                    style={styles.legendText}
                    numberOfLines={1}
                  >
                    Stopped {stoppedCount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.toolbar}>
          <View style={styles.searchBox}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#8A93A5"
            />

            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search batches..."
              placeholderTextColor="#9AA2B1"
              style={styles.searchInput}
            />

            {search.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearch('')}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={18}
                  color="#9AA2B1"
                />
              </TouchableOpacity>
            )}
          </View>

          {/* FILTERS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {(
              [
                'All',
                'Active',
                'Intermediate',
                'Upcoming',
                'Completed',
                'Stopped',
              ] as const
            ).map((item) => {
              const selected = filter === item;

              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterButton,
                    selected &&
                      styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter(item)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected &&
                        styles.filterTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {filteredBatches.length} batches found
          </Text>
        </View>

        {/* BATCH LIST */}
        {filteredBatches.map((batch) => {
          const status =
            statusConfig[batch.status];

          const percentage = Math.min(
            Math.round(
              (batch.students /
                batch.capacity) *
                100,
            ),
            100,
          );

          return (
            <View
              key={batch.id}
              style={[
                styles.batchCard,
                batch.status === 'Stopped' &&
                  styles.stoppedBatchCard,
              ]}
            >
              <View style={styles.batchTopRow}>
                <View
                  style={[
                    styles.batchIcon,
                    {
                      backgroundColor:
                        status.background,
                    },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={status.icon}
                    size={23}
                    color={status.text}
                  />
                </View>

                <View style={styles.batchMainInfo}>
                  <Text
                    style={styles.batchName}
                    numberOfLines={2}
                  >
                    {batch.name}
                  </Text>

                  <Text style={styles.batchCode}>
                    {batch.code}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        status.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color: status.text,
                      },
                    ]}
                  >
                    {batch.status}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.moreButton}
                  onPress={() =>
                    openActions(batch)
                  }
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={21}
                    color="#667085"
                  />
                </TouchableOpacity>
              </View>

              {/* STOPPED MID-COURSE */}
              {batch.status === 'Stopped' && (
                <View style={styles.stoppedNotice}>
                  <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={18}
                    color="#E95386"
                  />

                  <View
                    style={styles.stoppedNoticeText}
                  >
                    <Text
                      style={styles.stoppedTitle}
                    >
                      Batch Stopped Mid-Course
                    </Text>

                    <Text
                      style={styles.stoppedReason}
                    >
                      {batch.stopReason}
                    </Text>

                    {batch.stoppedDate && (
                      <Text
                        style={styles.stoppedDate}
                      >
                        Stopped on{' '}
                        {batch.stoppedDate}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="book-open-outline"
                    size={16}
                    color="#7040D5"
                  />

                  <View
                    style={
                      styles.infoTextContainer
                    }
                  >
                    <Text
                      style={styles.infoLabel}
                    >
                      Course
                    </Text>

                    <Text
                      style={styles.infoValue}
                      numberOfLines={1}
                    >
                      {batch.course}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={16}
                    color="#2675E8"
                  />

                  <View
                    style={
                      styles.infoTextContainer
                    }
                  >
                    <Text
                      style={styles.infoLabel}
                    >
                      Branch
                    </Text>

                    <Text
                      style={styles.infoValue}
                      numberOfLines={1}
                    >
                      {batch.branch}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="account-tie-outline"
                    size={16}
                    color="#35B878"
                  />

                  <View
                    style={
                      styles.infoTextContainer
                    }
                  >
                    <Text
                      style={styles.infoLabel}
                    >
                      Trainer
                    </Text>

                    <Text
                      style={styles.infoValue}
                      numberOfLines={1}
                    >
                      {batch.trainer}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="calendar-range"
                    size={16}
                    color="#F7941D"
                  />

                  <View
                    style={
                      styles.infoTextContainer
                    }
                  >
                    <Text
                      style={styles.infoLabel}
                    >
                      Duration
                    </Text>

                    <Text
                      style={styles.infoValue}
                      numberOfLines={2}
                    >
                      {batch.startDate} -{' '}
                      {batch.endDate}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.batchBottom}>
                <View
                  style={styles.scheduleContainer}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={16}
                    color="#748096"
                  />

                  <Text
                    style={styles.scheduleText}
                    numberOfLines={1}
                  >
                    {batch.schedule}
                  </Text>
                </View>

                <View
                  style={styles.capacityContainer}
                >
                  <View
                    style={styles.capacityHeader}
                  >
                    <Text
                      style={styles.capacityLabel}
                    >
                      Students
                    </Text>

                    <Text
                      style={styles.capacityValue}
                    >
                      {batch.students}/
                      {batch.capacity}
                    </Text>
                  </View>

                  <View
                    style={styles.progressTrack}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor:
                            batch.status ===
                            'Stopped'
                              ? '#E95386'
                              : '#7040D5',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {filteredBatches.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="google-circles-communities"
              size={42}
              color="#B6BDCB"
            />

            <Text style={styles.emptyTitle}>
              No batches found
            </Text>

            <Text
              style={styles.emptySubtitle}
            >
              Try changing your search or filter.
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ACTION MODAL */}
      <Modal
        visible={actionVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setActionVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setActionVisible(false)
          }
        >
          <Pressable
            style={styles.actionModal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              Batch Actions
            </Text>

            <Text
              style={styles.modalSubtitle}
              numberOfLines={1}
            >
              {selectedBatch?.name}
            </Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openView}
            >
              <View
                style={styles.actionIconPurple}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.actionText}>
                View Batch
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A7B5"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openEdit}
            >
              <View
                style={styles.actionIconBlue}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color="#2675E8"
                />
              </View>

              <Text style={styles.actionText}>
                Edit Batch
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A7B5"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={deleteBatch}
            >
              <View style={styles.actionIconRed}>
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
                    color: '#D64570',
                  },
                ]}
              >
                Delete Batch
              </Text>

              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#A0A7B5"
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* VIEW MODAL */}
      <Modal
        visible={viewVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Batch Details
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setViewVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedBatch && (
              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
              >
                <View
                  style={[
                    styles.detailHero,
                    selectedBatch.status ===
                      'Stopped' &&
                      styles.detailStoppedHero,
                  ]}
                >
                  <View
                    style={[
                      styles.detailHeroIcon,
                      {
                        backgroundColor:
                          statusConfig[
                            selectedBatch
                              .status
                          ].background,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        statusConfig[
                          selectedBatch
                            .status
                        ].icon
                      }
                      size={30}
                      color={
                        statusConfig[
                          selectedBatch
                            .status
                        ].text
                      }
                    />
                  </View>

                  <Text
                    style={styles.detailName}
                  >
                    {selectedBatch.name}
                  </Text>

                  <Text
                    style={styles.detailCode}
                  >
                    {selectedBatch.code}
                  </Text>

                  <View
                    style={[
                      styles.detailStatus,
                      {
                        backgroundColor:
                          statusConfig[
                            selectedBatch
                              .status
                          ].background,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.detailStatusText,
                        {
                          color:
                            statusConfig[
                              selectedBatch
                                .status
                            ].text,
                        },
                      ]}
                    >
                      {selectedBatch.status}
                    </Text>
                  </View>
                </View>

                {selectedBatch.status ===
                  'Stopped' && (
                  <View
                    style={
                      styles.detailStoppedBox
                    }
                  >
                    <Text
                      style={
                        styles.detailStoppedTitle
                      }
                    >
                      Why was this batch stopped?
                    </Text>

                    <Text
                      style={
                        styles.detailStoppedReason
                      }
                    >
                      {selectedBatch.stopReason}
                    </Text>

                    {selectedBatch.stoppedDate && (
                      <Text
                        style={
                          styles.detailStoppedDate
                        }
                      >
                        Stopped on{' '}
                        {
                          selectedBatch.stoppedDate
                        }
                      </Text>
                    )}
                  </View>
                )}

                {[
                  [
                    'Course',
                    selectedBatch.course,
                  ],
                  [
                    'Branch',
                    selectedBatch.branch,
                  ],
                  [
                    'Trainer',
                    selectedBatch.trainer,
                  ],
                  [
                    'Start Date',
                    selectedBatch.startDate,
                  ],
                  [
                    'End Date',
                    selectedBatch.endDate,
                  ],
                  [
                    'Schedule',
                    selectedBatch.schedule,
                  ],
                  [
                    'Students',
                    `${selectedBatch.students}/${selectedBatch.capacity}`,
                  ],
                  [
                    'Status',
                    selectedBatch.status,
                  ],
                ].map(([label, value]) => (
                  <View
                    key={label}
                    style={styles.detailRow}
                  >
                    <Text
                      style={styles.detailLabel}
                    >
                      {label}
                    </Text>

                    <Text
                      style={styles.detailValue}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditVisible(false)
        }
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit Batch
              </Text>

              <TouchableOpacity
                onPress={() =>
                  setEditVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.inputLabel}>
                Batch Name
              </Text>

              <TextInput
                value={editName}
                onChangeText={setEditName}
                style={styles.input}
                placeholder="Enter batch name"
                placeholderTextColor="#9AA2B1"
              />

              <Text style={styles.inputLabel}>
                Course
              </Text>

              <TextInput
                value={editCourse}
                onChangeText={setEditCourse}
                style={styles.input}
                placeholder="Enter course"
                placeholderTextColor="#9AA2B1"
              />

              <Text style={styles.inputLabel}>
                Branch
              </Text>

              <TextInput
                value={editBranch}
                onChangeText={setEditBranch}
                style={styles.input}
                placeholder="Enter branch"
                placeholderTextColor="#9AA2B1"
              />

              <Text style={styles.inputLabel}>
                Trainer
              </Text>

              <TextInput
                value={editTrainer}
                onChangeText={setEditTrainer}
                style={styles.input}
                placeholder="Enter trainer"
                placeholderTextColor="#9AA2B1"
              />

              <Text style={styles.inputLabel}>
                Schedule
              </Text>

              <TextInput
                value={editSchedule}
                onChangeText={setEditSchedule}
                style={styles.input}
                placeholder="Enter schedule"
                placeholderTextColor="#9AA2B1"
              />

              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>
                    setEditVisible(false)
                  }
                >
                  <Text
                    style={
                      styles.cancelButtonText
                    }
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEdit}
                >
                  <Text
                    style={styles.saveButtonText}
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    backgroundColor: '#7040D5',
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'left',
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    marginLeft: 12,
  },

  headerSpacer: {
    width: 40,
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 16,
  },

  pageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  pageTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    color: '#172033',
  },

  pageSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#748096',
    marginTop: 2,
  },

  addButton: {
    minHeight: 40,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 4,
  },

  headerAddButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  headerAddButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#7040D5',
    marginLeft: 4,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    height: 108,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 14,
    padding: 11,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#748096',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
    marginTop: 1,
  },

  /* REAL DONUT CARD */

  statusOverviewCard: {
    height: 108,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 7,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  statusOverviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#172033',
    marginBottom: 1,
  },

  statusOverviewContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  donutWrapper: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
  },

  donutCenter: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  donutTotal: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    lineHeight: 18,
    color: '#172033',
  },

  donutLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 6,
    color: '#8A93A5',
  },

  statusLegend: {
    flex: 1,
    marginLeft: 4,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 1,
  },

  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },

  legendText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 6.7,
    color: '#687286',
  },

  toolbar: {
    marginBottom: 10,
  },

  searchBox: {
    height: 46,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E9ECF2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#172033',
  },

  filterRow: {
    paddingTop: 10,
    paddingBottom: 2,
    gap: 7,
  },

  filterButton: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
    borderColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#687286',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  resultRow: {
    marginBottom: 9,
  },

  resultText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#8A93A5',
  },

  batchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 11,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  stoppedBatchCard: {
    borderColor: '#F5D7E1',
  },

  batchTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  batchIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  batchMainInfo: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 5,
  },

  batchName: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#172033',
  },

  batchCode: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A93A5',
    marginTop: 2,
  },

  statusBadge: {
    paddingHorizontal: 8,
    minHeight: 24,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
  },

  moreButton: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 3,
  },

  stoppedNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF5F8',
    borderRadius: 11,
    padding: 10,
    marginTop: 12,
  },

  stoppedNoticeText: {
    flex: 1,
    marginLeft: 8,
  },

  stoppedTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9.5,
    color: '#D64570',
  },

  stoppedReason: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    lineHeight: 13,
    color: '#7E5260',
    marginTop: 2,
  },

  stoppedDate: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#D64570',
    marginTop: 4,
  },

  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
  },

  infoItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingRight: 8,
    marginBottom: 11,
  },

  infoTextContainer: {
    flex: 1,
  },

  infoLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#9AA2B1',
    marginLeft: 7,
  },

  infoValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#344054',
    marginLeft: 7,
    marginTop: 1,
  },

  batchBottom: {
    borderTopWidth: 1,
    borderTopColor: '#F0F2F6',
    paddingTop: 11,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  scheduleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  scheduleText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#748096',
    marginLeft: 6,
  },

  capacityContainer: {
    width: 105,
  },

  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  capacityLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7.5,
    color: '#8A93A5',
  },

  capacityValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 7.5,
    color: '#344054',
  },

  progressTrack: {
    height: 5,
    borderRadius: 5,
    backgroundColor: '#ECEEF3',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 55,
    marginTop: 5,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#344054',
    marginTop: 10,
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A5',
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 16, 32, 0.48)',
    justifyContent: 'flex-end',
  },

  actionModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: 25,
  },

  modalHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#D9DDE5',
    marginBottom: 15,
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#172033',
  },

  modalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A5',
    marginTop: 2,
    marginBottom: 12,
  },

  actionItem: {
    minHeight: 57,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIconPurple: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconBlue: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionIconRed: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFE9F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#344054',
    marginLeft: 11,
  },

  detailModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '90%',
    padding: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  detailHero: {
    alignItems: 'center',
    backgroundColor: '#F8F5FF',
    borderRadius: 15,
    paddingVertical: 18,
    marginBottom: 12,
  },

  detailStoppedHero: {
    backgroundColor: '#FFF5F8',
  },

  detailHeroIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },

  detailName: {
    fontFamily: 'PoppinsBold',
    fontSize: 15,
    color: '#172033',
    textAlign: 'center',
  },

  detailCode: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A5',
    marginTop: 3,
  },

  detailStatus: {
    paddingHorizontal: 11,
    minHeight: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 9,
  },

  detailStatusText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  detailStoppedBox: {
    backgroundColor: '#FFF5F8',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  detailStoppedTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#D64570',
  },

  detailStoppedReason: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#7E5260',
    marginTop: 4,
  },

  detailStoppedDate: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
    color: '#D64570',
    marginTop: 6,
  },

  detailRow: {
    minHeight: 47,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8A93A5',
  },

  detailValue: {
    maxWidth: '62%',
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#344054',
    textAlign: 'right',
  },

  editModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: '92%',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },

  inputLabel: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#344054',
    marginBottom: 5,
    marginTop: 7,
  },

  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E3E6ED',
    paddingHorizontal: 12,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#172033',
  },

  editButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#667085',
  },

  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
});