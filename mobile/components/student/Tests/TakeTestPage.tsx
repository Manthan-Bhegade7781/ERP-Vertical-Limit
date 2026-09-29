import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Test = {
  id: string;
  title: string;
  subject: string;
  teacher: string;
  date: string;
  day: string;
  time: string;
  duration: string;
  totalMarks: number;
  syllabus: string;
  room: string;
  mode: 'Offline' | 'Online';
};

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
};

type TakeTestPageProps = {
  test?: Test | null;
  onContentScroll?: (event: any) => void;
  onBack?: () => void;
  onTestSubmitted?: () => void;
};

const defaultTest: Test = {
  id: 'test-1',
  title: 'Physics Unit Test',
  subject: 'Physics',
  teacher: 'Priya Sharma',
  date: '18 Sep 2026',
  day: 'Friday',
  time: '10:00 AM',
  duration: '60 mins',
  totalMarks: 30,
  syllabus: 'Newton’s Laws, Motion, Force and Friction',
  room: 'Room 204',
  mode: 'Offline',
};

const questions: Question[] = [
  {
    id: 'q1',
    question:
      'Which law explains that an object remains at rest unless acted upon by an external force?',
    options: [
      'Newton’s First Law',
      'Newton’s Second Law',
      'Newton’s Third Law',
      'Law of Gravitation',
    ],
    correctAnswer: 0,
    marks: 2,
  },
  {
    id: 'q2',
    question: 'What is the SI unit of force?',
    options: ['Joule', 'Newton', 'Watt', 'Pascal'],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q3',
    question:
      'According to Newton’s Second Law, force is equal to:',
    options: [
      'Mass × Velocity',
      'Mass × Acceleration',
      'Mass ÷ Acceleration',
      'Velocity × Time',
    ],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q4',
    question:
      'Which force opposes the relative motion between two surfaces?',
    options: [
      'Gravity',
      'Friction',
      'Magnetic force',
      'Buoyant force',
    ],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q5',
    question:
      'If the net force acting on an object is zero, the object:',
    options: [
      'Must always be at rest',
      'Must always accelerate',
      'Can remain at rest or move with constant velocity',
      'Must move in a circle',
    ],
    correctAnswer: 2,
    marks: 2,
  },
  {
    id: 'q6',
    question:
      'Newton’s Third Law states that every action has:',
    options: [
      'A larger reaction',
      'An equal and opposite reaction',
      'No reaction',
      'A delayed reaction',
    ],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q7',
    question: 'Acceleration is the rate of change of:',
    options: [
      'Distance',
      'Velocity',
      'Mass',
      'Force',
    ],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 'q8',
    question:
      'What happens to acceleration when the same force is applied to an object with greater mass?',
    options: [
      'Acceleration increases',
      'Acceleration decreases',
      'Acceleration remains exactly the same',
      'Acceleration becomes zero',
    ],
    correctAnswer: 1,
    marks: 2,
  },
];

