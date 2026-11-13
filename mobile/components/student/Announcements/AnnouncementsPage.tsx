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
  fetchStudentAnnouncements,
  StudentAnnouncement,
  AnnouncementPriority,
} from '../../../services/announcements';

type AnnouncementsPageProps = {
  onContentScroll?: (event: any) => void;
};

const CATEGORIES = [
  'All',
  'Academic',
  'Examination',
  'Results',
  'Attendance',
  'Fees',
  'PTG',
  'Events',
  'Holiday',
  'Notice',
  'General',
] as const;

type CategoryType = (typeof CATEGORIES)[number];

const categoryIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  All: 'view-grid-outline',
  Academic: 'school-outline',
  Examination: 'clipboard-text-outline',
  Results: 'trophy-outline',
  Attendance: 'calendar-check-outline',
  Fees: 'cash-multiple',
  PTG: 'account-group-outline',
  Events: 'calendar-star',
  Holiday: 'beach',
  Notice: 'bulletin-board',
  General: 'bullhorn-outline',
};

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  All: { bg: '#F4F0FF', text: '#6630D7', border: '#DCD0FF' },
  Academic: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  Examination: { bg: '#FDF4FF', text: '#C026D3', border: '#F5D0FE' },
  Results: { bg: '#FEF9C3', text: '#CA8A04', border: '#FEF08A' },
  Attendance: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
  Fees: { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
  PTG: { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' },
  Events: { bg: '#FAF5FF', text: '#9333EA', border: '#E9D5FF' },
  Holiday: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  Notice: { bg: '#F8FAFC', text: '#475569', border: '#CBD5E1' },
  General: { bg: '#F4F0FF', text: '#6630D7', border: '#DCD0FF' },
};

const priorityConfig: Record<
  AnnouncementPriority,
  { bg: string; text: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string }
> = {
  High: {
    bg: '#FEE2E2',
    text: '#DC2626',
    icon: 'alert-circle-outline',
    label: 'High Priority',
  },
  Medium: {
    bg: '#FEF3C7',
    text: '#D97706',
    icon: 'alert-outline',
    label: 'Medium Priority',
  },
  Low: {
    bg: '#E0E7FF',
    text: '#4338CA',
    icon: 'information-outline',
    label: 'Low Priority',
  },
};

const formatDisplayDate = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AnnouncementsPage({ onContentScroll }: AnnouncementsPageProps) {
  const [announcements, setAnnouncements] = useState<StudentAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const [selectedAnnouncement, setSelectedAnnouncement] = useState<StudentAnnouncement | null>(null);

  const loadAnnouncements = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await fetchStudentAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load announcements.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const onRefresh = useCallback(() => {
    void loadAnnouncements(true);
  }, [loadAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }
      // Priority filter
      if (selectedPriority !== 'All' && item.priority !== selectedPriority) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const catMatch = item.category.toLowerCase().includes(query);
        const creatorMatch = item.createdBy.toLowerCase().includes(query);
        return titleMatch || descMatch || catMatch || creatorMatch;
      }
      return true;
    });
  }, [announcements, selectedCategory, selectedPriority, searchQuery]);

  // Counts for categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: announcements.length };
    announcements.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });
    return counts;
  }, [announcements]);

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
        {/* TOP SEARCH BAR */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#8A92A6"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            placeholderTextColor="#8A92A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#8A92A6" />
            </TouchableOpacity>
          )}
        </View>

        {/* PRIORITY FILTER CHIPS */}
        <View style={styles.priorityRow}>
          {['All', 'High', 'Medium', 'Low'].map((p) => {
            const isSelected = selectedPriority === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setSelectedPriority(p)}
                style={[
                  styles.priorityChip,
                  isSelected && styles.priorityChipSelected,
                ]}
                activeOpacity={0.7}
              >
                {p === 'High' && (
                  <View style={[styles.priorityDot, { backgroundColor: '#DC2626' }]} />
                )}
                {p === 'Medium' && (
                  <View style={[styles.priorityDot, { backgroundColor: '#D97706' }]} />
                )}
                {p === 'Low' && (
                  <View style={[styles.priorityDot, { backgroundColor: '#4338CA' }]} />
                )}
                <Text
                  style={[
                    styles.priorityChipText,
                    isSelected && styles.priorityChipTextSelected,
                  ]}
                >
                  {p === 'All' ? 'All Priority' : p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CATEGORY HORIZONTAL SCROLL */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            const colors = categoryColors[cat] || categoryColors.General;
            const icon = categoryIcons[cat] || 'bullhorn-outline';

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
                  name={icon}
                  size={15}
                  color={isSelected ? '#FFFFFF' : colors.text}
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
                {count > 0 && (
                  <View
                    style={[
                      styles.categoryCountBadge,
                      isSelected
                        ? { backgroundColor: 'rgba(255, 255, 255, 0.25)' }
                        : { backgroundColor: colors.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryCountText,
                        isSelected ? { color: '#FFFFFF' } : { color: colors.text },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* SUMMARY BAR */}
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            Showing <Text style={styles.summaryBold}>{filteredAnnouncements.length}</Text>{' '}
            announcement{filteredAnnouncements.length === 1 ? '' : 's'}
          </Text>
          {(selectedCategory !== 'All' || selectedPriority !== 'All' || searchQuery !== '') && (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory('All');
                setSelectedPriority('All');
                setSearchQuery('');
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.resetFilterText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* LOADING STATE */}
        {loading && !refreshing && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#6630D7" />
            <Text style={styles.loadingText}>Loading announcements...</Text>
          </View>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <View style={styles.errorContainer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={44} color="#EF4444" />
            <Text style={styles.errorTitle}>Could not load announcements</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => void loadAnnouncements()}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredAnnouncements.length === 0 && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="bullhorn-outline" size={42} color="#6630D7" />
            </View>
            <Text style={styles.emptyTitle}>No announcements found</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
                ? 'Try adjusting your filters or search keywords.'
                : 'There are no announcements posted for your batch right now.'}
            </Text>
            {(selectedCategory !== 'All' || selectedPriority !== 'All' || searchQuery !== '') && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={() => {
                  setSelectedCategory('All');
                  setSelectedPriority('All');
                  setSearchQuery('');
                }}
              >
                <Text style={styles.clearFilterButtonText}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ANNOUNCEMENT CARDS */}
        {!loading &&
          !error &&
          filteredAnnouncements.map((item) => {
            const catColors = categoryColors[item.category] || categoryColors.General;
            const catIcon = categoryIcons[item.category] || 'bullhorn-outline';
            const priorityInfo = priorityConfig[item.priority] || priorityConfig.Medium;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.announcementCard}
                onPress={() => setSelectedAnnouncement(item)}
                activeOpacity={0.85}
              >
                {/* CARD TOP ROW */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: catColors.bg, borderColor: catColors.border },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={catIcon}
                      size={13}
                      color={catColors.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.categoryBadgeText, { color: catColors.text }]}>
                      {item.category}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: priorityInfo.bg },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={priorityInfo.icon}
                      size={12}
                      color={priorityInfo.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.priorityBadgeText, { color: priorityInfo.text }]}>
                      {item.priority}
                    </Text>
                  </View>
                </View>

                {/* TITLE */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {/* DESCRIPTION */}
                <Text style={styles.cardDescription} numberOfLines={3}>
                  {item.description}
                </Text>

                {/* CARD FOOTER */}
                <View style={styles.cardFooter}>
                  <View style={styles.cardMetaItem}>
                    <MaterialCommunityIcons name="calendar-clock" size={13} color="#8A92A6" />
                    <Text style={styles.cardMetaText}>
                      {formatDisplayDate(item.publishedAt || item.createdAt) || 'Recently'}
                    </Text>
                  </View>

                  <View style={styles.cardMetaRight}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <MaterialCommunityIcons name="chevron-right" size={16} color="#6630D7" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      {/* ANNOUNCEMENT DETAIL MODAL */}
      <Modal
        visible={Boolean(selectedAnnouncement)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedAnnouncement(null)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {selectedAnnouncement && (
              <>
                {/* MODAL HEADER */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderBadges}>
                    {(() => {
                      const catColors =
                        categoryColors[selectedAnnouncement.category] || categoryColors.General;
                      const catIcon =
                        categoryIcons[selectedAnnouncement.category] || 'bullhorn-outline';
                      const pInfo =
                        priorityConfig[selectedAnnouncement.priority] || priorityConfig.Medium;

                      return (
                        <>
                          <View
                            style={[
                              styles.categoryBadge,
                              { backgroundColor: catColors.bg, borderColor: catColors.border },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={catIcon}
                              size={13}
                              color={catColors.text}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.categoryBadgeText, { color: catColors.text }]}>
                              {selectedAnnouncement.category}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.priorityBadge,
                              { backgroundColor: pInfo.bg },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={pInfo.icon}
                              size={12}
                              color={pInfo.text}
                              style={{ marginRight: 4 }}
                            />
                            <Text style={[styles.priorityBadgeText, { color: pInfo.text }]}>
                              {selectedAnnouncement.priority} Priority
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                  </View>

                  <TouchableOpacity
                    onPress={() => setSelectedAnnouncement(null)}
                    style={styles.modalCloseButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                {/* MODAL TITLE */}
                <Text style={styles.modalTitle}>{selectedAnnouncement.title}</Text>

                {/* MODAL METADATA */}
                <View style={styles.modalMetaBox}>
                  <View style={styles.modalMetaRow}>
                    <View style={styles.modalMetaCol}>
                      <Text style={styles.modalMetaLabel}>Published Date</Text>
                      <Text style={styles.modalMetaValue}>
                        {formatDisplayDate(
                          selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt
                        ) || 'Recently'}
                      </Text>
                    </View>

                    <View style={styles.modalMetaCol}>
                      <Text style={styles.modalMetaLabel}>Announced By</Text>
                      <Text style={styles.modalMetaValue} numberOfLines={1}>
                        {selectedAnnouncement.createdBy}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.modalMetaRow, { marginTop: 8 }]}>
                    <View style={styles.modalMetaCol}>
                      <Text style={styles.modalMetaLabel}>Branch / Campus</Text>
                      <Text style={styles.modalMetaValue}>
                        {selectedAnnouncement.branchName}
                      </Text>
                    </View>

                    <View style={styles.modalMetaCol}>
                      <Text style={styles.modalMetaLabel}>Audience</Text>
                      <Text style={styles.modalMetaValue}>
                        {selectedAnnouncement.audience}
                      </Text>
                    </View>
                  </View>

                  {selectedAnnouncement.expiresAt && (
                    <View style={[styles.modalMetaRow, { marginTop: 8 }]}>
                      <View style={styles.modalMetaCol}>
                        <Text style={styles.modalMetaLabel}>Valid Until</Text>
                        <Text style={[styles.modalMetaValue, { color: '#EF4444' }]}>
                          {formatDisplayDate(selectedAnnouncement.expiresAt)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* BODY CONTENT */}
                <ScrollView style={styles.modalBodyScroll} showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalDescription}>
                    {selectedAnnouncement.description}
                  </Text>
                </ScrollView>

                {/* MODAL FOOTER */}
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={() => setSelectedAnnouncement(null)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalActionButtonText}>Close</Text>
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
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priorityChipSelected: {
    backgroundColor: '#1E1B4B',
    borderColor: '#1E1B4B',
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityChipText: {
    fontSize: 12,
    fontFamily: 'PoppinsMedium',
    color: '#64748B',
  },
  priorityChipTextSelected: {
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
  categoryCountBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  categoryCountText: {
    fontSize: 10,
    fontFamily: 'PoppinsSemiBold',
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
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
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF0F4',
    shadowColor: '#1A0B40',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontFamily: 'PoppinsMedium',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontFamily: 'PoppinsSemiBold',
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardMetaText: {
    fontSize: 11,
    fontFamily: 'PoppinsRegular',
    color: '#8A92A6',
  },
  cardMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewDetailsText: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },
  centerContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
  },
  errorContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    color: '#111528',
  },
  errorMessage: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6630D7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 13,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'PoppinsRegular',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
  },
  clearFilterButton: {
    marginTop: 16,
    backgroundColor: '#F4F0FF',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  clearFilterButtonText: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalHeaderBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'PoppinsBold',
    color: '#111528',
    lineHeight: 24,
    marginBottom: 14,
  },
  modalMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalMetaCol: {
    flex: 1,
  },
  modalMetaLabel: {
    fontSize: 10,
    fontFamily: 'PoppinsMedium',
    color: '#8A92A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalMetaValue: {
    fontSize: 12,
    fontFamily: 'PoppinsSemiBold',
    color: '#1E293B',
    marginTop: 2,
  },
  modalBodyScroll: {
    maxHeight: 260,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'PoppinsRegular',
    color: '#334155',
    lineHeight: 22,
  },
  modalActionButton: {
    backgroundColor: '#6630D7',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalActionButtonText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#FFFFFF',
  },
});
