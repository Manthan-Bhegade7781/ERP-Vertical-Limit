import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  branchId: string | null;
  day: string;
  category:
    | 'Holiday'
    | 'Examination'
    | 'Academic'
    | 'Event'
    | 'Meeting'
    | 'Other';
  description: string;
  branch: string;
  status: 'Upcoming' | 'Completed';
};

type ApiCalendarEvent = {
  _id: string;
  title: string;
  description?: string;
  date: string;
  category: CalendarEvent['category'] | 'Other';
  branchId?: string | { _id: string; name?: string } | null;
};

type BranchOption = {
  _id: string;
  name: string;
  code?: string;
};

type AcademicYearOption = {
  _id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'inactive';
};

const formatEventDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
};

const mapApiEvent = (item: ApiCalendarEvent): CalendarEvent => {
  const date = new Date(item.date);
  const branchName =
    typeof item.branchId === 'object' && item.branchId !== null
      ? item.branchId.name || 'Selected Branch'
      : item.branchId
        ? 'Selected Branch'
        : 'All Branches';
  const normalizedCategory = item.category;

  return {
    id: item._id,
    title: item.title,
    date: formatEventDate(item.date),
    rawDate: item.date,
    branchId: typeof item.branchId === 'object' && item.branchId !== null
      ? item.branchId._id
      : item.branchId || null,
    day: Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-US', { weekday: 'long' }),
    category: normalizedCategory,
    description: item.description || '',
    branch: branchName,
    status: !Number.isNaN(date.getTime()) && date < new Date(new Date().setHours(0, 0, 0, 0))
      ? 'Completed'
      : 'Upcoming',
  };
};

const filters = [
  'All',
  'Academic',
  'Examination',
  'Holiday',
  'Event',
  'Meeting',
  'Other',
];

const categoryConfig = {
  Academic: {
    background: '#F1EAFF',
    color: '#7040D5',
    icon: 'school-outline' as const,
  },
  Examination: {
    background: '#EAF2FF',
    color: '#2675E8',
    icon: 'file-document-edit-outline' as const,
  },
  Holiday: {
    background: '#E7F8EF',
    color: '#35B878',
    icon: 'beach' as const,
  },
  Event: {
    background: '#FFF1E2',
    color: '#F7941D',
    icon: 'calendar-star' as const,
  },
  Meeting: {
    background: '#FFE9F0',
    color: '#E95386',
    icon: 'account-group-outline' as const,
  },
  Other: {
    background: '#EEF1F5',
    color: '#667085',
    icon: 'calendar-blank-outline' as const,
  },
};

