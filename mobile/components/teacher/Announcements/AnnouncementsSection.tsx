import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import AnnouncementItem from './AnnouncementItem';
import {
  Announcement,
  fetchAnnouncements,
} from '@/services/announcements';

type AnnouncementsSectionProps = {
  onViewAllPress?: () => void;
};

export default function AnnouncementsSection({
  onViewAllPress,
}: AnnouncementsSectionProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchAnnouncements();
      setAnnouncements(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load announcements.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const formatDate = (date?: string | null): string => {
    if (!date) return 'Date unavailable';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Date unavailable';
    }

    return parsedDate.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAuthorName = (announcement: Announcement): string => {
    if (
      announcement.createdBy &&
      typeof announcement.createdBy === 'object'
    ) {
      return announcement.createdBy.fullName || 'Admin';
    }

    return 'Admin';
  };

  const recentAnnouncements = announcements.slice(0, 3);
  const selectedDate = selectedAnnouncement
    ? formatDate(
        selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt,
      )
    : '';

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          Recent Announcements
        </Text>

        <Pressable
          onPress={onViewAllPress}
          hitSlop={8}
          disabled={!onViewAllPress}
        >
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color="#5420D8" />
          <Text style={styles.stateText}>Loading announcements...</Text>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={loadAnnouncements}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : recentAnnouncements.length === 0 ? (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            No announcements available.
          </Text>
        </View>
      ) : (
        recentAnnouncements.map((announcement) => (
          <View key={announcement._id} style={styles.announcementCardWrapper}>
            <AnnouncementItem
              title={announcement.title}
              description={announcement.description}
              date={formatDate(
                announcement.publishedAt || announcement.createdAt,
              )}
              author={getAuthorName(announcement)}
              onPress={() => setSelectedAnnouncement(announcement)}
            />
          </View>
        ))
      )}

      {/* Read-only announcement details */}
      <Modal
        visible={!!selectedAnnouncement}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeadingGroup}>
                <View style={styles.modalIcon}>
                  <MaterialCommunityIcons
                    name="bullhorn-outline"
                    size={23}
                    color="#5420D8"
                  />
                </View>
                <View style={styles.modalHeadingText}>
                  <Text style={styles.modalEyebrow}>ANNOUNCEMENT</Text>
                  <Text style={styles.modalTitle}>Announcement Details</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedAnnouncement(null)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={21}
                  color="#667085"
                />
              </TouchableOpacity>
            </View>

            {selectedAnnouncement && (
              <>
                <ScrollView
                  style={styles.modalScroll}
                  contentContainerStyle={styles.modalScrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={styles.announcementTitle}>
                    {selectedAnnouncement.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="calendar-month-outline"
                        size={16}
                        color="#7040D5"
                      />
                      <Text style={styles.metaText}>{selectedDate}</Text>
                    </View>

                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="account-outline"
                        size={16}
                        color="#7040D5"
                      />
                      <Text style={styles.metaText}>
                        {getAuthorName(selectedAnnouncement)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <Text style={styles.descriptionLabel}>Description</Text>
                  <Text style={styles.announcementDescription}>
                    {selectedAnnouncement.description ||
                      'No additional description provided.'}
                  </Text>
                </ScrollView>

                <View style={styles.readOnlyFooter}>
                  <MaterialCommunityIcons
                    name="eye-outline"
                    size={17}
                    color="#667085"
                  />
                  <Text style={styles.readOnlyText}>View only</Text>
                  <TouchableOpacity
                    style={styles.doneButton}
                    onPress={() => setSelectedAnnouncement(null)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.doneButtonText}>Close</Text>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    flex: 1,
    color: '#111528',
    fontSize: 18,
    fontFamily: 'PoppinsBold',
  },

  viewAll: {
    color: '#5420D8',
    fontSize: 15,
    fontFamily: 'PoppinsBold',
    marginLeft: 10,
  },

  announcementCardWrapper: {
    minHeight: 112,
    marginBottom: 12,
  },

  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 26,
  },

  stateText: {
    color: '#777777',
    fontSize: 13,
    fontFamily: 'PoppinsMedium',
    marginTop: 8,
    textAlign: 'center',
  },

  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontFamily: 'PoppinsMedium',
    textAlign: 'center',
  },

  retryButton: {
    backgroundColor: '#5420D8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PoppinsBold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(16, 24, 40, 0.52)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },

  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F5',
  },

  modalHeadingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },

  modalIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalHeadingText: {
    flex: 1,
    marginLeft: 11,
  },

  modalEyebrow: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    letterSpacing: 1,
    color: '#8B79C9',
  },

  modalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#202A3A',
    marginTop: 2,
  },

  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  modalScroll: {
    flexShrink: 1,
  },

  modalScrollContent: {
    paddingTop: 19,
    paddingBottom: 20,
  },

  announcementTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 19,
    lineHeight: 27,
    color: '#202A3A',
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 13,
    gap: 14,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  metaText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#7A8699',
    marginLeft: 5,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEF0F5',
    marginTop: 18,
    marginBottom: 17,
  },

  descriptionLabel: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#344054',
    marginBottom: 8,
  },

  announcementDescription: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    lineHeight: 22,
    color: '#667085',
  },

  readOnlyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF0F5',
    paddingTop: 14,
  },

  readOnlyText: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#667085',
    marginLeft: 6,
  },

  doneButton: {
    minWidth: 88,
    minHeight: 40,
    borderRadius: 10,
    backgroundColor: '#5420D8',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  doneButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
});
