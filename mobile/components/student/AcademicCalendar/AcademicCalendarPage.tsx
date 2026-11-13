import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  fetchStudentCalendarEvents,
  StudentCalendarEvent,
  CalendarCategory,
} from '../../../services/academicCalendar';

type AcademicCalendarPageProps = {
  onContentScroll?: (event: any) => void;
};

const CATEGORIES = [
  'All',
  'Academic',
  'Examination',
  'Holiday',
  'Event',
  'Meeting',
  'Other',
] as const;

type FilterCategory = (typeof CATEGORIES)[number];

const categoryConfig: Record<
  string,
  { bg: string; text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }
> = {
  All: { bg: '#F4F0FF', text: '#6630D7', icon: 'calendar-month-outline' },
  Academic: { bg: '#EFF6FF', text: '#2563EB', icon: 'school-outline' },
  Examination: { bg: '#FDF4FF', text: '#C026D3', icon: 'clipboard-text-outline' },
  Holiday: { bg: '#FEF2F2', text: '#DC2626', icon: 'beach' },
  Event: { bg: '#ECFDF5', text: '#059669', icon: 'calendar-star' },
  Meeting: { bg: '#FFF7ED', text: '#EA580C', icon: 'account-group-outline' },
  Other: { bg: '#F8FAFC', text: '#475569', icon: 'calendar-outline' },
};

