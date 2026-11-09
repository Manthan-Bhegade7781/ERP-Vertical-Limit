import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/api";

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
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

/* =========================================================
   TYPES
========================================================= */

type BatchStatus = "Upcoming" | "Active" | "Completed";

type Standard = "8th" | "9th" | "10th" | "11th" | "12th";

type Batch = {
  id: string;
  branchId: string;
  name: string;
  code: string;
  standard: Standard;
  academicYear: string;
  branch: string;
  startDate: string;
  endDate: string;
  students: number;
  capacity: number;
  schedule: {
    startTime: string;
    endTime: string;
    days: string[];
  };
  description: string;
  removed?: boolean;
};

type BatchSubject = {
  id: string;
  batchId: string;
  subjectId: string;
  subject: string;
  subjectCode: string;
  teacherId: string;
  teacher: string;
  teacherEmail: string;
  status: "active" | "inactive";
};

type Subject = {
  id: string;
  name: string;
  code: string;
  standard: Standard;
  type: "Core" | "Foundation" | "Entrance";
};

type Teacher = {
  id: string;
  name: string;
  email: string;
  branch: string;
};

/* =========================================================
   SAMPLE DATA
========================================================= */

const sampleSubjects: Subject[] = [
  {
    id: "subject-1",
    name: "Mathematics",
    code: "MATH10",
    standard: "10th",
    type: "Core",
  },
  {
    id: "subject-2",
    name: "Science",
    code: "SCI10",
    standard: "10th",
    type: "Core",
  },
  {
    id: "subject-3",
    name: "English",
    code: "ENG10",
    standard: "10th",
    type: "Core",
  },
  {
    id: "subject-4",
    name: "Physics",
    code: "PHY12",
    standard: "12th",
    type: "Core",
  },
  {
    id: "subject-5",
    name: "Chemistry",
    code: "CHEM12",
    standard: "12th",
    type: "Core",
  },
  {
    id: "subject-6",
    name: "Mathematics",
    code: "MATH12",
    standard: "12th",
    type: "Core",
  },

  {
    id: "subject-7",
    name: "Biology",
    code: "BIO12",
    standard: "12th",
    type: "Core",
  },
];

const sampleTeachers: Teacher[] = [
  {
    id: "teacher-1",
    name: "Amit Sir",
    email: "amit@verticalclasses.com",
    branch: "Talegaon",
  },
  {
    id: "teacher-2",
    name: "Rahul Sir",
    email: "rahul@verticalclasses.com",
    branch: "Talegaon",
  },
  {
    id: "teacher-3",
    name: "Priya Ma'am",
    email: "priya@verticalclasses.com",
    branch: "Talegaon",
  },
  {
    id: "teacher-4",
    name: "Sneha Ma'am",
    email: "sneha@verticalclasses.com",
    branch: "Talegaon",
  },
];


const initialBatchSubjects: BatchSubject[] = [
  {
    id: "assignment-1",
    batchId: "1",
    subjectId: "subject-1",
    subject: "Mathematics",
    subjectCode: "MATH10",
    teacherId: "teacher-1",
    teacher: "Amit Sir",
    teacherEmail: "amit@verticalclasses.com",
    status: "active",
  },
  {
    id: "assignment-2",
    batchId: "1",
    subjectId: "subject-2",
    subject: "Science",
    subjectCode: "SCI10",
    teacherId: "teacher-2",
    teacher: "Rahul Sir",
    teacherEmail: "rahul@verticalclasses.com",
    status: "active",
  },
  {
    id: "assignment-3",
    batchId: "1",
    subjectId: "subject-3",
    subject: "English",
    subjectCode: "ENG10",
    teacherId: "teacher-3",
    teacher: "Priya Ma'am",
    teacherEmail: "priya@verticalclasses.com",
    status: "active",
  },

  {
    id: "assignment-4",
    batchId: "2",
    subjectId: "subject-1",
    subject: "Mathematics",
    subjectCode: "MATH10",
    teacherId: "teacher-1",
    teacher: "Amit Sir",
    teacherEmail: "amit@verticalclasses.com",
    status: "active",
  },
  {
    id: "assignment-5",
    batchId: "2",
    subjectId: "subject-2",
    subject: "Science",
    subjectCode: "SCI10",
    teacherId: "teacher-2",
    teacher: "Rahul Sir",
    teacherEmail: "rahul@verticalclasses.com",
    status: "active",
  },

  {
    id: "assignment-6",
    batchId: "3",
    subjectId: "subject-4",
    subject: "Physics",
    subjectCode: "PHY12",
    teacherId: "teacher-1",
    teacher: "Amit Sir",
    teacherEmail: "amit@verticalclasses.com",
    status: "active",
  },
  {
    id: "assignment-7",
    batchId: "3",
    subjectId: "subject-5",
    subject: "Chemistry",
    subjectCode: "CHEM12",
    teacherId: "teacher-2",
    teacher: "Rahul Sir",
    teacherEmail: "rahul@verticalclasses.com",
    status: "active",
  },
  {
    id: "assignment-8",
    batchId: "3",
    subjectId: "subject-6",
    subject: "Mathematics",
    subjectCode: "MATH12",
    teacherId: "teacher-4",
    teacher: "Sneha Ma'am",
    teacherEmail: "sneha@verticalclasses.com",
    status: "active",
  },
];

/* =========================================================
   STATUS CONFIG
========================================================= */

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
    background: "#E7F8EF",
    text: "#20A463",
    icon: "play-circle-outline",
    chartColor: "#35B878",
  },
  Completed: {
    background: "#EAF2FF",
    text: "#2675E8",
    icon: "check-circle-outline",
    chartColor: "#2675E8",
  },
  Upcoming: {
    background: "#FFF8E1",
    text: "#FF9800",
    icon: "clock-outline",
    chartColor: "#FF9800",
  }
};

const chartStatuses: BatchStatus[] = [
  "Upcoming",
  "Active",
  "Completed",
];

const getBatchStatus = (batch: Batch): BatchStatus => {
  const startDate = new Date(batch.startDate);
  const endDate = new Date(batch.endDate);
  const today = new Date();

  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  if (today < startDate) {
    return "Upcoming";
  }

  if (today > endDate) {
    return "Completed";
  }

  return "Active";
};

