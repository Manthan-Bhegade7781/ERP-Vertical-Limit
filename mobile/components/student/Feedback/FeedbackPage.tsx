import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  fetchMyFeedback,
  FeedbackCategory,
  StudentFeedbackItem,
  submitStudentFeedback,
} from '../../../services/feedback';

type FeedbackPageProps = {
  onContentScroll?: (event: any) => void;
};

const CATEGORIES: { label: FeedbackCategory; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { label: 'Teaching', icon: 'school-outline', desc: 'Faculty, lectures & teaching quality' },
  { label: 'Course', icon: 'book-outline', desc: 'Syllabus, material & course pace' },
  { label: 'Facilities', icon: 'business-outline', desc: 'Classroom, library & infrastructure' },
  { label: 'App', icon: 'phone-portrait-outline', desc: 'ERP app experience, bugs & suggestions' },
  { label: 'Other', icon: 'chatbox-ellipses-outline', desc: 'General feedback or other concerns' },
];

const RATING_LABELS: Record<number, { text: string; color: string }> = {
  1: { text: 'Poor', color: '#EF4444' },
  2: { text: 'Fair', color: '#F97316' },
  3: { text: 'Average', color: '#F59E0B' },
  4: { text: 'Good', color: '#10B981' },
  5: { text: 'Excellent', color: '#6630D7' },
};

