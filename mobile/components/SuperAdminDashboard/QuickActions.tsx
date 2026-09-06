import React from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import { openDashboardFeature } from '@/utils/dashboardNavigation';

type QuickAction = {
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  backgroundColor: string;
};

const quickActions: QuickAction[] = [
  {
    title: 'Add Student',
    icon: 'account-plus-outline',
    color: '#7040D5',
    backgroundColor: '#F1EAFF',
  },
  {
    title: 'Add Teacher',
    icon: 'account-tie-outline',
    color: '#2675E8',
    backgroundColor: '#EAF2FF',
  },
  {
    title: 'Add Course',
    icon: 'book-plus-outline',
    color: '#35B878',
    backgroundColor: '#E7F8EF',
  },
  {
    title: 'Create Batch',
    icon: 'account-multiple-plus-outline',
    color: '#F7941D',
    backgroundColor: '#FFF1E2',
  },
  {
    title: 'Fee Collection',
    icon: 'cash-multiple',
    color: '#E95386',
    backgroundColor: '#FFE9F0',
  },
  {
    title: 'Generate Report',
    icon: 'file-chart-outline',
    color: '#7040D5',
    backgroundColor: '#F1EAFF',
  },
  {
    title: 'Student Complaint',
    icon: 'alert-circle-outline',
    color: '#2675E8',
    backgroundColor: '#EAF2FF',
  },
  {
    title: 'Quiz',
    icon: 'help-circle-outline',
    color: '#35B878',
    backgroundColor: '#E7F8EF',
  },
  {
    title: 'Event',
    icon: 'calendar-star',
    color: '#F7941D',
    backgroundColor: '#FFF1E2',
  },
  {
    title: 'PTG',
    icon: 'account-group-outline',
    color: '#E95386',
    backgroundColor: '#FFE9F0',
  },
  {
    title: 'Feedback',
    icon: 'message-draw',
    color: '#7040D5',
    backgroundColor: '#F1EAFF',
  },
  {
    title: 'WhatsApp',
    icon: 'whatsapp',
    color: '#35B878',
    backgroundColor: '#E7F8EF',
  },
];

const QuickActions: React.FC = () => {
  const handleWhatsApp = async () => {
    const message =
      'Hello, this is a reminder from VLCC regarding your pending fees. Please clear your pending fees at the earliest. Thank you.';

    const whatsappAppUrl =
      `whatsapp://send?text=${encodeURIComponent(message)}`;

    const whatsappWebUrl =
      `https://wa.me/?text=${encodeURIComponent(message)}`;

    try {
      const supported =
        await Linking.canOpenURL(whatsappAppUrl);

      if (supported) {
        await Linking.openURL(whatsappAppUrl);
      } else {
        await Linking.openURL(whatsappWebUrl);
      }
    } catch {
      Alert.alert(
        'WhatsApp',
        'WhatsApp could not be opened on this device.',
      );
    }
  };

  const handleActionPress = async (title: string) => {
    if (title === 'WhatsApp') {
      await handleWhatsApp();
      return;
    }

    openDashboardFeature(title);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>
            Quick Actions
          </Text>

          <Text style={styles.subtitle}>
            Frequently used actions
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="lightning-bolt-outline"
            size={20}
            color="#7040D5"
          />
        </View>
      </View>

      {/* EXACTLY 3 ITEMS PER ROW */}
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.title}
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={() =>
              handleActionPress(action.title)
            }
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    action.backgroundColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={action.icon}
                size={23}
                color={action.color}
              />
            </View>

            <Text
              style={styles.actionTitle}
              numberOfLines={2}
            >
              {action.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  title: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  subtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8A94A6',
    marginTop: 1,
  },

  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1EAFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  actionCard: {
    /*
     * 3 cards per row.
     * 31.5% leaves enough horizontal space
     * for the three cards without wrapping
     * into 2 / 1 unexpectedly.
     */
    width: '31.5%',
    height: 92,

    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF0F5',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 5,
    paddingVertical: 8,
  },

  iconContainer: {
    width: 43,
    height: 43,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 7,
  },

  actionTitle: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#263247',
    textAlign: 'center',
    lineHeight: 13,
  },
});

export default QuickActions;