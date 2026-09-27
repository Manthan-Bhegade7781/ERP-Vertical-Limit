import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboard() {
  const stats = [
    { title: 'My Students', value: '320', icon: 'people-outline' as const, color: '#6c63ff' },
    { title: 'My Teachers', value: '18', icon: 'school-outline' as const, color: '#00c9a7' },
    { title: 'My Batches', value: '12', icon: 'calendar-outline' as const, color: '#ff6b6b' },
    { title: 'Fee Collection', value: '₹4.2L', icon: 'cash-outline' as const, color: '#ffd93d' },
  ];

  const quickActions = [
    { title: 'Manage Students', icon: 'people' as const, color: '#6c63ff' },
    { title: 'Manage Teachers', icon: 'school' as const, color: '#00c9a7' },
    { title: 'Manage Batches', icon: 'calendar' as const, color: '#ff6b6b' },
    { title: 'Fee Reports', icon: 'cash' as const, color: '#ffd93d' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a23" />

      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.name}>Admin 👋</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={stat.icon} size={28} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.title}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={[styles.actionCard, { borderColor: action.color + '40' }]}>
              <Ionicons name={action.icon} size={30} color={action.color} />
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a23',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0a0a23',
  },
  greeting: {
    fontSize: 16,
    color: '#a0a0b0',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0b0',
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  actionCard: {
    backgroundColor: '#1a1a3e',
    borderRadius: 16,
    padding: 18,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 10,
    textAlign: 'center',
  },
});