export default function FeedbackPage({ onContentScroll }: FeedbackPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  // Form State
  const [category, setCategory] = useState<FeedbackCategory>('Teaching');
  const [rating, setRating] = useState<number>(5);
  const [subject, setSubject] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [feedbackList, setFeedbackList] = useState<StudentFeedbackItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadFeedbackHistory = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const data = await fetchMyFeedback();
      setFeedbackList(data);
    } catch (err: any) {
      console.log('Error loading feedback history:', err);
    } finally {
      setIsLoadingHistory(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadFeedbackHistory();
  }, [loadFeedbackHistory]);

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void loadFeedbackHistory();
  }, [loadFeedbackHistory]);

  const handleSubmit = async () => {
    const trimmedSubject = subject.trim();
    const trimmedComments = comments.trim();

    if (!trimmedSubject) {
      Alert.alert('Required Field', 'Please enter a subject or topic for your feedback.');
      return;
    }

    if (!trimmedComments) {
      Alert.alert('Required Field', 'Please describe your feedback or suggestions in detail.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitStudentFeedback({
        category,
        rating,
        subject: trimmedSubject,
        comments: trimmedComments,
      });

      Alert.alert('Feedback Submitted', 'Thank you! Your feedback has been received and will be reviewed by the administration.');
      // Reset form
      setSubject('');
      setComments('');
      setRating(5);
      setCategory('Teaching');
      // Switch to history & reload
      setActiveTab('history');
      void loadFeedbackHistory();
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'history' ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={['#6630D7']}
              tintColor="#6630D7"
            />
          ) : undefined
        }
      >
        {/* HERO BANNER */}
        <View style={styles.heroBanner}>
          <View style={styles.heroIconBox}>
            <Ionicons name="chatbubble-ellipses" size={26} color="#6630D7" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroTitle}>Student Feedback</Text>
            <Text style={styles.heroSubtitle}>
              Share your thoughts, suggestions, or concerns to help us improve your learning experience.
            </Text>
          </View>
        </View>

        {/* TAB SELECTOR */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'create' && styles.tabButtonActive]}
            onPress={() => setActiveTab('create')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={activeTab === 'create' ? '#6630D7' : '#64748B'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'create' && styles.tabButtonTextActive,
              ]}
            >
              Give Feedback
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={17}
              color={activeTab === 'history' ? '#6630D7' : '#64748B'}
            />
            <Text
              style={[
                styles.tabButtonText,
                activeTab === 'history' && styles.tabButtonTextActive,
              ]}
            >
              My Feedback {feedbackList.length > 0 ? `(${feedbackList.length})` : ''}
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENT: CREATE FEEDBACK */}
        {activeTab === 'create' && (
          <View style={styles.formCard}>
            {/* CATEGORY SELECTOR */}
            <Text style={styles.sectionHeading}>Category</Text>
            <Text style={styles.sectionSub}>What is your feedback regarding?</Text>

            <View style={styles.categoryGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.label;
                return (
                  <TouchableOpacity
                    key={cat.label}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => setCategory(cat.label)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.categoryIconCircle,
                        isSelected && styles.categoryIconCircleSelected,
                      ]}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={18}
                        color={isSelected ? '#FFFFFF' : '#6630D7'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryTitle,
                        isSelected && styles.categoryTitleSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* RATING */}
            <View style={styles.ratingSection}>
              <View style={styles.ratingHeader}>
                <Text style={styles.sectionHeading}>Overall Rating</Text>
                <View
                  style={[
                    styles.ratingBadge,
                    { backgroundColor: `${RATING_LABELS[rating]?.color || '#6630D7'}15` },
                  ]}
                >
                  <Text
                    style={[
                      styles.ratingBadgeText,
                      { color: RATING_LABELS[rating]?.color || '#6630D7' },
                    ]}
                  >
                    {rating} Star{rating > 1 ? 's' : ''} • {RATING_LABELS[rating]?.text}
                  </Text>
                </View>
              </View>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    style={styles.starTouch}
                    onPress={() => setRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={34}
                      color={star <= rating ? '#F59E0B' : '#CBD5E1'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SUBJECT */}
            <Text style={styles.sectionHeading}>Subject / Topic</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Physics Doubt Session, Library Timings"
              placeholderTextColor="#94A3B8"
              value={subject}
              onChangeText={setSubject}
              maxLength={120}
            />

            {/* COMMENTS */}
            <View style={styles.commentsHeader}>
              <Text style={styles.sectionHeading}>Your Comments</Text>
              <Text style={styles.charCount}>{comments.length}/2000</Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide specific details or constructive suggestions..."
              placeholderTextColor="#94A3B8"
              value={comments}
              onChangeText={setComments}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              maxLength={2000}
            />

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submitting...</Text>
                </View>
              ) : (
                <View style={styles.submittingRow}>
                  <Ionicons name="send" size={17} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Submit Feedback</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.privacyNote}>
              <Ionicons name="lock-closed-outline" size={14} color="#64748B" />
              <Text style={styles.privacyNoteText}>
                Your feedback is securely transmitted to institute administrators to improve educational quality.
              </Text>
            </View>
          </View>
        )}

        {/* TAB CONTENT: FEEDBACK HISTORY */}
        {activeTab === 'history' && (
          <View style={styles.historyContainer}>
            {isLoadingHistory && feedbackList.length === 0 ? (
              <View style={styles.centerLoading}>
                <ActivityIndicator size="large" color="#6630D7" />
                <Text style={styles.loadingText}>Loading feedback history...</Text>
              </View>
            ) : feedbackList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No Feedback Submitted Yet</Text>
                <Text style={styles.emptySubtitle}>
                  You haven't submitted any feedback yet. Share your experience to help us improve!
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionButton}
                  onPress={() => setActiveTab('create')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Submit First Feedback</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.historyList}>
                {feedbackList.map((item) => {
                  const isReviewed = item.status === 'Reviewed';
                  return (
                    <View key={item.id} style={styles.feedbackCard}>
                      <View style={styles.feedbackCardHeader}>
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryBadgeText}>{item.category}</Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            isReviewed ? styles.statusBadgeReviewed : styles.statusBadgeNew,
                          ]}
                        >
                          <Ionicons
                            name={isReviewed ? 'checkmark-circle' : 'time-outline'}
                            size={12}
                            color={isReviewed ? '#059669' : '#D97706'}
                          />
                          <Text
                            style={[
                              styles.statusBadgeText,
                              isReviewed ? styles.statusBadgeTextReviewed : styles.statusBadgeTextNew,
                            ]}
                          >
                            {item.status}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.feedbackSubject}>{item.subject}</Text>

                      {/* STAR RATING DISPLAY */}
                      <View style={styles.cardStarsRow}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Ionicons
                            key={star}
                            name={star <= item.rating ? 'star' : 'star-outline'}
                            size={16}
                            color={star <= item.rating ? '#F59E0B' : '#CBD5E1'}
                          />
                        ))}
                        <Text style={styles.ratingNumberText}>{item.rating} / 5</Text>
                      </View>

                      <Text style={styles.feedbackComments}>{item.comments}</Text>

                      <View style={styles.feedbackCardFooter}>
                        <View style={styles.footerDateWrap}>
                          <Ionicons name="calendar-outline" size={13} color="#94A3B8" />
                          <Text style={styles.footerDateText}>{item.formattedDate}</Text>
                        </View>
                        {item.branchName && (
                          <View style={styles.footerBranchWrap}>
                            <Ionicons name="business-outline" size={13} color="#94A3B8" />
                            <Text style={styles.footerBranchText}>{item.branchName}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 110 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6FB',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // HERO BANNER
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F4F0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTextWrap: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#1E1B4B',
    marginBottom: 2,
  },
  heroSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  // TAB SELECTOR
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tabButtonText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#64748B',
  },
  tabButtonTextActive: {
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  // FORM CARD
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  sectionHeading: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#1E1B4B',
    marginBottom: 2,
  },
  sectionSub: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  // CATEGORY GRID
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 7,
  },
  categoryCardSelected: {
    backgroundColor: '#F4F0FF',
    borderColor: '#6630D7',
  },
  categoryIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconCircleSelected: {
    backgroundColor: '#6630D7',
  },
  categoryTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 12.5,
    color: '#475569',
  },
  categoryTitleSelected: {
    fontFamily: 'PoppinsSemiBold',
    color: '#6630D7',
  },

  // RATING SECTION
  ratingSection: {
    backgroundColor: '#FAFAFD',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEDF5',
  },
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  starTouch: {
    padding: 4,
  },

  // INPUTS
  input: {
    backgroundColor: '#FAFAFD',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#1E1B4B',
    marginBottom: 16,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  charCount: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#94A3B8',
  },
  textArea: {
    minHeight: 110,
    paddingTop: 12,
    marginBottom: 20,
  },

  // SUBMIT BUTTON
  submitButton: {
    backgroundColor: '#6630D7',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#6630D7',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },

  // PRIVACY NOTE
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 4,
  },
  privacyNoteText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#64748B',
    flex: 1,
    lineHeight: 15,
  },

  // HISTORY TAB
  historyContainer: {
    minHeight: 250,
  },
  centerLoading: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EFEBF8',
  },
  emptyIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#1E1B4B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#6630D7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
    color: '#FFFFFF',
  },

  // FEEDBACK CARDS LIST
  historyList: {
    gap: 12,
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EFEBF8',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  feedbackCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#F4F0FF',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11,
    color: '#6630D7',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  statusBadgeNew: {
    backgroundColor: '#FEF3C7',
  },
  statusBadgeReviewed: {
    backgroundColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 10.5,
  },
  statusBadgeTextNew: {
    color: '#B45309',
  },
  statusBadgeTextReviewed: {
    color: '#047857',
  },
  feedbackSubject: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#1E1B4B',
    marginBottom: 6,
  },
  cardStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 10,
  },
  ratingNumberText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 6,
  },
  feedbackComments: {
    fontFamily: 'PoppinsRegular',
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
  },
  feedbackCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerDateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDateText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#94A3B8',
  },
  footerBranchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerBranchText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 11,
    color: '#94A3B8',
  },
});
