import React from 'react';
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
  onBack?: () => void;
};

const SUPPORT_PHONE = '+91 98765 43210';
const SUPPORT_EMAIL = 'support@verticallimits.com';

export default function HelpSupportPage({
  onContentScroll,
  onBack,
}: HelpSupportPageProps) {
  const handleCall = async () => {
    const phoneNumber = SUPPORT_PHONE.replace(/\D/g, '');

    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.log('Call error:', error);

      Alert.alert(
        'Unable to make call',
        'The phone dialer could not be opened on this device.',
      );
    }
  };

  const handleEmail = async () => {
    try {
      await Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
    } catch (error) {
      console.log('Email error:', error);

      Alert.alert(
        'Unable to open email',
        'The email application could not be opened on this device.',
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      onScroll={onContentScroll}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={onBack}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color="#FFFFFF"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Help & Support
        </Text>

        <View style={styles.headerRightSpace} />
      </View>

      {/* Intro */}
      <View style={styles.introContainer}>
        <View style={styles.supportIcon}>
          <Ionicons
            name="headset-outline"
            size={30}
            color="#6C4AB6"
          />
        </View>

        <Text style={styles.title}>
          Help & Support
        </Text>

        <Text style={styles.subtitle}>
          Contact us using the options below.
        </Text>
      </View>

      {/* Contact Options */}
      <View style={styles.card}>
        {/* Contact Number */}
        <Pressable
          onPress={handleCall}
          style={({ pressed }) => [
            styles.contactRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.contactIcon}>
            <Ionicons
              name="call-outline"
              size={21}
              color="#6C4AB6"
            />
          </View>

          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>
              Contact Number
            </Text>

            <Text style={styles.contactValue}>
              {SUPPORT_PHONE}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={19}
            color="#B5B5BD"
          />
        </Pressable>

        <View style={styles.divider} />

        {/* Email */}
        <Pressable
          onPress={handleEmail}
          style={({ pressed }) => [
            styles.contactRow,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.contactIcon}>
            <Ionicons
              name="mail-outline"
              size={21}
              color="#6C4AB6"
            />
          </View>

          <View style={styles.contactTextContainer}>
            <Text style={styles.contactLabel}>
              Email
            </Text>

            <Text style={styles.contactValue}>
              {SUPPORT_EMAIL}
            </Text>
          </View>

          <Ionicons
            name="chevron-forward-outline"
            size={19}
            color="#B5B5BD"
          />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F9',
  },

  contentContainer: {
    paddingBottom: 30,
  },

  header: {
    height: 58,
    backgroundColor: '#6C4AB6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 17,
  },

  headerRightSpace: {
    width: 38,
  },

  introContainer: {
    alignItems: 'center',
    paddingTop: 28,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },

  supportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEE8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  title: {
    color: '#25252B',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 19,
  },

  subtitle: {
    color: '#85858D',
    fontFamily: 'PoppinsRegular',
    fontSize: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  contactRow: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.6,
  },

  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F0EBFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  contactTextContainer: {
    flex: 1,
  },

  contactLabel: {
    color: '#888890',
    fontFamily: 'PoppinsRegular',
    fontSize: 10,
    marginBottom: 2,
  },

  contactValue: {
    color: '#292930',
    fontFamily: 'PoppinsMedium',
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEF2',
  },
});