export default function AcademicCalendarPage({ onContentScroll }: AcademicCalendarPageProps) {
  const [events, setEvents] = useState<StudentCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'Upcoming' | 'Completed'>('All');

  const [selectedEvent, setSelectedEvent] = useState<StudentCalendarEvent | null>(null);

  const loadEvents = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchStudentCalendarEvents();
      // Sort upcoming first, then by date
      data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load calendar events.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const onRefresh = useCallback(() => {
    void loadEvents(true);
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (selectedCategory !== 'All' && ev.category !== selectedCategory) {
        return false;
      }
      if (selectedStatus !== 'All' && ev.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const titleMatch = ev.title.toLowerCase().includes(q);
        const descMatch = ev.description.toLowerCase().includes(q);
        const catMatch = ev.category.toLowerCase().includes(q);
        return titleMatch || descMatch || catMatch;
      }
      return true;
    });
  }, [events, selectedCategory, selectedStatus, searchQuery]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6630D7']}
            tintColor="#6630D7"
          />
        }
      >
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={22} color="#8A92A6" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search calendar events..."
            placeholderTextColor="#8A92A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#8A92A6" />
            </TouchableOpacity>
          )}
        </View>

        {/* STATUS TOGGLE */}
        <View style={styles.statusRow}>
          {(['All', 'Upcoming', 'Completed'] as const).map((s) => {
            const isSelected = selectedStatus === s;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedStatus(s)}
                style={[styles.statusChip, isSelected && styles.statusChipSelected]}
                activeOpacity={0.7}
              >
                <Text style={[styles.statusChipText, isSelected && styles.statusChipTextSelected]}>
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CATEGORY SCROLL */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const config = categoryConfig[cat] || categoryConfig.Other;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryChip,
                  isSelected
                    ? { backgroundColor: '#6630D7', borderColor: '#6630D7' }
                    : { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
                ]}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={config.icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : config.text}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected ? { color: '#FFFFFF' } : { color: '#475569' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SUMMARY */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing <Text style={styles.summaryBold}>{filteredEvents.length}</Text> event{filteredEvents.length === 1 ? '' : 's'}
          </Text>
          {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery !== '') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSearchQuery('');
              }}
            >
              <Text style={styles.resetFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LOADING */}
        {loading && !refreshing && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading academic calendar...</Text>
          </View>
        )}

        {/* ERROR */}
        {!loading && error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#EF4444" />
            <Text style={styles.errorTitle}>Could not load calendar</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadEvents()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* EMPTY */}
        {!loading && !error && filteredEvents.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={42} color="#6630D7" />
            </View>
            <Text style={styles.emptyTitle}>No events found</Text>
            <Text style={styles.emptySubtitle}>
              There are no events matching your criteria right now.
            </Text>
          </View>
        )}

        {/* EVENT CARDS */}
        {!loading &&
          !error &&
          filteredEvents.map((ev) => {
            const config = categoryConfig[ev.category] || categoryConfig.Other;
            const parsedDate = new Date(ev.date);
            const dateNum = !Number.isNaN(parsedDate.getTime()) ? parsedDate.getDate() : '--';
            const monthShort = !Number.isNaN(parsedDate.getTime())
              ? parsedDate.toLocaleString('en-IN', { month: 'short' })
              : '';

            return (
              <TouchableOpacity
                key={ev.id}
                style={styles.eventCard}
                onPress={() => setSelectedEvent(ev)}
                activeOpacity={0.85}
              >
                {/* DATE BOX */}
                <View style={styles.dateBlock}>
                  <Text style={styles.dateNumText}>{dateNum}</Text>
                  <Text style={styles.dateMonthText}>{monthShort}</Text>
                </View>

                {/* CONTENT */}
                <View style={styles.eventDetails}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.catBadge, { backgroundColor: config.bg }]}>
                      <MaterialCommunityIcons name={config.icon} size={12} color={config.text} style={{ marginRight: 4 }} />
                      <Text style={[styles.catBadgeText, { color: config.text }]}>{ev.category}</Text>
                    </View>

                    <View style={[styles.statusBadge, ev.status === 'Upcoming' ? styles.statusUpcoming : styles.statusCompleted]}>
                      <Text style={[styles.statusText, ev.status === 'Upcoming' ? styles.statusUpcomingText : styles.statusCompletedText]}>
                        {ev.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {ev.title}
                  </Text>

                  {ev.description ? (
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {ev.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="clock-outline" size={13} color="#8A92A6" />
                      <Text style={styles.metaText}>{ev.day || 'All Day'}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <MaterialCommunityIcons name="office-building-outline" size={13} color="#8A92A6" />
                      <Text style={styles.metaText} numberOfLines={1}>{ev.branchName}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {/* EVENT DETAIL MODAL */}
      <Modal
        visible={Boolean(selectedEvent)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedEvent(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedEvent(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            {selectedEvent && (
              <>
                <View style={styles.modalHeader}>
                  <View style={[styles.catBadge, { backgroundColor: (categoryConfig[selectedEvent.category] || categoryConfig.Other).bg }]}>
                    <Text style={[styles.catBadgeText, { color: (categoryConfig[selectedEvent.category] || categoryConfig.Other).text }]}>
                      {selectedEvent.category}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => setSelectedEvent(null)} style={styles.modalCloseButton}>
                    <MaterialCommunityIcons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedEvent.title}</Text>

                <View style={styles.modalMetaBox}>
                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Date & Day</Text>
                    <Text style={styles.modalMetaVal}>{selectedEvent.formattedDate} ({selectedEvent.day})</Text>
                  </View>
                  <View style={[styles.modalMetaRow, { marginTop: 8 }]}>
                    <Text style={styles.modalMetaLabel}>Campus / Branch</Text>
                    <Text style={styles.modalMetaVal}>{selectedEvent.branchName}</Text>
                  </View>
                  <View style={[styles.modalMetaRow, { marginTop: 8 }]}>
                    <Text style={styles.modalMetaLabel}>Status</Text>
                    <Text style={[styles.modalMetaVal, { color: selectedEvent.status === 'Upcoming' ? '#10B981' : '#64748B' }]}>
                      {selectedEvent.status}
                    </Text>
                  </View>
                </View>

                {selectedEvent.description ? (
                  <ScrollView style={{ maxHeight: 200, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
                    <Text style={styles.modalDesc}>{selectedEvent.description}</Text>
                  </ScrollView>
                ) : null}

                <TouchableOpacity style={styles.modalButton} onPress={() => setSelectedEvent(null)}>
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#111528',
    paddingVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statusChipSelected: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },
  statusChipText: {
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
    color: '#64748B',
  },
  statusChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
  },
  categoryScroll: {
    paddingBottom: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  summaryBold: {
    fontFamily: 'PoppinsBold',
    color: '#111528',
  },
  resetFilterText: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#1A0B40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  dateBlock: {
    width: 58,
    height: 64,
    borderRadius: 14,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E9DDFF',
  },
  dateNumText: {
    fontSize: 20,
    fontFamily: 'PoppinsBold',
    color: '#6630D7',
    lineHeight: 24,
  },
  dateMonthText: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusUpcoming: {
    backgroundColor: '#ECFDF5',
  },
  statusUpcomingText: {
    color: '#059669',
  },
  statusCompleted: {
    backgroundColor: '#F1F5F9',
  },
  statusCompletedText: {
    color: '#64748B',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
  },
  eventTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 8,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#8A92A6',
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginTop: 8,
  },
  errorMessage: {
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    marginTop: 4,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6630D7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalMetaLabel: {
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
    color: '#64748B',
  },
  modalMetaVal: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#1E293B',
  },
  modalDesc: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#334155',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#6630D7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
});