export default function AcademicCalendarPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [academicYear, setAcademicYear] = useState<AcademicYearOption | null>(null);
  const [showBranchPicker, setShowBranchPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventCategory, setNewEventCategory] =
    useState<CalendarEvent['category']>('Academic');
  const [newEventBranchId, setNewEventBranchId] = useState('all');
  const [newEventDescription, setNewEventDescription] = useState('');

  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      const headers = { Authorization: `Bearer ${token}` };

      const [eventsResponse, branchesResponse, academicYearsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/academic-calendar`, { method: 'GET', headers }),
        fetch(`${API_BASE_URL}/branches`, { method: 'GET', headers }).catch(() => null),
        fetch(`${API_BASE_URL}/academic-years`, { method: 'GET', headers }).catch(() => null),
      ]);

      const eventsResult = await eventsResponse.json().catch(() => ({}));
      if (!eventsResponse.ok || !eventsResult.success) {
        throw new Error(eventsResult.message || 'Unable to load academic calendar events.');
      }

      const eventData = eventsResult?.data;
      const apiEvents: ApiCalendarEvent[] = Array.isArray(eventData)
        ? eventData
        : Array.isArray(eventData?.events)
          ? eventData.events
          : Array.isArray(eventsResult?.events)
            ? eventsResult.events
            : [];
      setEvents(apiEvents.map(mapApiEvent));

      if (branchesResponse?.ok) {
        const branchesResult = await branchesResponse.json().catch(() => ({}));
        const branchData = branchesResult?.data ?? branchesResult?.branches;
        const branchList = Array.isArray(branchData)
          ? branchData
          : Array.isArray(branchData?.branches)
            ? branchData.branches
            : [];
        setBranches(branchList.filter((branch: any) => branch?._id && branch?.name));
      }

      if (academicYearsResponse?.ok) {
        const yearsResult = await academicYearsResponse.json().catch(() => ({}));
        const yearData = yearsResult?.data ?? yearsResult?.academicYears;
        const yearList = Array.isArray(yearData)
          ? yearData
          : Array.isArray(yearData?.academicYears)
            ? yearData.academicYears
            : [];
        const validYears: AcademicYearOption[] = yearList.filter(
          (year: any) => year?._id && year?.name,
        );
        const activeYear = validYears.find((year) => year.status === 'active') || validYears[0] || null;
        setAcademicYear(activeYear);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load academic calendar.';
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCalendarData();
    }, [loadCalendarData]),
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesFilter =
        selectedFilter === 'All' ||
        event.category === selectedFilter;

      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        event.branch.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [events, search, selectedFilter]);

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  const resetEventForm = () => {
    setEditingEventId(null);
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventCategory('Academic');
    setNewEventBranchId('all');
    setNewEventDescription('');
  };

  const handleAddEvent = () => {
    resetEventForm();
    setShowAddForm(true);
  };

  const handleSaveNewEvent = async () => {
    if (saving) return;
    if (!newEventTitle.trim()) {
      Alert.alert('Required Field', 'Please enter the event title.');
      return;
    }
    if (!newEventDate.trim()) {
      Alert.alert('Required Field', 'Please enter the event date.');
      return;
    }

    const dateParts = newEventDate.trim().split(/[\/-]/).map((part) => part.trim());
    if (
      dateParts.length !== 3 ||
      !/^\d{1,2}$/.test(dateParts[0]) ||
      !/^\d{1,2}$/.test(dateParts[1]) ||
      !/^\d{4}$/.test(dateParts[2])
    ) {
      Alert.alert('Invalid Date', 'Please enter the date in DD/MM/YYYY format.');
      return;
    }

    const dayNumber = Number(dateParts[0]);
    const monthNumber = Number(dateParts[1]);
    const yearNumber = Number(dateParts[2]);
    const parsedDate = new Date(yearNumber, monthNumber - 1, dayNumber);
    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== yearNumber ||
      parsedDate.getMonth() !== monthNumber - 1 ||
      parsedDate.getDate() !== dayNumber
    ) {
      Alert.alert('Invalid Date', 'Please enter a valid calendar date.');
      return;
    }

    try {
      setSaving(true);
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');

      const payload: Record<string, string | null> = {
        title: newEventTitle.trim(),
        description: newEventDescription.trim(),
        date: `${yearNumber}-${String(monthNumber).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}T00:00:00.000Z`,
        category: newEventCategory,
      };

      // For updates, explicitly send null when the event should apply to all branches.
      // For creates, omitting branchId lets the backend create a global event.
      if (editingEventId) {
        payload.branchId = newEventBranchId === 'all' ? null : newEventBranchId;
      } else if (newEventBranchId !== 'all') {
        payload.branchId = newEventBranchId;
      }

      const response = await fetch(
        editingEventId
          ? `${API_BASE_URL}/academic-calendar/${editingEventId}`
          : `${API_BASE_URL}/academic-calendar`,
        {
          method: editingEventId ? 'PUT' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(
          result.message || (editingEventId ? 'Unable to update calendar event.' : 'Unable to create calendar event.'),
        );
      }

      const wasEditing = Boolean(editingEventId);
      setShowAddForm(false);
      resetEventForm();
      await loadCalendarData();
      Alert.alert(
        wasEditing ? 'Event Updated' : 'Event Added',
        wasEditing ? 'Calendar event has been updated successfully.' : 'Calendar event has been saved successfully.',
      );
    } catch (error) {
      Alert.alert(
        'Unable to Save Event',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAddForm = () => {
    setShowAddForm(false);
    resetEventForm();
  };

  const handleView = (event: CalendarEvent) => {
    Alert.alert(
      'Calendar Event',
      `${event.title}\n\n` +
        `Date: ${event.date}\n` +
        `Day: ${event.day}\n` +
        `Category: ${event.category}\n` +
        `Branch: ${event.branch}\n` +
        `Status: ${event.status}\n\n` +
        event.description
    );
  };

  const handleEdit = (event: CalendarEvent) => {
    const eventDate = new Date(event.rawDate);
    if (Number.isNaN(eventDate.getTime())) {
      Alert.alert('Invalid Event Date', 'This event has an invalid date and cannot be edited.');
      return;
    }

    setEditingEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventDate(
      `${String(eventDate.getDate()).padStart(2, '0')}/${String(eventDate.getMonth() + 1).padStart(2, '0')}/${eventDate.getFullYear()}`,
    );
    setNewEventCategory(event.category);
    setNewEventBranchId(event.branchId || 'all');
    setNewEventDescription(event.description || '');
    setShowAddForm(true);
  };

  const handleDelete = (event: CalendarEvent) => {
    Alert.alert(
      'Delete Calendar Event',
      `Are you sure you want to delete "${event.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void confirmDeleteEvent(event);
          },
        },
      ],
    );
  };

  const confirmDeleteEvent = async (event: CalendarEvent) => {
    try {
      const token = await getToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');

      const response = await fetch(`${API_BASE_URL}/academic-calendar/${event.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to delete calendar event.');
      }

      await loadCalendarData();
      Alert.alert('Event Deleted', 'Calendar event has been deleted successfully.');
    } catch (error) {
      Alert.alert(
        'Unable to Delete Event',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View style={styles.headerTitleArea}>
            <Text style={styles.headerTitle}>
              Academic Calendar
            </Text>

          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddEvent}
            activeOpacity={0.85}
            accessibilityLabel="Add Event"
          >
            <MaterialCommunityIcons
              name="plus"
              size={21}
              color="#7040D5"
            />
          </TouchableOpacity>

        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: insets.bottom + 30,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              width: contentWidth,
            },
          ]}
        >
          {/* PAGE TITLE */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleArea}>
              <Text style={styles.sectionTitle}>
                Academic Calendar Management
              </Text>

              <Text style={styles.sectionSubtitle}>
                Manage academic dates, holidays, examinations and institute events
              </Text>
            </View>

          </View>

          {/* SUMMARY CARDS */}
          <View
            style={[
              styles.statsGrid,
              isDesktop && styles.statsGridDesktop,
            ]}
          >
            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <CalendarStatCard
                icon="calendar-month-outline"
                title="Total Events"
                value={String(events.length)}
                change=""
                type="purple"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <CalendarStatCard
                icon="school-outline"
                title="Academic Events"
                value={String(events.filter((event) => event.category === 'Academic').length)}
                change=""
                type="blue"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <CalendarStatCard
                icon="file-document-edit-outline"
                title="Examinations"
                value={String(events.filter((event) => event.category === 'Examination').length)}
                change=""
                type="orange"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <CalendarStatCard
                icon="party-popper"
                title="Holidays"
                value={String(events.filter((event) => event.category === 'Holiday').length)}
                change=""
                type="green"
              />
            </View>
          </View>

          {/* CALENDAR INFO */}
          <View style={styles.calendarInfoCard}>
            <View style={styles.calendarInfoLeft}>
              <View style={styles.calendarIconBox}>
                <MaterialCommunityIcons
                  name="calendar-month"
                  size={25}
                  color="#7040D5"
                />
              </View>

              <View>
                <Text style={styles.calendarInfoTitle}>
                  {academicYear ? `Academic Year ${academicYear.name}` : 'Academic Calendar'}
                </Text>

                <Text style={styles.calendarInfoSubtitle}>
                  {academicYear ? `Status: ${academicYear.status || 'available'}` : 'No academic year configured'}
                </Text>
              </View>
            </View>

            <View style={styles.yearBadge}>
              <Text style={styles.yearBadgeText} numberOfLines={1}>
                {academicYear?.name || 'No year'}
              </Text>
            </View>
          </View>

          {/* SEARCH + FILTER */}
          <View style={styles.filterCard}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={21}
                color="#8A94A6"
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search events, categories, branches..."
                placeholderTextColor="#A0A8B7"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={19}
                    color="#A0A8B7"
                  />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterRow}
            >
              {filters.map((filter) => {
                const active = selectedFilter === filter;

                return (
                  <TouchableOpacity
                    key={filter}
                    style={[
                      styles.filterButton,
                      active && styles.filterButtonActive,
                    ]}
                    onPress={() => setSelectedFilter(filter)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        active && styles.filterTextActive,
                      ]}
                    >
                      {filter}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {loading ? (
            <View style={styles.emptyCard}>
              <ActivityIndicator size="large" color="#7040D5" />
              <Text style={styles.emptySubtitle}>Loading calendar events...</Text>
            </View>
          ) : loadError ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Unable to load calendar</Text>
              <Text style={styles.emptySubtitle}>{loadError}</Text>
              <TouchableOpacity onPress={loadCalendarData} style={styles.formSaveButton} activeOpacity={0.85}>
                <Text style={styles.formSaveText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* EVENT LIST HEADER */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                Calendar Events
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredEvents.length} event
                {filteredEvents.length === 1 ? '' : 's'} found
              </Text>
            </View>

            <View style={styles.upcomingBadge}>
              <MaterialCommunityIcons
                name="calendar-clock"
                size={16}
                color="#7040D5"
              />

              <Text style={styles.upcomingBadgeText}>
                Upcoming
              </Text>
            </View>
          </View>

          {/* EVENTS */}
          {!loading && !loadError && filteredEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="calendar-search"
                  size={34}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No calendar events found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : !loading && !loadError ? (
            <View
              style={[
                styles.eventGrid,
                isDesktop && styles.eventGridDesktop,
              ]}
            >
              {filteredEvents.map((event) => (
                <CalendarEventCard
                  key={event.id}
                  event={event}
                  isDesktop={isDesktop}
                  onView={() => handleView(event)}
                  onEdit={() => handleEdit(event)}
                  onDelete={() => handleDelete(event)}
                />
              ))}
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={showAddForm}
        transparent
        animationType="fade"
        onRequestClose={handleCloseAddForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addFormCard}>
            <View style={styles.addFormHeader}>
              <View style={styles.addFormTitleArea}>
                <View style={styles.addFormIcon}>
                  <MaterialCommunityIcons
                    name={editingEventId ? 'pencil-outline' : 'calendar-plus-outline'}
                    size={20}
                    color="#7040D5"
                  />
                </View>
                <View style={styles.addFormTextArea}>
                  <Text style={styles.addFormTitle} numberOfLines={1}>
                    {editingEventId ? 'Edit Calendar Event' : 'Add Calendar Event'}
                  </Text>
                  <Text style={styles.addFormSubtitle} numberOfLines={1}>
                    Enter event details
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleCloseAddForm}
                style={styles.closeButton}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={19}
                  color="#707B8F"
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.addFormScroll}
              contentContainerStyle={styles.addFormContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.formLabel}>
                Event Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                placeholder="Enter event title"
                placeholderTextColor="#A0A8B7"
                style={styles.formInput}
              />

              <Text style={styles.formLabel}>
                Event Date <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={newEventDate}
                onChangeText={setNewEventDate}
                placeholder="DD/MM/YYYY"
                placeholderTextColor="#A0A8B7"
                style={styles.formInput}
                keyboardType="numbers-and-punctuation"
              />

              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.formChoiceRow}>
                {filters.slice(1).map((category) => {
                  const selected = newEventCategory === category;

                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.formChoice,
                        selected && styles.formChoiceActive,
                      ]}
                      onPress={() =>
                        setNewEventCategory(
                          category as CalendarEvent['category']
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.formChoiceText,
                          selected && styles.formChoiceTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Branch</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowBranchPicker(true)}
                activeOpacity={0.8}
              >
                <View style={styles.dropdownLeadingIcon}>
                  <MaterialCommunityIcons name="office-building-outline" size={18} color="#7040D5" />
                </View>
                <View style={styles.dropdownTextArea}>
                  <Text style={styles.dropdownValue} numberOfLines={1}>
                    {newEventBranchId === 'all'
                      ? 'All Branches'
                      : branches.find((branch) => branch._id === newEventBranchId)?.name || 'Select branch'}
                  </Text>
                  <Text style={styles.dropdownHint}>Choose where this event applies</Text>
                </View>
                <MaterialCommunityIcons name="chevron-down" size={22} color="#7B8799" />
              </TouchableOpacity>
              {branches.length === 0 && (
                <Text style={styles.helperText}>No active branches were returned by the branches API.</Text>
              )}

              <Text style={styles.formLabel}>Description</Text>
              <TextInput
                value={newEventDescription}
                onChangeText={setNewEventDescription}
                placeholder="Enter event description"
                placeholderTextColor="#A0A8B7"
                style={styles.formTextArea}
                multiline
                textAlignVertical="top"
              />
            </ScrollView>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.formCancelButton}
                onPress={handleCloseAddForm}
                activeOpacity={0.8}
              >
                <Text style={styles.formCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.formSaveButton}
                onPress={handleSaveNewEvent}
                disabled={saving}
                activeOpacity={0.85}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={17}
                  color="#FFFFFF"
                />
                <Text style={styles.formSaveText}>{saving ? (editingEventId ? 'Updating...' : 'Saving...') : (editingEventId ? 'Update Event' : 'Save Event')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showBranchPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBranchPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.branchPickerCard}>
            <View style={styles.branchPickerHeader}>
              <View>
                <Text style={styles.branchPickerTitle}>Select Branch</Text>
                <Text style={styles.branchPickerSubtitle}>Choose the event's branch scope</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowBranchPicker(false)} activeOpacity={0.8}>
                <MaterialCommunityIcons name="close" size={19} color="#707B8F" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.branchPickerList} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.branchOption, newEventBranchId === 'all' && styles.branchOptionSelected]}
                onPress={() => { setNewEventBranchId('all'); setShowBranchPicker(false); }}
                activeOpacity={0.8}
              >
                <View style={[styles.branchOptionIcon, newEventBranchId === 'all' && styles.branchOptionIconSelected]}>
                  <MaterialCommunityIcons name="earth" size={19} color={newEventBranchId === 'all' ? '#7040D5' : '#7B8799'} />
                </View>
                <View style={styles.branchOptionTextArea}>
                  <Text style={[styles.branchOptionTitle, newEventBranchId === 'all' && styles.branchOptionTitleSelected]}>All Branches</Text>
                  <Text style={styles.branchOptionSubtitle}>Make this a global calendar event</Text>
                </View>
                {newEventBranchId === 'all' && <MaterialCommunityIcons name="check-circle" size={21} color="#7040D5" />}
              </TouchableOpacity>
              {branches.map((branch) => {
                const selected = newEventBranchId === branch._id;
                return (
                  <TouchableOpacity
                    key={branch._id}
                    style={[styles.branchOption, selected && styles.branchOptionSelected]}
                    onPress={() => { setNewEventBranchId(branch._id); setShowBranchPicker(false); }}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.branchOptionIcon, selected && styles.branchOptionIconSelected]}>
                      <MaterialCommunityIcons name="office-building-outline" size={19} color={selected ? '#7040D5' : '#7B8799'} />
                    </View>
                    <View style={styles.branchOptionTextArea}>
                      <Text style={[styles.branchOptionTitle, selected && styles.branchOptionTitleSelected]}>{branch.name}</Text>
                      {branch.code ? <Text style={styles.branchOptionSubtitle}>Branch code: {branch.code}</Text> : null}
                    </View>
                    {selected && <MaterialCommunityIcons name="check-circle" size={21} color="#7040D5" />}
                  </TouchableOpacity>
                );
              })}
              {branches.length === 0 && (
                <View style={styles.branchPickerEmpty}>
                  <MaterialCommunityIcons name="office-building-outline" size={28} color="#98A1B2" />
                  <Text style={styles.branchPickerSubtitle}>No active branches available.</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

type CalendarStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  change: string;
  type: 'purple' | 'blue' | 'green' | 'orange';
};

function CalendarStatCard({
  icon,
  title,
  value,
  change,
  type,
}: CalendarStatCardProps) {
  const colors = {
    purple: {
      background: '#F1EAFF',
      icon: '#7040D5',
    },

    blue: {
      background: '#EAF2FF',
      icon: '#2675E8',
    },

    green: {
      background: '#E7F8EF',
      icon: '#35B878',
    },

    orange: {
      background: '#FFF1E2',
      icon: '#F7941D',
    },
  };

  const color = colors[type];

  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <View
          style={[
            styles.statIconBox,
            {
              backgroundColor: color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={color.icon}
          />
        </View>

        {Boolean(change) && (
          <View
            style={[
              styles.changeBadge,
              { backgroundColor: color.background },
            ]}
          >
            <MaterialCommunityIcons name="trending-up" size={12} color={color.icon} />
            <Text style={[styles.changeText, { color: color.icon }]}>{change}</Text>
          </View>
        )}
      </View>

      <View>
        <Text style={styles.statTitle}>
          {title}
        </Text>

        <Text style={styles.statValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   EVENT CARD
============================================================ */

type CalendarEventCardProps = {
  event: CalendarEvent;
  isDesktop: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function CalendarEventCard({
  event,
  isDesktop,
  onView,
  onEdit,
  onDelete,
}: CalendarEventCardProps) {
  const config = categoryConfig[event.category];

  return (
    <View
      style={[
        styles.eventCard,
        isDesktop && styles.eventCardDesktop,
      ]}
    >
      {/* TOP */}
      <View style={styles.eventTop}>
        <View
          style={[
            styles.eventIconBox,
            {
              backgroundColor: config.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name={config.icon}
            size={23}
            color={config.color}
          />
        </View>

        <View style={styles.eventTitleArea}>
          <Text
            style={styles.eventTitle}
            numberOfLines={2}
          >
            {event.title}
          </Text>

          <Text style={styles.eventDay}>
            {event.day}
          </Text>
        </View>

        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: config.background,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryBadgeText,
              {
                color: config.color,
              },
            ]}
          >
            {event.category}
          </Text>
        </View>
      </View>

      {/* DATE */}
      <View style={styles.dateBox}>
        <View style={styles.dateIcon}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={18}
            color="#7040D5"
          />
        </View>

        <View style={styles.dateTextArea}>
          <Text style={styles.dateLabel}>
            Event Date
          </Text>

          <Text style={styles.dateValue}>
            {event.date}
          </Text>
        </View>
      </View>

      {/* DESCRIPTION */}
      <Text
        style={styles.eventDescription}
        numberOfLines={2}
      >
        {event.description}
      </Text>

      {/* BRANCH */}
      <View style={styles.branchRow}>
        <MaterialCommunityIcons
          name="office-building-outline"
          size={17}
          color="#7B8799"
        />

        <View style={styles.branchTextArea}>
          <Text style={styles.branchLabel}>
            Branch
          </Text>

          <Text style={styles.branchValue}>
            {event.branch}
          </Text>
        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.eventFooter}>
        <View
          style={[
            styles.statusBadge,
            event.status === 'Upcoming'
              ? styles.upcomingStatus
              : styles.completedStatus,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              event.status === 'Upcoming'
                ? styles.upcomingDot
                : styles.completedDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              event.status === 'Upcoming'
                ? styles.upcomingText
                : styles.completedText,
            ]}
          >
            {event.status}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={onView}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="eye-outline"
              size={16}
              color="#7040D5"
            />

            <Text style={styles.viewButtonText}>
              View
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.editButton}
            onPress={onEdit}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={16}
              color="#2675E8"
            />

            <Text style={styles.editButtonText}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.8}
            accessibilityLabel={`Delete ${event.title}`}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color="#D92D45"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  header: {
    backgroundColor: '#7040D5',
    paddingHorizontal: 16,
    paddingBottom: 15,
  },

  headerInner: {
    width: '100%',
    maxWidth: 1500,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 8,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    flexShrink: 1,
  },

  headerAction: {
    width: 42,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  headerSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  content: {
    paddingTop: 22,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  sectionTitleArea: {
    flex: 1,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
  },

  sectionSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#7B8799',
    marginTop: 2,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },

  statsGridDesktop: {
    flexWrap: 'nowrap',
  },

  statCardWrapper: {
    width: '47%',
  },

  statCardWrapperDesktop: {
    flex: 1,
    width: undefined,
  },

  statCard: {
    height: 145,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  statTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  statIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  changeBadge: {
    minHeight: 26,
    borderRadius: 8,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  changeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    marginLeft: 3,
  },

  statTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#748096',
    marginBottom: 2,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 25,
    color: '#172033',
  },

  calendarInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 15,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  calendarInfoLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  calendarIconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarInfoTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#172033',
    marginLeft: 11,
  },

  calendarInfoSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8993A4',
    marginLeft: 11,
    marginTop: 2,
  },

  yearBadge: {
    minWidth: 78,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  yearBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
  },

  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 14,
    marginBottom: 22,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  searchContainer: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 11,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFCFE',
  },

  searchInput: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#172033',
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterScroll: {
    marginTop: 11,
  },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },

  filterButton: {
    minWidth: 70,
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#7040D5',
  },

  filterText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10,
    color: '#707B8F',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 13,
  },

  listTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#172033',
  },

  listSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#8993A4',
    marginTop: 1,
  },

  upcomingBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  upcomingBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  eventGrid: {
    gap: 12,
  },

  eventGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  eventCard: {
    width: '100%',
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
    elevation: 3,
  },

  eventCardDesktop: {
    width: '32.4%',
  },

  eventTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  eventIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  eventTitleArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 10,
    marginRight: 6,
  },

  eventTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12.5,
    color: '#172033',
    lineHeight: 17,
  },

  eventDay: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A94A6',
    marginTop: 2,
  },

  categoryBadge: {
    minHeight: 25,
    maxWidth: 92,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },

  categoryBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    flexShrink: 1,
  },

  dateBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    width: 35,
    height: 35,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dateTextArea: {
    marginLeft: 9,
  },

  dateLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#98A1B2',
  },

  dateValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#3B4658',
    marginTop: 1,
  },

  eventDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#7B8799',
    lineHeight: 15,
    marginTop: 12,
  },

  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },

  branchTextArea: {
    marginLeft: 8,
    flex: 1,
  },

  branchLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#9AA3B2',
  },

  branchValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#3B4658',
    marginTop: 1,
  },

  eventFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusBadge: {
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },

  upcomingStatus: {
    backgroundColor: '#EAF2FF',
  },

  completedStatus: {
    backgroundColor: '#E7F8EF',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  upcomingDot: {
    backgroundColor: '#2675E8',
  },

  completedDot: {
    backgroundColor: '#35B878',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
  },

  upcomingText: {
    color: '#2675E8',
  },

  completedText: {
    color: '#26955E',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 7,
    flexShrink: 0,
  },

  viewButton: {
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  viewButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#7040D5',
    marginLeft: 4,
  },

  editButton: {
    height: 32,
    paddingHorizontal: 9,
    borderRadius: 8,
    backgroundColor: '#EAF2FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#2675E8',
    marginLeft: 4,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF0F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 22, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },

  addFormCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },

  addFormHeader: {
    minHeight: 66,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  addFormTitleArea: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  addFormIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  addFormTextArea: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  addFormTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
    color: '#172033',
  },

  addFormSubtitle: {
    marginTop: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8993A4',
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    flexShrink: 0,
  },

  addFormScroll: {
    maxHeight: 560,
  },

  addFormContent: {
    padding: 15,
  },

  formLabel: {
    marginBottom: 6,
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    lineHeight: 15,
    color: '#555E70',
  },

  required: {
    color: '#E95386',
  },

  formInput: {
    minWidth: 0,
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 10,
    backgroundColor: '#FBFCFE',
    paddingHorizontal: 12,
    marginBottom: 13,
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#303544',
  },

  dropdownTrigger: {
    width: '100%',
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E0E5EF',
    backgroundColor: '#FFFFFF',
    marginBottom: 13,
  },
  dropdownLeadingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropdownTextArea: { flex: 1, minWidth: 0 },
  dropdownValue: { fontFamily: 'PoppinsSemiBold', fontSize: 12, color: '#172033' },
  dropdownHint: { fontFamily: 'PoppinsRegular', fontSize: 9.5, color: '#8993A4', marginTop: 2 },
  helperText: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#8993A4', marginTop: -7, marginBottom: 12 },
  branchPickerCard: {
    width: '100%',
    maxWidth: 480,
    maxHeight: '78%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEF0F5',
    elevation: 10,
  },
  branchPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },
  branchPickerTitle: { fontFamily: 'PoppinsSemiBold', fontSize: 16, color: '#172033' },
  branchPickerSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 10, color: '#8993A4', marginTop: 3 },
  branchPickerList: { paddingHorizontal: 12, paddingVertical: 8 },
  branchOption: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 6,
  },
  branchOptionSelected: { backgroundColor: '#F7F2FF', borderColor: '#D9C8F8' },
  branchOptionIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  branchOptionIconSelected: { backgroundColor: '#EDE3FF' },
  branchOptionTextArea: { flex: 1, minWidth: 0 },
  branchOptionTitle: { fontFamily: 'PoppinsMedium', fontSize: 12, color: '#3B4658' },
  branchOptionTitleSelected: { fontFamily: 'PoppinsSemiBold', color: '#7040D5' },
  branchOptionSubtitle: { fontFamily: 'PoppinsRegular', fontSize: 9.5, color: '#8993A4', marginTop: 2 },
  branchPickerEmpty: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  formChoiceRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 13,
  },

  formChoice: {
    minWidth: 82,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    backgroundColor: '#FBFCFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '28%',
  },

  formChoiceActive: {
    borderColor: '#CDB8F5',
    backgroundColor: '#F1EAFF',
  },

  formChoiceText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#707B8F',
  },

  formChoiceTextActive: {
    color: '#7040D5',
  },

  formTextArea: {
    minWidth: 0,
    width: '100%',
    minHeight: 82,
    borderWidth: 1,
    borderColor: '#E3E7EF',
    borderRadius: 10,
    backgroundColor: '#FBFCFE',
    paddingHorizontal: 12,
    paddingTop: 11,
    marginBottom: 2,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 15,
    color: '#303544',
  },

  formActions: {
    padding: 13,
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    flexDirection: 'row',
    gap: 8,
  },

  formCancelButton: {
    flex: 1,
    height: 45,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE1E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  formCancelText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#6D7789',
  },

  formSaveButton: {
    flex: 1.35,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#7040D5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  formSaveText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#FFFFFF',
  },

  emptyCard: {
    minHeight: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10.5,
    color: '#8A94A6',
    marginTop: 5,
  },
});