export default function TakeTestPage({
  test: testProp,
  onContentScroll,
  onBack,
  onTestSubmitted,
}: TakeTestPageProps) {
  // Fixes "test is possibly null"
  const test = testProp ?? defaultTest;

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState<
    Record<string, number>
  >({});

  const [secondsLeft, setSecondsLeft] = useState(60 * 60);

  const [showSubmitModal, setShowSubmitModal] =
    useState(false);

  const [submitted, setSubmitted] = useState(false);

  const question = questions[currentQuestion];

  const answeredCount = Object.keys(answers).length;

  const totalMarks = useMemo(
    () =>
      questions.reduce(
        (total, item) => total + item.marks,
        0,
      ),
    [],
  );

  useEffect(() => {
    if (submitted) {
      return;
    }

    if (secondsLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((current) =>
        current > 0 ? current - 1 : 0,
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, submitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60,
    );

    const remainingSeconds = seconds % 60;

    return `${String(hours).padStart(
      2,
      '0',
    )}:${String(minutes).padStart(
      2,
      '0',
    )}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const selectAnswer = (optionIndex: number) => {
    setAnswers((current) => ({
      ...current,
      [question.id]: optionIndex,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((current) => current + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((current) => current - 1);
    }
  };

  const submitTest = () => {
    setShowSubmitModal(false);
    setSubmitted(true);

    if (onTestSubmitted) {
      onTestSubmitted();
    }
  };

  const handleSubmitPress = () => {
    if (answeredCount < questions.length) {
      Alert.alert(
        'Incomplete Test',
        `You have answered ${answeredCount} of ${questions.length} questions. You can still submit the test.`,
        [
          {
            text: 'Continue Test',
            style: 'cancel',
          },
          {
            text: 'Submit Anyway',
            onPress: () => setShowSubmitModal(true),
          },
        ],
      );

      return;
    }

    setShowSubmitModal(true);
  };

  const calculateScore = () => {
    return questions.reduce((score, item) => {
      if (answers[item.id] === item.correctAnswer) {
        return score + item.marks;
      }

      return score;
    }, 0);
  };

  /*
   * Submitted screen
   */
  if (submitted) {
    const score = calculateScore();

    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.submittedContent}
          onScroll={onContentScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.successIcon}>
            <Ionicons
              name="checkmark"
              size={42}
              color="#fff"
            />
          </View>

          <Text style={styles.successTitle}>
            Test Submitted
          </Text>

          <Text style={styles.successSubtitle}>
            Your answers have been submitted successfully.
          </Text>

          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>
              Test Summary
            </Text>

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                Test
              </Text>

              <Text style={styles.resultValue}>
                {test.title}
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                Questions
              </Text>

              <Text style={styles.resultValue}>
                {questions.length}
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                Attempted
              </Text>

              <Text style={styles.resultValue}>
                {answeredCount}
              </Text>
            </View>

            <View style={styles.resultDivider} />

            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                Score
              </Text>

              <Text style={styles.scoreValue}>
                {score} / {totalMarks}
              </Text>
            </View>
          </View>

          <View style={styles.waitingCard}>
            <View style={styles.waitingIcon}>
              <Ionicons
                name="time-outline"
                size={21}
                color="#6630D7"
              />
            </View>

            <View style={styles.waitingContent}>
              <Text style={styles.waitingTitle}>
                Results
              </Text>

              <Text style={styles.waitingText}>
                Your final result and teacher feedback will
                appear in the Results section after evaluation.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.backButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color="#6630D7"
            />

            <Text style={styles.backButtonText}>
              Back to Tests
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  /*
   * Test screen
   */
  return (
    <View style={styles.container}>
      {/* Test Header */}
      <View style={styles.testHeader}>
        <View style={styles.headerTopRow}>
          <Pressable
            style={styles.headerBackButton}
            onPress={onBack}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#fff"
            />
          </Pressable>

          <View style={styles.headerTitleContainer}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              {test.title}
            </Text>

            <Text style={styles.headerSubject}>
              {test.subject} • {test.teacher}
            </Text>
          </View>

          <View style={styles.timerBox}>
            <Ionicons
              name="timer-outline"
              size={16}
              color="#fff"
            />

            <Text style={styles.timerText}>
              {formatTime(secondsLeft)}
            </Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressText}>
              Question {currentQuestion + 1} of{' '}
              {questions.length}
            </Text>

            <Text style={styles.progressText}>
              {answeredCount} answered
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestion + 1) /
                      questions.length) *
                    100
                  }%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.testContent}
        onScroll={onContentScroll}
        scrollEventThrottle={16}
      >
        {/* Question Navigator */}
        <Text style={styles.navigatorTitle}>
          Questions
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.questionNavigator}
        >
          {questions.map((item, index) => {
            const isCurrent =
              currentQuestion === index;

            const isAnswered =
              answers[item.id] !== undefined;

            return (
              <Pressable
                key={item.id}
                onPress={() => setCurrentQuestion(index)}
                style={[
                  styles.questionNumber,
                  isCurrent &&
                    styles.currentQuestionNumber,
                  !isCurrent &&
                    isAnswered &&
                    styles.answeredQuestionNumber,
                ]}
              >
                <Text
                  style={[
                    styles.questionNumberText,
                    isCurrent &&
                      styles.currentQuestionNumberText,
                    !isCurrent &&
                      isAnswered &&
                      styles.answeredQuestionNumberText,
                  ]}
                >
                  {index + 1}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Question Card */}
        <View style={styles.questionCard}>
          <View style={styles.questionTopRow}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>
                Q{currentQuestion + 1}
              </Text>
            </View>

            <View style={styles.marksBadge}>
              <Text style={styles.marksBadgeText}>
                {question.marks} Marks
              </Text>
            </View>
          </View>

          <Text style={styles.questionText}>
            {question.question}
          </Text>

          <Text style={styles.chooseText}>
            Choose one answer
          </Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => {
              const isSelected =
                answers[question.id] === index;

              return (
                <Pressable
                  key={`${question.id}-option-${index}`}
                  onPress={() => selectAnswer(index)}
                  style={[
                    styles.option,
                    isSelected && styles.selectedOption,
                  ]}
                >
                  <View
                    style={[
                      styles.optionCircle,
                      isSelected &&
                        styles.selectedOptionCircle,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons
                        name="checkmark"
                        size={13}
                        color="#fff"
                      />
                    )}
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      isSelected &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Navigation */}
        <View style={styles.navigationRow}>
          <Pressable
            onPress={goToPreviousQuestion}
            disabled={currentQuestion === 0}
            style={[
              styles.previousButton,
              currentQuestion === 0 &&
                styles.disabledButton,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={
                currentQuestion === 0
                  ? '#AAA'
                  : '#6630D7'
              }
            />

            <Text
              style={[
                styles.previousButtonText,
                currentQuestion === 0 &&
                  styles.disabledButtonText,
              ]}
            >
              Previous
            </Text>
          </Pressable>

          {currentQuestion < questions.length - 1 ? (
            <Pressable
              style={styles.nextButton}
              onPress={goToNextQuestion}
            >
              <Text style={styles.nextButtonText}>
                Next
              </Text>

              <Ionicons
                name="arrow-forward"
                size={18}
                color="#fff"
              />
            </Pressable>
          ) : (
            <Pressable
              style={styles.submitButton}
              onPress={handleSubmitPress}
            >
              <Text style={styles.nextButtonText}>
                Submit Test
              </Text>

              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color="#fff"
              />
            </Pressable>
          )}
        </View>

        {/* Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color="#6630D7"
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>
              Before submitting
            </Text>

            <Text style={styles.infoText}>
              Review your answers using the question numbers
              above. Once submitted, you cannot change your
              answers.
            </Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <View style={styles.confirmIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={32}
                color="#6630D7"
              />
            </View>

            <Text style={styles.confirmTitle}>
              Submit Test?
            </Text>

            <Text style={styles.confirmText}>
              You have answered {answeredCount} of{' '}
              {questions.length} questions.
            </Text>

            <Text style={styles.confirmWarning}>
              You will not be able to change your answers after
              submission.
            </Text>

            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() =>
                  setShowSubmitModal(false)
                }
              >
                <Text style={styles.cancelButtonText}>
                  Continue Test
                </Text>
              </Pressable>

              <Pressable
                style={styles.confirmSubmitButton}
                onPress={submitTest}
              >
                <Text style={styles.confirmSubmitText}>
                  Submit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5FC',
  },

  testHeader: {
    backgroundColor: '#6630D7',
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 14,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBackButton: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  headerTitleContainer: {
    flex: 1,
    paddingRight: 8,
  },

  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#fff',
  },

  headerSubject: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#E7DFFF',
    marginTop: 2,
  },

  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 11,
  },

  timerText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#fff',
    marginLeft: 5,
  },

  progressContainer: {
    marginTop: 15,
  },

  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  progressText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#E8DFFF',
  },

  progressTrack: {
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  testContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  navigatorTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#292532',
    marginBottom: 9,
  },

  questionNavigator: {
    gap: 8,
    paddingBottom: 17,
  },

  questionNumber: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4DFEC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  currentQuestionNumber: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  answeredQuestionNumber: {
    backgroundColor: '#EEE7FF',
    borderColor: '#D7C8F6',
  },

  questionNumberText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#777',
  },

  currentQuestionNumberText: {
    color: '#fff',
  },

  answeredQuestionNumberText: {
    color: '#6630D7',
  },

  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 19,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  questionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  questionBadge: {
    backgroundColor: '#EEE7FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
  },

  questionBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#6630D7',
  },

  marksBadge: {
    backgroundColor: '#F5F3F7',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },

  marksBadgeText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8,
    color: '#777',
  },

  questionText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    lineHeight: 23,
    color: '#292532',
    marginTop: 16,
  },

  chooseText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#999',
    marginTop: 5,
    marginBottom: 12,
  },

  optionsContainer: {
    gap: 9,
  },

  option: {
    minHeight: 49,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E0EA',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectedOption: {
    backgroundColor: '#F1ECFF',
    borderColor: '#6630D7',
  },

  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C8C3CD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  selectedOptionCircle: {
    backgroundColor: '#6630D7',
    borderColor: '#6630D7',
  },

  optionText: {
    flex: 1,
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    lineHeight: 16,
    color: '#555',
  },

  selectedOptionText: {
    fontFamily: 'PoppinsMedium',
    color: '#4B278F',
  },

  navigationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 10,
  },

  previousButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD7E6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  previousButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#6630D7',
    marginLeft: 6,
  },

  nextButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitButton: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    backgroundColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nextButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#fff',
    marginRight: 6,
  },

  disabledButton: {
    backgroundColor: '#F1EFF4',
    borderColor: '#E5E1E8',
  },

  disabledButtonText: {
    color: '#AAA',
  },

  infoCard: {
    marginTop: 15,
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
  },

  infoIcon: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#4B278F',
  },

  infoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 22,
  },

  confirmModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 21,
    padding: 20,
    alignItems: 'center',
  },

  confirmIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  confirmTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 18,
    color: '#292532',
  },

  confirmText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
  },

  confirmWarning: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },

  confirmButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 9,
    marginTop: 18,
  },

  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1EFF4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#666',
  },

  confirmSubmitButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6630D7',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmSubmitText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#fff',
  },

  submittedContent: {
    padding: 20,
    alignItems: 'center',
    paddingTop: 50,
  },

  successIcon: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#292532',
    marginTop: 18,
  },

  successSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#777',
    textAlign: 'center',
    marginTop: 4,
  },

  resultCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
  },

  resultCardTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 13,
    color: '#292532',
    marginBottom: 12,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },

  resultLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    color: '#888',
  },

  resultValue: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#444',
    maxWidth: '60%',
    textAlign: 'right',
  },

  scoreValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#16A34A',
  },

  resultDivider: {
    height: 1,
    backgroundColor: '#F0EDF4',
  },

  waitingCard: {
    width: '100%',
    backgroundColor: '#EEE7FF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    marginTop: 13,
  },

  waitingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 9,
  },

  waitingContent: {
    flex: 1,
  },

  waitingTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11,
    color: '#4B278F',
  },

  waitingText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    lineHeight: 14,
    color: '#66558A',
    marginTop: 2,
  },

  backButton: {
    width: '100%',
    height: 46,
    borderRadius: 13,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD7E6',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  backButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#6630D7',
    marginLeft: 7,
  },
});