/* =========================================================
   DONUT
========================================================= */

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
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
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

          if (value === 0 || total === 0) {
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

type ApiBatch = {
  _id: string;
  name: string;
  code: string;
  standard: Standard;
  academicYear: string;
  branchId: string | { _id: string; name: string; code?: string };
  startDate: string;
  endDate: string;
  schedule: { startTime: string; endTime: string; days: string[] };
  capacity: number;
  description?: string;
  status?: string;
  isRemoved?: boolean;
};

function displayDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dateForApi(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function timeForApi(value: string): string | null {
  const text = value.trim().toUpperCase();
  const twelve = text.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (twelve) {
    let hour = Number(twelve[1]);
    const minute = Number(twelve[2]);
    if (hour < 1 || hour > 12 || minute > 59) return null;
    if (twelve[3] === 'AM') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  if (/^\d{2}:\d{2}$/.test(text)) return text;
  return null;
}

function displayTime(value: string): string {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const date = new Date();
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function mapApiBatch(item: ApiBatch): Batch {
  const branch = typeof item.branchId === 'string' ? null : item.branchId;
  const branchId = typeof item.branchId === 'string' ? item.branchId : item.branchId?._id;
  return {
    id: item._id,
    branchId: branchId || '',
    name: item.name,
    code: item.code,
    standard: item.standard,
    academicYear: item.academicYear,
    branch: branch?.name || 'Unknown branch',
    startDate: displayDate(item.startDate),
    endDate: displayDate(item.endDate),
    students: 0,
    capacity: Number(item.capacity || 0),
    schedule: {
      startTime: displayTime(item.schedule?.startTime || ''),
      endTime: displayTime(item.schedule?.endTime || ''),
      days: item.schedule?.days || [],
    },
    description: item.description || '',
    removed: Boolean(item.isRemoved),
  };
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await SecureStore.getItemAsync('auth_token');
  if (!token) throw new Error('Your session has expired. Please log in again.');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function BatchesPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 390;

  const [batches, setBatches] =
    useState<Batch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [savingBatch, setSavingBatch] = useState(false);

  const [batchSubjects, setBatchSubjects] =
    useState<BatchSubject[]>(initialBatchSubjects);

  const [search, setSearch] = useState("");

  const [filter, setFilter] =
    useState<"All" | BatchStatus>("All");

  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);

  const [actionVisible, setActionVisible] =
    useState(false);

  const [viewVisible, setViewVisible] =
    useState(false);

  const [editVisible, setEditVisible] =
    useState(false);

  const [assignVisible, setAssignVisible] =
    useState(false);

  const [selectedSubjectId, setSelectedSubjectId] =
    useState("");

  const [selectedTeacherId, setSelectedTeacherId] =
    useState("");

  const [changeTeacherVisible, setChangeTeacherVisible] =
  useState(false);

  const [changeTeacherId, setChangeTeacherId] =
    useState("");

  const [selectedAssignment, setSelectedAssignment] =
  useState<BatchSubject | null>(null);

  const [assignmentActionVisible, setAssignmentActionVisible] =
    useState(false);

  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] =
    useState("");
  const [editEndDate, setEditEndDate] =
    useState("");
  const [editCapacity, setEditCapacity] =
    useState("");
  const [editStartTime, setEditStartTime] =
    useState("");
  const [editEndTime, setEditEndTime] =
    useState("");

  const fetchBatches = useCallback(async () => {
    setLoadingBatches(true);
    try {
      const headers = await authHeaders();
      const response = await fetch(`${API_BASE_URL}/batches`, { method: 'GET', headers });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Unable to load batches.');
      }
      const rows: ApiBatch[] = result.data?.batches || [];
      setBatches(rows.map(mapApiBatch));
    } catch (error) {
      Alert.alert('Unable to load batches', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  useEffect(() => { void fetchBatches(); }, [fetchBatches]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredBatches = useMemo(() => {
    const value = search.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesSearch =
        !value ||
        batch.name.toLowerCase().includes(value) ||
        batch.code.toLowerCase().includes(value) ||
        batch.standard.toLowerCase().includes(value) ||
        batch.academicYear.toLowerCase().includes(value) ||
        batch.branch.toLowerCase().includes(value);

      if (batch.removed) {
        return false;
      }

      const matchesFilter =
        filter === "All" ||
        getBatchStatus(batch) === filter;

      return matchesSearch && matchesFilter;
    });
  }, [batches, search, filter]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const visibleBatches = batches.filter(
    (batch) => !batch.removed,
  );

  const upcomingCount = visibleBatches.filter(
    (batch) => getBatchStatus(batch) === "Upcoming",
  ).length;

  const activeCount = visibleBatches.filter(
    (batch) => getBatchStatus(batch) === "Active",
  ).length;

  const completedCount = visibleBatches.filter(
    (batch) => getBatchStatus(batch) === "Completed",
  ).length;

  const totalStudents = visibleBatches.reduce(
    (sum, batch) => sum + batch.students,
    0,
  );

  const statusCounts: Record<BatchStatus, number> = {
    Upcoming: upcomingCount,
    Active: activeCount,
    Completed: completedCount,
  };

  /* =========================================================
     ACTIONS
  ========================================================= */

  const removeBatch = () => {
    if (!selectedBatch) {
      return;
    }

    const batchToRemove = selectedBatch;

    setActionVisible(false);

    Alert.alert(
      "Remove Batch",
      `Are you sure you want to remove "${batchToRemove.name}"? The batch will be removed from active management, while its historical records are preserved.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const headers = await authHeaders();
              const response = await fetch(`${API_BASE_URL}/batches/${batchToRemove.id}/remove`, { method: 'PATCH', headers });
              const result = await response.json();
              if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to remove batch.');
              setBatches((current) => current.filter((batch) => batch.id !== batchToRemove.id));
              setSelectedBatch(null);
              Alert.alert('Success', result.message || 'Batch removed successfully.');
            } catch (error) {
              Alert.alert('Remove failed', error instanceof Error ? error.message : 'Please try again.');
            }
          },
        },
      ],
    );
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
    if (!selectedBatch) {
      return;
    }

    setEditName(selectedBatch.name);
    setEditStartDate(selectedBatch.startDate);
    setEditEndDate(selectedBatch.endDate);
    setEditCapacity(String(selectedBatch.capacity));
    setEditStartTime(
      selectedBatch.schedule.startTime,
    );
    setEditEndTime(
      selectedBatch.schedule.endTime,
    );

    setActionVisible(false);
    setEditVisible(true);
  };

  const saveEdit = () => {
    if (!selectedBatch) {
      return;
    }

    if (!editName.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter batch name.",
      );
      return;
    }

    if (!editCapacity.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter batch capacity.",
      );
      return;
    }

    const capacityNumber = Number(editCapacity);

    if (
      Number.isNaN(capacityNumber) ||
      capacityNumber < 1
    ) {
      Alert.alert(
        "Invalid Capacity",
        "Capacity must be a positive number.",
      );
      return;
    }

    const startDate = dateForApi(editStartDate);
    const endDate = dateForApi(editEndDate);
    const startTime = timeForApi(editStartTime);
    const endTime = timeForApi(editEndTime);
    if (!startDate || !endDate) {
      Alert.alert('Invalid date', 'Enter dates such as 01 Jun 2027 or 2027-06-01.');
      return;
    }
    if (!startTime || !endTime) {
      Alert.alert('Invalid time', 'Enter times such as 08:00 AM or 17:00.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Invalid date range', 'Start date cannot be after end date.');
      return;
    }
    if (!selectedBatch.branchId) {
      Alert.alert('Missing branch', 'This batch has no branch ID. Reload batches and try again.');
      return;
    }

    setSavingBatch(true);
    void (async () => {
      try {
        const headers = await authHeaders();
        const response = await fetch(`${API_BASE_URL}/batches/${selectedBatch.id}`, {
          method: 'PUT', headers,
          body: JSON.stringify({
            name: editName.trim(), code: selectedBatch.code, standard: selectedBatch.standard,
            academicYear: selectedBatch.academicYear, branchId: selectedBatch.branchId,
            startDate, endDate,
            schedule: { startTime, endTime, days: selectedBatch.schedule.days },
            capacity: capacityNumber, description: selectedBatch.description || '',
          }),
        });
        const result = await response.json();
        if (!response.ok || result.success === false) throw new Error(result.message || 'Unable to update batch.');
        const updated = result.data?.batch as ApiBatch | undefined;
        if (updated) setBatches((current) => current.map((batch) => batch.id === selectedBatch.id ? mapApiBatch(updated) : batch));
        else await fetchBatches();
        setSelectedBatch(null);
        setEditVisible(false);
        Alert.alert('Success', result.message || 'Batch updated successfully.');
      } catch (error) {
        Alert.alert('Update failed', error instanceof Error ? error.message : 'Please try again.');
      } finally {
        setSavingBatch(false);
      }
    })();
  };

  /* =========================================================
     SUBJECT ASSIGNMENT - SAMPLE ONLY
  ========================================================= */

  const openAssignSubject = () => {
    setActionVisible(false);
    setSelectedSubjectId("");
    setSelectedTeacherId("");
    setAssignVisible(true);
  };

  const assignSubject = () => {
    if (!selectedBatch) {
      return;
    }

    if (!selectedSubjectId) {
      Alert.alert(
        "Select Subject",
        "Please select a subject.",
      );
      return;
    }

    if (!selectedTeacherId) {
      Alert.alert(
        "Select Teacher",
        "Please select a teacher.",
      );
      return;
    }

    const subject = sampleSubjects.find(
      (item) => item.id === selectedSubjectId,
    );

    const teacher = sampleTeachers.find(
      (item) => item.id === selectedTeacherId,
    );

    if (!subject || !teacher) {
      return;
    }

    const existingAssignment = batchSubjects.find(
      (item) =>
        item.batchId === selectedBatch.id &&
        item.subjectId === subject.id,
    );

    if (existingAssignment?.status === "active") {
      Alert.alert(
        "Already Assigned",
        "This subject is already assigned to this batch.",
      );
      return;
    }

    if (existingAssignment?.status === "inactive") {
      setBatchSubjects((current) =>
        current.map((item) =>
          item.id === existingAssignment.id
            ? {
                ...item,
                teacherId: teacher.id,
                teacher: teacher.name,
                teacherEmail: teacher.email,
                status: "active",
              }
            : item,
        ),
      );

      setAssignVisible(false);

      Alert.alert(
        "Success",
        `${subject.name} assigned to ${teacher.name}.`,
      );

      return;
    }

    const newAssignment: BatchSubject = {
      id: `sample-${Date.now()}`,
      batchId: selectedBatch.id,
      subjectId: subject.id,
      subject: subject.name,
      subjectCode: subject.code,
      teacherId: teacher.id,
      teacher: teacher.name,
      teacherEmail: teacher.email,
      status: "active",
    };

    setBatchSubjects((current) => [
      ...current,
      newAssignment,
    ]);

    setAssignVisible(false);

    Alert.alert(
      "Success",
      `${subject.name} assigned to ${teacher.name}.`,
    );
  };

  const getBatchSubjects = (
    batchId: string,
  ) => {
    return batchSubjects.filter(
      (item) => item.batchId === batchId,
    );
  };

  const openAssignmentActions = (
    assignment: BatchSubject,
  ) => {
    setSelectedAssignment(assignment);
    setAssignmentActionVisible(true);
  };

  const closeAssignmentActions = () => {
    setAssignmentActionVisible(false);
    setSelectedAssignment(null);
  };

  const openChangeTeacher = () => {
    if (!selectedAssignment) {
      return;
    }

    setChangeTeacherId(selectedAssignment.teacherId);
    setAssignmentActionVisible(false);
    setChangeTeacherVisible(true);
  };

  const unassignAssignment = () => {
    if (!selectedAssignment) {
      return;
    }

    setBatchSubjects((current) =>
      current.map((item) =>
        item.id === selectedAssignment.id
          ? {
              ...item,
              status: "inactive",
            }
          : item,
      ),
    );

    setAssignmentActionVisible(false);
    setSelectedAssignment(null);

    Alert.alert(
      "Success",
      `${selectedAssignment.subject} has been unassigned from this batch.`,
    );
  };

  /* =========================================================
     SUMMARY CARD
  ========================================================= */

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
          width: isSmallScreen
            ? "48.5%"
            : "31.8%",
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
      <View style={styles.summaryInfo}>
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
    </View>
  );

  /* =========================================================
     BATCH CARD
  ========================================================= */

  const renderBatchCard = (
    batch: Batch,
  ) => {
    const batchStatus = getBatchStatus(batch);
    const status = statusConfig[batchStatus];

    const percentage =
      batch.capacity > 0
        ? Math.round(
            (batch.students /
              batch.capacity) *
              100,
          )
        : 0;

    return (
      <View
        key={batch.id}
        style={styles.batchCard}
      >
        <View style={styles.batchCardHeader}>
          <View style={styles.batchTitleArea}>
            <View style={styles.batchIcon}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={23}
                color="#7040D5"
              />
            </View>

            <View style={styles.batchTitleText}>
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
          </View>

          <TouchableOpacity
            style={styles.moreButton}
            onPress={() =>
              openActions(batch)
            }
          >
            <MaterialCommunityIcons
              name="dots-vertical"
              size={22}
              color="#60646F"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="school-outline"
              size={17}
              color="#7040D5"
            />

            <View>
              <Text style={styles.infoLabel}>
                Standard
              </Text>

              <Text style={styles.infoValue}>
                {batch.standard}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="calendar-range-outline"
              size={17}
              color="#7040D5"
            />

            <View>
              <Text style={styles.infoLabel}>
                Academic Year
              </Text>

              <Text style={styles.infoValue}>
                {batch.academicYear}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={17}
              color="#7040D5"
            />

            <View>
              <Text style={styles.infoLabel}>
                Branch
              </Text>

              <Text style={styles.infoValue}>
                {batch.branch}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <MaterialCommunityIcons
              name="account-multiple-outline"
              size={17}
              color="#7040D5"
            />

            <View>
              <Text style={styles.infoLabel}>
                Students
              </Text>

              <Text style={styles.infoValue}>
                {batch.students} /{" "}
                {batch.capacity}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleLeft}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={18}
              color="#7040D5"
            />

            <View>
              <Text style={styles.infoLabel}>
                Schedule
              </Text>

              <Text
                style={styles.scheduleText}
              >
                {batch.schedule.startTime} -{" "}
                {batch.schedule.endTime}
              </Text>

              <Text style={styles.daysText}>
                {batch.schedule.days
                  .map((day) =>
                    day.slice(0, 3),
                  )
                  .join(" • ")}
              </Text>
            </View>
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
            <MaterialCommunityIcons
              name={status.icon}
              size={14}
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
              {batchStatus}
            </Text>
          </View>
        </View>

        <View style={styles.capacityContainer}>
          <View style={styles.capacityHeader}>
            <Text style={styles.capacityLabel}>
              Student Capacity
            </Text>

            <Text style={styles.capacityPercentage}>
              {percentage}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    percentage,
                    100,
                  )}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

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
              pathname:
                "/(super_admin)/explore",
              params: {
                feature: "Add Batch",
              },
            });
          }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={styles.headerAddButtonText}
          >
            Add Batch
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loadingBatches && <Text style={{ paddingVertical: 10, color: '#707584' }}>Loading batches from server...</Text>}
        {!loadingBatches && batches.length === 0 && <View style={{ paddingVertical: 10, gap: 8 }}><Text style={{ color: '#707584' }}>No batches found yet.</Text><TouchableOpacity onPress={() => void fetchBatches()}><Text style={{ color: '#7040D5', fontWeight: '700' }}>Retry loading</Text></TouchableOpacity></View>}
        {/* TITLE */}

        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>
            Batch Management
          </Text>

          <Text style={styles.pageSubtitle}>
            Manage student batches, schedules,
            capacity and subject assignments
          </Text>
        </View>

        {/* SUMMARY */}

        <View style={styles.summaryGrid}>
          {renderSummaryCard(
            "google-circles-communities",
            "Total Batches",
            String(visibleBatches.length),
            "#F1EAFF",
            "#7040D5",
          )}

          {renderSummaryCard(
            "play-circle-outline",
            "Active Batches",
            String(activeCount),
            "#E7F8EF",
            "#35B878",
          )}

          {renderSummaryCard(
            "account-multiple-outline",
            "Students",
            String(totalStudents),
            "#EAF2FF",
            "#2675E8",
          )}
        </View>

        {/* STATUS OVERVIEW */}

        <View style={styles.statusOverview}>
          <View>
            <Text style={styles.sectionTitle}>
              Batch Status
            </Text>

            <Text style={styles.sectionSubtitle}>
              Overview of all batches
            </Text>

            <View style={styles.legendContainer}>
              {chartStatuses.map(
                (status) => (
                  <View
                    key={status}
                    style={styles.legendItem}
                  >
                    <View
                      style={[
                        styles.legendDot,
                        {
                          backgroundColor:
                            statusConfig[
                              status
                            ].chartColor,
                        },
                      ]}
                    />

                    <Text
                      style={styles.legendText}
                    >
                      {status}{" "}
                      {statusCounts[status]}
                    </Text>
                  </View>
                ),
              )}
            </View>
          </View>

          <BatchStatusDonut
            counts={statusCounts}
            total={visibleBatches.length}
          />
        </View>

        {/* SEARCH */}

        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={21}
            color="#9296A3"
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search batches..."
            placeholderTextColor="#A0A3AE"
            value={search}
            onChangeText={setSearch}
          />

          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch("")}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={19}
                color="#A0A3AE"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTERS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {(
            [
              "All",
              "Upcoming",
              "Active",
              "Completed",
            ] as const
          ).map((item) => {
            const selected =
              filter === item;

            return (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterButton,
                  selected &&
                    styles.filterButtonActive,
                ]}
                onPress={() =>
                  setFilter(item)
                }
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

        {/* RESULT */}

        <View style={styles.resultHeader}>
          <Text style={styles.resultTitle}>
            Batches
          </Text>

          <Text style={styles.resultCount}>
            {filteredBatches.length} found
          </Text>
        </View>

        {/* BATCHES */}

        {filteredBatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="database-search-outline"
              size={48}
              color="#B0B3BD"
            />

            <Text style={styles.emptyTitle}>
              No batches found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or
              filter.
            </Text>
          </View>
        ) : (
          filteredBatches.map(
            renderBatchCard,
          )
        )}
      </ScrollView>

      {/* =====================================================
          ACTION MODAL
      ===================================================== */}

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
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              Batch Actions
            </Text>

            {selectedBatch && (
              <Text style={styles.modalSubtitle}>
                {selectedBatch.name}
              </Text>
            )}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openView}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      "#F1EAFF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View
                style={styles.actionTextArea}
              >
                <Text
                  style={styles.actionTitle}
                >
                  View Batch
                </Text>

                <Text
                  style={
                    styles.actionDescription
                  }
                >
                  View details and subjects
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openEdit}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor:
                      "#EAF2FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View
                style={styles.actionTextArea}
              >
                <Text
                  style={styles.actionTitle}
                >
                  Edit Batch
                </Text>

                <Text
                  style={
                    styles.actionDescription
                  }
                >
                  Update batch information
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openAssignSubject}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#F1EAFF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="book-plus-outline"
                  size={21}
                  color="#7040D5"
                />
              </View>

              <View
                style={styles.actionTextArea}
              >
                <Text
                  style={styles.actionTitle}
                >
                  Assign Subject & Teacher
                </Text>

                <Text
                  style={
                    styles.actionDescription
                  }
                >
                  Assign a subject and teacher to this batch
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={removeBatch}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#FFF0F0",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="archive-remove-outline"
                  size={21}
                  color="#D64545"
                />
              </View>

              <View style={styles.actionTextArea}>
                <Text
                  style={[
                    styles.actionTitle,
                    { color: "#D64545" },
                  ]}
                >
                  Remove Batch
                </Text>

                <Text
                  style={styles.actionDescription}
                >
                  Remove this batch from active management
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
          VIEW BATCH MODAL
      ===================================================== */}

      <Modal
        visible={viewVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setViewVisible(false)
        }
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.viewModal}>
            <View style={styles.viewHeader}>
              <View style={styles.sheetHandle} />
              <View>
                <Text
                  style={styles.viewModalTitle}
                >
                  Batch Details
                </Text>

                {selectedBatch && (
                  <Text
                    style={
                      styles.viewModalSubtitle
                    }
                  >
                    {selectedBatch.code}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setViewVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#5E626D"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.viewContent
              }
            >
              {selectedBatch && (
                <>
                  {/* BASIC INFO */}

                  <View
                    style={
                      styles.batchDetailHero
                    }
                  >
                    <View
                      style={
                        styles.detailHeroIcon
                      }
                    >
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={28}
                        color="#7040D5"
                      />
                    </View>

                    <View
                      style={
                        styles.detailHeroText
                      }
                    >
                      <Text
                        style={
                          styles.detailHeroTitle
                        }
                      >
                        {selectedBatch.name}
                      </Text>

                      <Text
                        style={
                          styles.detailHeroCode
                        }
                      >
                        {selectedBatch.code}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            statusConfig[
                              getBatchStatus(selectedBatch)
                            ].background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              statusConfig[
                                getBatchStatus(selectedBatch)
                              ].text,
                          },
                        ]}
                      >
                        {getBatchStatus(selectedBatch)}
                      </Text>
                    </View>
                  </View>

                  {/* DETAILS */}

                  <Text
                    style={styles.detailSectionTitle}
                  >
                    Batch Information
                  </Text>

                  <View
                    style={styles.detailGrid}
                  >
                    <DetailBox
                      icon="school-outline"
                      label="Standard"
                      value={
                        selectedBatch.standard
                      }
                    />

                    <DetailBox
                      icon="calendar-range-outline"
                      label="Academic Year"
                      value={
                        selectedBatch.academicYear
                      }
                    />

                    <DetailBox
                      icon="map-marker-outline"
                      label="Branch"
                      value={
                        selectedBatch.branch
                      }
                    />

                    <DetailBox
                      icon="account-multiple-outline"
                      label="Students"
                      value={`${selectedBatch.students} / ${selectedBatch.capacity}`}
                    />

                    <DetailBox
                      icon="calendar-start"
                      label="Start Date"
                      value={
                        selectedBatch.startDate
                      }
                    />

                    <DetailBox
                      icon="calendar-end"
                      label="End Date"
                      value={
                        selectedBatch.endDate
                      }
                    />
                  </View>

                  {/* SCHEDULE */}

                  <Text
                    style={styles.detailSectionTitle}
                  >
                    Schedule
                  </Text>

                  <View
                    style={
                      styles.scheduleDetailCard
                    }
                  >
                    <View
                      style={
                        styles.scheduleIconBox
                      }
                    >
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={23}
                        color="#7040D5"
                      />
                    </View>

                    <View>
                      <Text
                        style={
                          styles.scheduleDetailTime
                        }
                      >
                        {
                          selectedBatch
                            .schedule
                            .startTime
                        }{" "}
                        -{" "}
                        {
                          selectedBatch
                            .schedule
                            .endTime
                        }
                      </Text>

                      <View style={styles.scheduleDaysContainer}>
                        {selectedBatch.schedule.days.map((day) => (
                          <View key={day} style={styles.scheduleDayBadge}>
                            <Text style={styles.scheduleDayText}>
                              {day.slice(0, 3)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  {/* DESCRIPTION */}

                  <Text
                    style={styles.detailSectionTitle}
                  >
                    Description
                  </Text>

                  <View
                    style={
                      styles.descriptionCard
                    }
                  >
                    <Text
                      style={
                        styles.descriptionText
                      }
                    >
                      {
                        selectedBatch.description
                      }
                    </Text>
                  </View>

                  {/* SUBJECTS */}

                  <View
                    style={
                      styles.subjectSectionHeader
                    }
                  >
                    <View>
                      <Text
                        style={
                          styles.detailSectionTitle
                        }
                      >
                        Subjects & Teachers
                      </Text>

                      <Text
                        style={
                          styles.subjectSectionSubtitle
                        }
                      >
                        Subjects assigned to this
                        batch
                      </Text>
                    </View>


                  </View>

                  {getBatchSubjects(
                    selectedBatch.id,
                  ).length === 0 ? (
                    <View
                      style={
                        styles.noSubjectsCard
                      }
                    >
                      <MaterialCommunityIcons
                        name="book-plus-outline"
                        size={38}
                        color="#B1B4BE"
                      />

                      <Text
                        style={
                          styles.noSubjectsTitle
                        }
                      >
                        No subjects assigned
                      </Text>

                      <Text
                        style={
                          styles.noSubjectsText
                        }
                      >
                        Assign subjects and
                        teachers to this batch.
                      </Text>
                    </View>
                  ) : (
                    getBatchSubjects(
                      selectedBatch.id,
                    ).map((item) => (
                      <View
                        key={item.id}
                        style={
                          styles.subjectAssignmentCard
                        }
                      >
                        <View
                          style={
                            styles.subjectIconBox
                          }
                        >
                          <MaterialCommunityIcons
                            name="book-open-variant"
                            size={21}
                            color="#7040D5"
                          />
                        </View>

                        <View
                          style={
                            styles.subjectAssignmentMain
                          }
                        >
                          <Text
                            style={
                              styles.subjectName
                            }
                          >
                            {item.subject}
                          </Text>

                          <Text
                            style={
                              styles.subjectCode
                            }
                          >
                            {item.subjectCode}
                          </Text>

                          <View
                            style={
                              styles.teacherRow
                            }
                          >
                            <MaterialCommunityIcons
                              name="account-outline"
                              size={15}
                              color="#777B87"
                            />

                            <Text
                              style={
                                styles.teacherName
                              }
                            >
                              {item.status === "inactive" ? "No teacher assigned" : item.teacher}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.assignmentRightArea}>
                          <View
                            style={[
                              styles.smallStatus,
                              {
                                backgroundColor:
                                  item.status === "active"
                                    ? "#E7F8EF"
                                    : "#F1F2F4",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.smallStatusText,
                                {
                                  color:
                                    item.status === "active"
                                      ? "#20A463"
                                      : "#777B87",
                                },
                              ]}
                            >
                              {item.status}
                            </Text>
                          </View>
                          
                          {item.status === "active" && (
                          <TouchableOpacity
                            style={styles.assignmentMoreButton}
                            onPress={() =>
                              openAssignmentActions(item)
                            }
                          >
                            <MaterialCommunityIcons
                              name="dots-vertical"
                              size={20}
                              color="#777B87"
                            />
                          </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          ASSIGNMENT ACTION MODAL
      ===================================================== */}

      <Modal
        visible={assignmentActionVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAssignmentActions}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeAssignmentActions}
        >
          <Pressable
            style={styles.actionModal}
            onPress={() => {}}
          >
            <View style={styles.modalHandle} />

            <View style={styles.assignmentActionHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  Assignment Actions
                </Text>

                {selectedAssignment && (
                  <>
                    <Text style={styles.modalSubtitle}>
                      {selectedAssignment.subject}
                    </Text>

                    <Text style={styles.assignmentActionTeacher}>
                      {selectedAssignment.teacher}
                    </Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeAssignmentActions}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#5E626D"
                />
              </TouchableOpacity>
            </View>

            {/* CHANGE TEACHER */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={openChangeTeacher}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#EAF2FF",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-switch-outline"
                  size={21}
                  color="#2675E8"
                />
              </View>

              <View style={styles.actionTextArea}>
                <Text style={styles.actionTitle}>
                  Change Teacher
                </Text>

                <Text style={styles.actionDescription}>
                  Assign a different teacher to this subject
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>

            {/* UNASSIGN */}

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                if (!selectedAssignment) {
                  return;
                }

                setAssignmentActionVisible(false);

                Alert.alert(
                  "Unassign Subject",
                  `Are you sure you want to unassign ${selectedAssignment.subject} from ${selectedBatch?.name}?`,
                  [
                    {
                      text: "Cancel",
                      style: "cancel",
                    },
                    {
                      text: "Unassign",
                      style: "destructive",
                      onPress: unassignAssignment,
                    },
                  ],
                );
              }}
            >
              <View
                style={[
                  styles.actionIcon,
                  {
                    backgroundColor: "#FFE9F0",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="link-off"
                  size={21}
                  color="#E95386"
                />
              </View>

              <View style={styles.actionTextArea}>
                <Text
                  style={[
                    styles.actionTitle,
                    {
                      color: "#E95386",
                    },
                  ]}
                >
                  Unassign Subject
                </Text>

                <Text style={styles.actionDescription}>
                  Remove this subject from the batch
                </Text>
              </View>

              <MaterialCommunityIcons
                name="chevron-right"
                size={21}
                color="#A0A3AE"
              />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* =====================================================
              CHANGE TEACHER MODAL
          ===================================================== */}

          <Modal
            visible={changeTeacherVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setChangeTeacherVisible(false)}
          >
            <View style={styles.sheetOverlay}>
              <View style={styles.assignModal}>
                <View style={styles.viewHeader}>
                  <View>
                    <Text style={styles.viewModalTitle}>
                      Change Teacher
                    </Text>

                    <Text style={styles.viewModalSubtitle}>
                      {selectedAssignment?.subject}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setChangeTeacherVisible(false)}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={22}
                      color="#5E626D"
                    />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.assignContent}
                >
                  <View style={styles.changeTeacherInfoCard}>
                    <MaterialCommunityIcons
                      name="book-open-variant"
                      size={21}
                      color="#7040D5"
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.changeTeacherSubject}>
                        {selectedAssignment?.subject}
                      </Text>

                      <Text style={styles.changeTeacherCurrent}>
                        Current Teacher: {selectedAssignment?.teacher}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>
                    Select New Teacher
                  </Text>

                  <View style={styles.optionsContainer}>
                    {sampleTeachers
                      .filter(
                        (teacher) =>
                          !selectedBatch ||
                          teacher.branch === selectedBatch.branch,
                      )
                      .map((teacher) => {
                        const selected =
                          changeTeacherId === teacher.id;

                        return (
                          <TouchableOpacity
                            key={teacher.id}
                            style={[
                              styles.optionCard,
                              selected &&
                                styles.optionCardSelected,
                            ]}
                            onPress={() =>
                              setChangeTeacherId(teacher.id)
                            }
                          >
                            <View
                              style={[
                                styles.teacherOptionIcon,
                                selected &&
                                  styles.optionIconSelected,
                              ]}
                            >
                              <MaterialCommunityIcons
                                name="account-outline"
                                size={21}
                                color={
                                  selected
                                    ? "#FFFFFF"
                                    : "#7040D5"
                                }
                              />
                            </View>

                            <View style={styles.optionTextArea}>
                              <Text style={styles.optionTitle}>
                                {teacher.name}
                              </Text>

                              <Text style={styles.optionSubtitle}>
                                {teacher.email}
                              </Text>
                            </View>

                            {selected && (
                              <MaterialCommunityIcons
                                name="check-circle"
                                size={22}
                                color="#7040D5"
                              />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                  </View>

                  <TouchableOpacity
                    style={styles.assignConfirmButton}
                    onPress={() => {
                      if (!selectedAssignment) {
                        return;
                      }

                      if (!changeTeacherId) {
                        Alert.alert(
                          "Select Teacher",
                          "Please select a teacher.",
                        );
                        return;
                      }

                      const teacher = sampleTeachers.find(
                        (item) =>
                          item.id === changeTeacherId,
                      );

                      if (!teacher) {
                        return;
                      }

                      setBatchSubjects((current) =>
                        current.map((item) =>
                          item.id === selectedAssignment.id
                            ? {
                                ...item,
                                teacherId: teacher.id,
                                teacher: teacher.name,
                                teacherEmail: teacher.email,
                              }
                            : item,
                        ),
                      );

                      setChangeTeacherVisible(false);
                      setSelectedAssignment(null);

                      Alert.alert(
                        "Success",
                        `${selectedAssignment.subject} is now assigned to ${teacher.name}.`,
                      );
                    }}
                  >
                    <MaterialCommunityIcons
                      name="account-switch-outline"
                      size={19}
                      color="#FFFFFF"
                    />

                    <Text style={styles.assignConfirmText}>
                      Change Teacher
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditVisible(false)
        }
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.editModal}>
            <View style={styles.viewHeader}>
              <View style={styles.sheetHandle} />
              <View>
                <Text
                  style={styles.viewModalTitle}
                >
                  Edit Batch
                </Text>

                <Text
                  style={styles.viewModalSubtitle}
                >
                  Update sample batch details
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setEditVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#5E626D"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.editContent
              }
            >
              <FormInput
                label="Batch Name"
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter batch name"
              />

              <FormInput
                label="Start Date"
                value={editStartDate}
                onChangeText={setEditStartDate}
                placeholder="DD MMM YYYY"
              />

              <FormInput
                label="End Date"
                value={editEndDate}
                onChangeText={setEditEndDate}
                placeholder="DD MMM YYYY"
              />

              <FormInput
                label="Capacity"
                value={editCapacity}
                onChangeText={setEditCapacity}
                placeholder="Enter capacity"
                keyboardType="numeric"
              />

              <View
                style={styles.twoColumnRow}
              >
                <View
                  style={styles.halfInput}
                >
                  <FormInput
                    label="Start Time"
                    value={editStartTime}
                    onChangeText={
                      setEditStartTime
                    }
                    placeholder="08:00 AM"
                  />
                </View>

                <View
                  style={styles.halfInput}
                >
                  <FormInput
                    label="End Time"
                    value={editEndTime}
                    onChangeText={
                      setEditEndTime
                    }
                    placeholder="10:00 AM"
                  />
                </View>
              </View>

              {selectedBatch && (
                <View
                  style={
                    styles.readOnlyInfoCard
                  }
                >
                  <InfoRow
                    label="Standard"
                    value={
                      selectedBatch.standard
                    }
                  />

                  <InfoRow
                    label="Academic Year"
                    value={
                      selectedBatch.academicYear
                    }
                  />

                  <InfoRow
                    label="Branch"
                    value={
                      selectedBatch.branch
                    }
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveButton, savingBatch && { opacity: 0.6 }]}
                onPress={saveEdit}
                disabled={savingBatch}
              >
                <MaterialCommunityIcons
                  name="content-save-outline"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={styles.saveButtonText}
                >
                  {savingBatch ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* =====================================================
          ASSIGN SUBJECT MODAL
      ===================================================== */}

      <Modal
        visible={assignVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setAssignVisible(false)
        }
      >
        <View style={styles.sheetOverlay}>
          <View
            style={[
              styles.assignModal
            ]}
          >
            <View style={styles.viewHeader}>
              <View style={styles.sheetHandle} />
              <View>
                <Text
                  style={styles.viewModalTitle}
                >
                  Assign Subject
                </Text>

                <Text
                  style={styles.viewModalSubtitle}
                >
                  {selectedBatch?.name}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() =>
                  setAssignVisible(false)
                }
              >
                <MaterialCommunityIcons
                  name="close"
                  size={22}
                  color="#5E626D"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.assignContent
              }
            >
              <Text
                style={styles.inputLabel}
              >
                Select Subject
              </Text>

              <View
                style={
                  styles.optionsContainer
                }
              >
                {sampleSubjects
                  .filter(
                    (subject) =>
                      !selectedBatch ||
                      subject.standard ===
                        selectedBatch.standard,
                  )
                  .map((subject) => {
                    const selected =
                      selectedSubjectId ===
                      subject.id;

                    return (
                      <TouchableOpacity
                        key={subject.id}
                        style={[
                          styles.optionCard,
                          selected &&
                            styles.optionCardSelected,
                        ]}
                        onPress={() =>
                          setSelectedSubjectId(
                            subject.id,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.optionIcon,
                            selected &&
                              styles.optionIconSelected,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="book-open-variant"
                            size={20}
                            color={
                              selected
                                ? "#FFFFFF"
                                : "#7040D5"
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.optionTextArea
                          }
                        >
                          <Text
                            style={
                              styles.optionTitle
                            }
                          >
                            {subject.name}
                          </Text>

                          <Text
                            style={
                              styles.optionSubtitle
                            }
                          >
                            {subject.code} •{" "}
                            {subject.type}
                          </Text>
                        </View>

                        {selected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={22}
                            color="#7040D5"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>

              <Text
                style={[
                  styles.inputLabel,
                  {
                    marginTop: 22,
                  },
                ]}
              >
                Select Teacher
              </Text>

              <View
                style={
                  styles.optionsContainer
                }
              >
                {sampleTeachers
                  .filter(
                    (teacher) =>
                      !selectedBatch ||
                      teacher.branch ===
                        selectedBatch.branch,
                  )
                  .map((teacher) => {
                    const selected =
                      selectedTeacherId ===
                      teacher.id;

                    return (
                      <TouchableOpacity
                        key={teacher.id}
                        style={[
                          styles.optionCard,
                          selected &&
                            styles.optionCardSelected,
                        ]}
                        onPress={() =>
                          setSelectedTeacherId(
                            teacher.id,
                          )
                        }
                      >
                        <View
                          style={[
                            styles.teacherOptionIcon,
                            selected &&
                              styles.optionIconSelected,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name="account-outline"
                            size={21}
                            color={
                              selected
                                ? "#FFFFFF"
                                : "#7040D5"
                            }
                          />
                        </View>

                        <View
                          style={
                            styles.optionTextArea
                          }
                        >
                          <Text
                            style={
                              styles.optionTitle
                            }
                          >
                            {teacher.name}
                          </Text>

                          <Text
                            style={
                              styles.optionSubtitle
                            }
                          >
                            {teacher.email}
                          </Text>
                        </View>

                        {selected && (
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={22}
                            color="#7040D5"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </View>

              <View
                style={
                  styles.sampleNotice
                }
              >
                <MaterialCommunityIcons
                  name="information-outline"
                  size={19}
                  color="#7040D5"
                />

                <Text
                  style={
                    styles.sampleNoticeText
                  }
                >
                  This is sample data for the
                  frontend. API integration will
                  be connected after the backend
                  modules are completed.
                </Text>
              </View>

              <TouchableOpacity
                style={styles.assignConfirmButton}
                onPress={assignSubject}
              >
                <MaterialCommunityIcons
                  name="link-variant"
                  size={19}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.assignConfirmText
                  }
                >
                  Assign Subject & Teacher
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function DetailBox({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailBox}>
      <MaterialCommunityIcons
        name={icon}
        size={19}
        color="#7040D5"
      />

      <View style={styles.detailBoxText}>
        <Text style={styles.detailBoxLabel}>
          {label}
        </Text>

        <Text style={styles.detailBoxValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
      </Text>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A3AE"
        keyboardType={keyboardType}
      />
    </View>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>
        {label}
      </Text>

      <Text style={styles.infoRowValue}>
        {value}
      </Text>
    </View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F7FA",
  },

  container: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  /* HEADER */

  header: {
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  headerTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  headerAddButton: {
    height: 40,
    paddingHorizontal: 13,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  headerAddButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  /* PAGE TITLE */

  pageTitleContainer: {
    marginBottom: 18,
  },

  pageTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 21,
    lineHeight: 28,
    color: '#172033',
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: "#777B87",
  },

  /* SUMMARY */

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 16,
  },

  summaryCard: {
    flex: 1,
    minWidth: 145,
    minHeight: 78,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  summaryInfo: {
    flex: 1,
    minWidth: 0,
  },

  summaryTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#748096',
  },

  summaryValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    lineHeight: 23,
    color: '#172033',
    marginTop: 1,
  },

  /* STATUS */

  statusOverview: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    fontWeight: "800",
    color: "#20222A",
  },

  sectionSubtitle: {
    fontSize: 12,
    color: "#888C97",
    marginTop: 3,
  },

  legendContainer: {
    marginTop: 14,
    gap: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
  },

  legendText: {
    fontSize: 12,
    color: "#626671",
  },

  donutWrapper: {
    width: 78,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
  },

  donutCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },

  donutTotal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#20222A",
  },

  donutLabel: {
    fontSize: 8,
    color: "#888C97",
    marginTop: -2,
  },

  /* SEARCH */

  searchContainer: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E7EC",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 11,
  },

  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    fontSize: 14,
    color: "#20222A",
  },

  /* FILTER */

  filterContainer: {
    gap: 8,
    paddingBottom: 17,
  },

  filterButton: {
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E3E4E9",
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    backgroundColor: "#7040D5",
    borderColor: "#7040D5",
  },

  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#686C77",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  /* RESULTS */

  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20222A",
  },

  resultCount: {
    fontSize: 12,
    color: "#858894",
  },

  /* BATCH CARD */

  batchCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 15,
    marginBottom: 13,
  },

  batchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  batchTitleArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  batchIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  batchTitleText: {
    flex: 1,
  },

  batchName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#20222A",
    lineHeight: 20,
  },

  batchCode: {
    fontSize: 11,
    color: "#8B8F9B",
    marginTop: 3,
    fontWeight: "600",
  },

  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F9",
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 13,
  },

  infoItem: {
    width: "46%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  infoLabel: {
    fontSize: 10,
    color: "#999CA6",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 12,
    color: "#373A43",
    fontWeight: "700",
  },

  divider: {
    height: 1,
    backgroundColor: "#F0F0F3",
    marginVertical: 15,
  },

  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  scheduleLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    flex: 1,
  },

  scheduleText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#373A43",
  },

  daysText: {
    fontSize: 10,
    color: "#8A8E99",
    marginTop: 3,
  },

  statusBadge: {
    minHeight: 27,
    paddingHorizontal: 9,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  capacityContainer: {
    marginTop: 15,
  },

  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 7,
  },

  capacityLabel: {
    fontSize: 10,
    color: "#858995",
  },

  capacityPercentage: {
    fontSize: 10,
    color: "#7040D5",
    fontWeight: "800",
  },

  progressBackground: {
    height: 6,
    borderRadius: 5,
    backgroundColor: "#EEEEF2",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#7040D5",
  },

  /* EMPTY */

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 40,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#33353D",
    marginTop: 10,
  },

  emptyText: {
    fontSize: 12,
    color: "#8A8D97",
    marginTop: 5,
  },

  assignmentActionHeader: {
    flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 10,
},

assignmentActionTeacher: {
  fontSize: 11,
  color: "#7040D5",
  fontWeight: "700",
  marginTop: 2,
},

  /* MODALS */

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "flex-end",
  },

  actionModal: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 35,
  },

  modalHandle: {
    width: 38,
    height: 4,
    borderRadius: 3,
    backgroundColor: "#D8D9DE",
    alignSelf: "center",
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#20222A",
  },

  modalSubtitle: {
    fontSize: 12,
    color: "#858995",
    marginTop: 4,
    marginBottom: 15,
  },

  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F4",
  },

  actionIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  actionTextArea: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#30323A",
  },

  actionDescription: {
    fontSize: 11,
    color: "#9295A0",
    marginTop: 3,
  },

  changeTeacherInfoCard: {
  backgroundColor: "#F1EAFF",
  borderRadius: 13,
  padding: 13,
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginBottom: 20,
},

changeTeacherSubject: {
  fontSize: 13,
  fontWeight: "800",
  color: "#30323A",
},

changeTeacherCurrent: {
  fontSize: 10,
  color: "#777B87",
  marginTop: 4,
},

  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.38)",
    justifyContent: "flex-end",
  },

  viewModal: {
    width: "100%",
    maxHeight: "92%",
    backgroundColor: "#F7F7FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  editModal: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#F7F7FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  assignModal: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#F7F7FA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },

  sheetHandle: {
    position: "absolute",
    top: 7,
    left: "50%",
    marginLeft: -19,
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#D2D3D9",
  },

  viewHeader: {
    paddingTop: 14,
    paddingHorizontal: 17,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#ECECF1",
  },

  viewModalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    fontWeight: "800",
    color: "#20222A",
  },

  viewModalSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: "#888C97",
    marginTop: 3,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F2F2F5",
    alignItems: "center",
    justifyContent: "center",
  },

  viewContent: {
    padding: 16,
    paddingBottom: 40,
  },

  /* VIEW DETAILS */

  batchDetailHero: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ECECF1",
  },

  detailHeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
  },

  detailHeroText: {
    flex: 1,
    marginLeft: 12,
  },

  detailHeroTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#20222A",
  },

  detailHeroCode: {
    fontSize: 11,
    color: "#888C97",
    marginTop: 4,
  },

  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#252730",
    marginTop: 20,
    marginBottom: 9,
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  detailBox: {
    width: "48%",
    minHeight: 72,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 11,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  detailBoxText: {
    flex: 1,
  },

  detailBoxLabel: {
    fontSize: 10,
    color: "#9396A1",
  },

  detailBoxValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#363942",
    marginTop: 3,
  },

  scheduleDetailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  scheduleIconBox: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  scheduleDetailTime: {
    fontSize: 14,
    fontWeight: "800",
    color: "#30323A",
  },

  scheduleDaysContainer: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 7,
},

scheduleDayBadge: {
  backgroundColor: "#F1EAFF",
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 5,
},

scheduleDayText: {
  fontSize: 10,
  fontWeight: "700",
  color: "#7040D5",
},

  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 14,
  },

  descriptionText: {
    fontSize: 12,
    lineHeight: 19,
    color: "#676B76",
  },

  /* SUBJECTS */

  subjectSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
  },

  subjectSectionSubtitle: {
    fontSize: 11,
    color: "#9295A0",
    marginTop: -5,
    marginBottom: 10,
  },

  assignButton: {
    height: 36,
    paddingHorizontal: 11,
    borderRadius: 10,
    backgroundColor: "#7040D5",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 10,
  },

  assignButtonText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  noSubjectsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 28,
    alignItems: "center",
    marginTop: 12,
  },

  noSubjectsTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#393B44",
    marginTop: 8,
  },

  noSubjectsText: {
    fontSize: 11,
    color: "#8C909A",
    marginTop: 4,
    textAlign: "center",
  },

  subjectAssignmentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ECECF1",
    padding: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center"
  },

  subjectIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  subjectAssignmentMain: {
    flex: 1,
    marginLeft: 10,
  },

  subjectName: {
    fontSize: 13,
    fontWeight: "800",
    color: "#30323A",
  },

  subjectCode: {
    fontSize: 10,
    color: "#9295A0",
    marginTop: 2,
  },

  teacherRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 3,
  },

  teacherName: {
    fontSize: 11,
    color: "#6C707B",
    fontWeight: "600",
  },

  smallStatus: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 9,
  },

  smallStatusText: {
    fontSize: 9,
    fontWeight: "800",
  },

  assignmentRightArea: {
    alignItems: "flex-end",
    justifyContent: "center",
    marginLeft: 8,
    gap: 6,
  },

  assignmentMoreButton: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: "#F7F7F9",
    alignItems: "center",
    justifyContent: "center",
  },

  /* EDIT */

  editContent: {
    padding: 16,
    paddingBottom: 40,
  },

  inputContainer: {
    marginBottom: 15,
  },

  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4A4D57",
    marginBottom: 7,
  },

  input: {
    height: 47,
    backgroundColor: "#FFFFFF",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#E1E2E7",
    paddingHorizontal: 13,
    fontSize: 13,
    color: "#30323A",
  },

  twoColumnRow: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
  },

  readOnlyInfoCard: {
    backgroundColor: "#F1EAFF",
    borderRadius: 13,
    padding: 13,
    marginTop: 4,
    marginBottom: 20,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },

  infoRowLabel: {
    fontSize: 11,
    color: "#777B87",
  },

  infoRowValue: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4B2A96",
  },

  saveButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: "#7040D5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  /* ASSIGN */

  assignContent: {
    padding: 16,
    paddingBottom: 40,
  },

  optionsContainer: {
    gap: 9,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E7EC",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  optionCardSelected: {
    borderColor: "#7040D5",
    backgroundColor: "#F8F5FF",
  },

  optionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F1EAFF",
    alignItems: "center",
    justifyContent: "center",
  },

  teacherOptionIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  optionIconSelected: {
    backgroundColor: "#7040D5",
  },

  optionTextArea: {
    flex: 1,
    marginLeft: 10,
  },

  optionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#30323A",
  },

  optionSubtitle: {
    fontSize: 10,
    color: "#888C97",
    marginTop: 3,
  },

  sampleNotice: {
    marginTop: 20,
    backgroundColor: "#F1EAFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  sampleNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
    color: "#5C467F",
  },

  assignConfirmButton: {
    height: 49,
    backgroundColor: "#7040D5",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 18,
  },

  assignConfirmText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});