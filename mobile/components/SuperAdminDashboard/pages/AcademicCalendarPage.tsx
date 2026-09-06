import React, { useMemo, useState } from 'react';
import {
  Alert,
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
import { router } from 'expo-router';

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  day: string;
  category:
    | 'Holiday'
    | 'Examination'
    | 'Academic'
    | 'Event'
    | 'Meeting';
  description: string;
  branch: string;
  status: 'Upcoming' | 'Completed';
};

const calendarEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'First Semester Begins',
    date: '08 Jun 2026',
    day: 'Monday',
    category: 'Academic',
    description: 'Beginning of the academic session for the first semester.',
    branch: 'All Branches',
    status: 'Completed',
  },
  {
    id: '2',
    title: 'Independence Day',
    date: '15 Aug 2026',
    day: 'Saturday',
    category: 'Holiday',
    description: 'Institute holiday on the occasion of Independence Day.',
    branch: 'All Branches',
    status: 'Completed',
  },
  {
    id: '3',
    title: 'Internal Assessment - I',
    date: '21 Sep 2026',
    day: 'Monday',
    category: 'Examination',
    description: 'First internal assessment examination.',
    branch: 'All Branches',
    status: 'Upcoming',
  },
  {
    id: '4',
    title: 'Teachers Meeting',
    date: '28 Sep 2026',
    day: 'Monday',
    category: 'Meeting',
    description: 'Monthly academic review meeting for teaching staff.',
    branch: 'Main Branch',
    status: 'Upcoming',
  },
  {
    id: '5',
    title: 'Gandhi Jayanti',
    date: '02 Oct 2026',
    day: 'Friday',
    category: 'Holiday',
    description: 'Institute holiday on the occasion of Gandhi Jayanti.',
    branch: 'All Branches',
    status: 'Upcoming',
  },
  {
    id: '6',
    title: 'Annual Sports Day',
    date: '17 Oct 2026',
    day: 'Saturday',
    category: 'Event',
    description: 'Annual sports and cultural activities.',
    branch: 'Pune Branch',
    status: 'Upcoming',
  },
  {
    id: '7',
    title: 'Mid Semester Examination',
    date: '09 Nov 2026',
    day: 'Monday',
    category: 'Examination',
    description: 'Mid semester examination for eligible batches.',
    branch: 'All Branches',
    status: 'Upcoming',
  },
  {
    id: '8',
    title: 'Winter Vacation',
    date: '21 Dec 2026',
    day: 'Monday',
    category: 'Holiday',
    description: 'Winter vacation begins.',
    branch: 'All Branches',
    status: 'Upcoming',
  },
];

const filters = [
  'All',
  'Academic',
  'Examination',
  'Holiday',
  'Event',
  'Meeting',
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
};

export default function AcademicCalendarPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return calendarEvents.filter((event) => {
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
  }, [search, selectedFilter]);

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  const handleAddEvent = () => {
    Alert.alert(
      'Add Calendar Event',
      'Calendar event creation form will be connected here.'
    );
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
    Alert.alert(
      'Edit Event',
      `Edit options for "${event.title}" will be available here.`
    );
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
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#7040D5"
            />

            <Text style={styles.headerActionText}>
              Add Event
            </Text>
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
                value="24"
                change="6.2%"
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
                value="8"
                change="7.5%"
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
                value="6"
                change="5.4%"
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
                value="10"
                change="8.1%"
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
                  Academic Year 2026 - 27
                </Text>

                <Text style={styles.calendarInfoSubtitle}>
                  Current academic calendar
                </Text>
              </View>
            </View>

            <View style={styles.yearBadge}>
              <Text style={styles.yearBadgeText}>
                2026 - 27
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
          {filteredEvents.length === 0 ? (
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
          ) : (
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
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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

        <View
          style={[
            styles.changeBadge,
            {
              backgroundColor: color.background,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="trending-up"
            size={12}
            color={color.icon}
          />

          <Text
            style={[
              styles.changeText,
              {
                color: color.icon,
              },
            ]}
          >
            {change}
          </Text>
        </View>
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
};

function CalendarEventCard({
  event,
  isDesktop,
  onView,
  onEdit,
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
    marginLeft: 12,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
    color: '#FFFFFF',
  },

  headerAction: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerActionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10.5,
    color: '#7040D5',
    marginLeft: 5,
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
    width: '48%',
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
    fontSize: 10.5,
    color: '#748096',
    marginBottom: 2,
  },

  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 23,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: 10,
    marginRight: 6,
  },

  eventTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
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
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
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
    fontSize: 9.5,
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