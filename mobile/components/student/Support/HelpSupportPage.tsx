import React, { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type HelpSupportPageProps = {
  onContentScroll?: (event: any) => void;
};

type FAQItem = {
  question: string;
  answer: string;
};

const faqData: FAQItem[] = [
  {
    question: 'How can I check my attendance?',
    answer:
      'Open My Attendance from the student dashboard to view your overall attendance, subject-wise attendance, and attendance history.',
  },
  {
    question: 'Where can I find study materials?',
    answer:
      'Open Study Materials from the dashboard to browse PDFs, documents, videos, and links by subject.',
  },
  {
    question: 'How do I submit an assignment?',
    answer:
      'Open Assignments, select the required assignment, and use the submission option available on the assignment details page.',
  },
  {
    question: 'Where can I see my test results?',
    answer:
      'Open Tests & Results to view your completed tests, marks, percentages, and teacher feedback.',
  },
  {
    question: 'How can I check my fee payments?',
    answer:
      'Open Fees to view your pending amount, payment history, and available payment options.',
  },
];

export default function HelpSupportPage({
  onContentScroll,
}: HelpSupportPageProps) {
  const [expandedFAQ, setExpandedFAQ] =
    useState<number | null>(null);

  const handleEmailSupport = async () => {
    const email = 'support@verticallimits.com';

    const supported = await Linking.canOpenURL(
      `mailto:${email}`,
    );

    if (supported) {
      await Linking.openURL(`mailto:${email}`);
    } else {
      Alert.alert(
        'Contact Support',
        `Please email us at ${email}`,
      );
    }
  };

  const handleCallSupport = async () => {
    const phoneNumber = 'tel:+919876543210';

    const supported = await Linking.canOpenURL(
      phoneNumber,
    );

    if (supported) {
      await Linking.openURL(phoneNumber);
    } else {
      Alert.alert(
        'Contact Support',
        'Please call the school support desk.',
      );
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ((current) =>
      current === index ? null : index,
    );
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      onScroll={onContentScroll}
      scrollEventThrottle={16}
      contentContainerStyle={styles.contentContainer}
    >
      {/* SUPPORT INTRO */}
      <View style={styles.supportHero}>
        <View style={styles.supportIcon}>
          <Ionicons
            name="headset-outline"
            size={27}
            color="#6630D7"
          />
        </View>

        <View style={styles.supportHeroContent}>
          <Text style={styles.supportTitle}>
            How can we help?
          </Text>

          <Text style={styles.supportSubtitle}>
            Find answers or contact our support team.
          </Text>
        </View>
      </View>

      {/* CONTACT OPTIONS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Contact Support
        </Text>

        <View style={styles.contactCard}>
          <Pressable
            style={styles.contactRow}
            onPress={handleEmailSupport}
          >
            <View
              style={[
                styles.contactIcon,
                styles.emailIcon,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={19}
                color="#6630D7"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                Email Support
              </Text>

              <Text style={styles.contactSubtitle}>
                support@verticallimits.com
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color="#AAA"
            />
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={styles.contactRow}
            onPress={handleCallSupport}
          >
            <View
              style={[
                styles.contactIcon,
                styles.callIcon,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={19}
                color="#16803C"
              />
            </View>

            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>
                Call Support
              </Text>

              <Text style={styles.contactSubtitle}>
                Mon - Sat • 9:00 AM - 6:00 PM
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={17}
              color="#AAA"
            />
          </Pressable>
        </View>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Frequently Asked Questions
        </Text>

        <View style={styles.faqCard}>
          {faqData.map((faq, index) => {
            const isExpanded =
              expandedFAQ === index;

            return (
              <React.Fragment key={faq.question}>
                <Pressable
                  style={styles.faqRow}
                  onPress={() => toggleFAQ(index)}
                >
                  <View style={styles.faqNumber}>
                    <Text style={styles.faqNumberText}>
                      {index + 1}
                    </Text>
                  </View>

                  <Text style={styles.faqQuestion}>
                    {faq.question}
                  </Text>

                  <Ionicons
                    name={
                      isExpanded
                        ? 'chevron-up'
                        : 'chevron-down'
                    }
                    size={17}
                    color="#777"
                  />
                </Pressable>

                {isExpanded && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>
                      {faq.answer}
                    </Text>
                  </View>
                )}

                {index < faqData.length - 1 && (
                  <View style={styles.divider} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* SUPPORT TICKET */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Need More Help?
        </Text>

        <View style={styles.ticketCard}>
          <View style={styles.ticketIcon}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={22}
              color="#6630D7"
            />
          </View>

          <View style={styles.ticketContent}>
            <Text style={styles.ticketTitle}>
              Contact the school support desk
            </Text>

            <Text style={styles.ticketSubtitle}>
              Our team can help with account, classes,
              attendance, tests, and fees.
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.contactButton}
          onPress={handleEmailSupport}
        >
          <Ionicons
            name="chatbubble-outline"
            size={17}
            color="#FFFFFF"
          />

          <Text style={styles.contactButtonText}>
            Contact Support
          </Text>
        </Pressable>
      </View>

      {/* APP INFORMATION */}
      <View style={styles.appInfo}>
        <View style={styles.appInfoIcon}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color="#6630D7"
          />
        </View>

        <View style={styles.appInfoContent}>
          <Text style={styles.appInfoTitle}>
            Student Portal Support
          </Text>

          <Text style={styles.appInfoText}>
            Please keep your Student ID ready when
            contacting support.
          </Text>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },

  supportHero: {
    backgroundColor: '#EEE7FF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 13,
  },

  supportHeroContent: {
    flex: 1,
  },

  supportTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 17,
    color: '#292532',
  },

  supportSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#776B91',
    lineHeight: 13,
    marginTop: 3,
  },

  section: {
    marginTop: 18,
  },

  sectionTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
    color: '#292532',
    marginBottom: 9,
  },

  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 13,
  },

  contactRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  emailIcon: {
    backgroundColor: '#EEE7FF',
  },

  callIcon: {
    backgroundColor: '#EAFBF1',
  },

  contactContent: {
    flex: 1,
  },

  contactTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#35313D',
  },

  contactSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#999',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: '#F0EDF5',
  },

  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 13,
  },

  faqRow: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
  },

  faqNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#EEE7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  faqNumberText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8,
    color: '#6630D7',
  },

  faqQuestion: {
    flex: 1,
    fontFamily: 'PoppinsMedium',
    fontSize: 9,
    color: '#35313D',
    lineHeight: 14,
    marginRight: 8,
  },

  answerContainer: {
    backgroundColor: '#F8F6FC',
    borderRadius: 11,
    padding: 11,
    marginBottom: 10,
  },

  answerText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#77727F',
    lineHeight: 13,
  },

  ticketCard: {
    backgroundColor: '#F1EDFF',
    borderRadius: 17,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  ticketIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  ticketContent: {
    flex: 1,
  },

  ticketTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#45375F',
  },

  ticketSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#81759A',
    lineHeight: 11,
    marginTop: 3,
  },

  contactButton: {
    height: 46,
    borderRadius: 13,
    backgroundColor: '#6630D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  contactButtonText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#FFFFFF',
    marginLeft: 7,
  },

  appInfo: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  appInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EEE7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  appInfoContent: {
    flex: 1,
  },

  appInfoTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 9,
    color: '#45375F',
  },

  appInfoText: {
    fontFamily: 'PoppinsRegular',
    fontSize: 7,
    color: '#8A8295',
    lineHeight: 11,
    marginTop: 2,
  },
});