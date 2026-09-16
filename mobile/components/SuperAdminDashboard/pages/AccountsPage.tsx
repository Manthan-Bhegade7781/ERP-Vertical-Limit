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

type Transaction = {
  id: string;
  transactionId: string;
  description: string;
  category: string;
  branch: string;
  date: string;
  amount: number;
  type: 'Income' | 'Expense';
  status: 'Completed' | 'Pending';
};

const transactions: Transaction[] = [
  {
    id: '1',
    transactionId: 'TXN-2026-001',
    description: 'Student Fee Collection',
    category: 'Fees',
    branch: 'Pune Branch',
    date: '05 Sep 2026',
    amount: 125000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: '2',
    transactionId: 'TXN-2026-002',
    description: 'Faculty Salary Payment',
    category: 'Salary',
    branch: 'Main Branch',
    date: '04 Sep 2026',
    amount: 85000,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: '3',
    transactionId: 'TXN-2026-003',
    description: 'Student Fee Collection',
    category: 'Fees',
    branch: 'Mumbai Branch',
    date: '03 Sep 2026',
    amount: 98000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: '4',
    transactionId: 'TXN-2026-004',
    description: 'Office Maintenance',
    category: 'Maintenance',
    branch: 'Nashik Branch',
    date: '02 Sep 2026',
    amount: 24500,
    type: 'Expense',
    status: 'Completed',
  },
  {
    id: '5',
    transactionId: 'TXN-2026-005',
    description: 'Student Fee Collection',
    category: 'Fees',
    branch: 'Nagpur Branch',
    date: '01 Sep 2026',
    amount: 76000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: '6',
    transactionId: 'TXN-2026-006',
    description: 'Electricity Bill',
    category: 'Utilities',
    branch: 'Pune Branch',
    date: '31 Aug 2026',
    amount: 18500,
    type: 'Expense',
    status: 'Pending',
  },
  {
    id: '7',
    transactionId: 'TXN-2026-007',
    description: 'Admission Registration Fees',
    category: 'Admission',
    branch: 'Main Branch',
    date: '30 Aug 2026',
    amount: 54000,
    type: 'Income',
    status: 'Completed',
  },
  {
    id: '8',
    transactionId: 'TXN-2026-008',
    description: 'Stationery Purchase',
    category: 'Supplies',
    branch: 'Mumbai Branch',
    date: '29 Aug 2026',
    amount: 12500,
    type: 'Expense',
    status: 'Completed',
  },
];

const filters = ['All', 'Income', 'Expense', 'Pending'];

const formatCurrency = (amount: number) => {
  return `₹ ${amount.toLocaleString('en-IN')}`;
};

export default function AccountsPage() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const isDesktop = width >= 900;

  const contentWidth = isDesktop
    ? Math.min(width - 250 - 40, 1500)
    : width - 32;

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      let matchesFilter = true;

      if (selectedFilter === 'Income') {
        matchesFilter = transaction.type === 'Income';
      } else if (selectedFilter === 'Expense') {
        matchesFilter = transaction.type === 'Expense';
      } else if (selectedFilter === 'Pending') {
        matchesFilter = transaction.status === 'Pending';
      }

      const matchesSearch =
        !query ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.transactionId.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        transaction.branch.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [search, selectedFilter]);

  const handleBack = () => {
    router.replace('/(tabs)');
  };

  const handleAddTransaction = () => {
    router.push({
      pathname: '/(tabs)/explore',
      params: { feature: 'Add Transaction' },
    });
  };

  const handleView = (transaction: Transaction) => {
    Alert.alert(
      'Transaction Details',
      `${transaction.description}\n\n` +
        `Transaction ID: ${transaction.transactionId}\n` +
        `Category: ${transaction.category}\n` +
        `Branch: ${transaction.branch}\n` +
        `Date: ${transaction.date}\n` +
        `Amount: ${formatCurrency(transaction.amount)}\n` +
        `Type: ${transaction.type}\n` +
        `Status: ${transaction.status}`
    );
  };

  const handleEdit = (transaction: Transaction) => {
    Alert.alert(
      'Edit Transaction',
      `Edit options for ${transaction.transactionId} will be available here.`
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
            <Text style={styles.headerTitle}>Accounts</Text>
          </View>

          <TouchableOpacity
            style={styles.headerAction}
            onPress={handleAddTransaction}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={18}
              color="#7040D5"
            />

            <Text style={styles.headerActionText}>
              Add Transaction
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
        <View style={[styles.content, { width: contentWidth }]}>
          {/* PAGE TITLE */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                Accounts Management
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
              <AccountStatCard
                icon="cash-multiple"
                title="Total Revenue"
                value="₹ 32,50,000"
                change="11.4%"
                type="purple"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AccountStatCard
                icon="cash-minus"
                title="Total Expenses"
                value="₹ 14,25,000"
                change="6.8%"
                type="orange"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AccountStatCard
                icon="cash-clock"
                title="Pending Fees"
                value="₹ 18,25,000"
                change="8.5%"
                type="pink"
              />
            </View>

            <View
              style={[
                styles.statCardWrapper,
                isDesktop && styles.statCardWrapperDesktop,
              ]}
            >
              <AccountStatCard
                icon="bank-outline"
                title="Net Balance"
                value="₹ 18,25,000"
                change="9.7%"
                type="green"
              />
            </View>
          </View>

          {/* FINANCIAL OVERVIEW */}
          <View style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <View>
                <Text style={styles.overviewTitle}>
                  Financial Overview
                </Text>

                <Text style={styles.overviewSubtitle}>
                  Current academic year financial summary
                </Text>
              </View>

              <View style={styles.sessionBadge}>
                <MaterialCommunityIcons
                  name="calendar-check-outline"
                  size={16}
                  color="#7040D5"
                />

                <Text style={styles.sessionBadgeText}>
                  2026 - 27
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.overviewStats,
                isDesktop && styles.overviewStatsDesktop,
              ]}
            >
              <OverviewItem
                icon="arrow-down-bold"
                title="Income"
                value="₹ 32,50,000"
                type="income"
              />

              <OverviewItem
                icon="arrow-up-bold"
                title="Expenses"
                value="₹ 14,25,000"
                type="expense"
              />

              <OverviewItem
                icon="wallet-outline"
                title="Available Balance"
                value="₹ 18,25,000"
                type="balance"
              />
            </View>
          </View>

          {/* SEARCH / FILTER */}
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
                placeholder="Search transactions, categories, branches..."
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

            <View style={styles.filterRow}>
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
            </View>
          </View>

          {/* TRANSACTIONS HEADER */}
          <View style={styles.listHeader}>
            <View>
              <Text style={styles.listTitle}>
                Transactions
              </Text>

              <Text style={styles.listSubtitle}>
                {filteredTransactions.length} transaction
                {filteredTransactions.length === 1 ? '' : 's'} found
              </Text>
            </View>

            <View style={styles.totalBadge}>
              <MaterialCommunityIcons
                name="file-document-multiple-outline"
                size={16}
                color="#7040D5"
              />

              <Text style={styles.totalBadgeText}>
                {transactions.length} Total
              </Text>
            </View>
          </View>

          {/* TRANSACTION LIST */}
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="cash-remove"
                  size={34}
                  color="#7040D5"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No transactions found
              </Text>

              <Text style={styles.emptySubtitle}>
                Try changing your search or filter.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.transactionGrid,
                isDesktop && styles.transactionGridDesktop,
              ]}
            >
              {filteredTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  isDesktop={isDesktop}
                  onView={() => handleView(transaction)}
                  onEdit={() => handleEdit(transaction)}
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
   ACCOUNT STAT CARD
============================================================ */

type AccountStatCardProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  change: string;
  type: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
};

function AccountStatCard({
  icon,
  title,
  value,
  change,
  type,
}: AccountStatCardProps) {
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

    pink: {
      background: '#FFE9F0',
      icon: '#E95386',
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

        <Text
          style={styles.statValue}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   OVERVIEW ITEM
============================================================ */

type OverviewItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  value: string;
  type: 'income' | 'expense' | 'balance';
};

function OverviewItem({
  icon,
  title,
  value,
  type,
}: OverviewItemProps) {
  const config = {
    income: {
      background: '#E7F8EF',
      icon: '#35B878',
      text: '#26955E',
    },

    expense: {
      background: '#FFF1E2',
      icon: '#F7941D',
      text: '#D87908',
    },

    balance: {
      background: '#F1EAFF',
      icon: '#7040D5',
      text: '#7040D5',
    },
  };

  const item = config[type];

  return (
    <View style={styles.overviewItem}>
      <View
        style={[
          styles.overviewIcon,
          {
            backgroundColor: item.background,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color={item.icon}
        />
      </View>

      <View style={styles.overviewText}>
        <Text style={styles.overviewItemTitle}>
          {title}
        </Text>

        <Text
          style={[
            styles.overviewItemValue,
            {
              color: item.text,
            },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

/* ============================================================
   TRANSACTION CARD
============================================================ */

type TransactionCardProps = {
  transaction: Transaction;
  isDesktop: boolean;
  onView: () => void;
  onEdit: () => void;
};

function TransactionCard({
  transaction,
  isDesktop,
  onView,
  onEdit,
}: TransactionCardProps) {
  const isIncome = transaction.type === 'Income';

  return (
    <View
      style={[
        styles.transactionCard,
        isDesktop && styles.transactionCardDesktop,
      ]}
    >
      {/* TOP */}
      <View style={styles.transactionTop}>
        <View
          style={[
            styles.transactionIcon,
            isIncome
              ? styles.incomeIcon
              : styles.expenseIcon,
          ]}
        >
          <MaterialCommunityIcons
            name={
              isIncome
                ? 'arrow-down-bold'
                : 'arrow-up-bold'
            }
            size={21}
            color={isIncome ? '#35B878' : '#F7941D'}
          />
        </View>

        <View style={styles.transactionTitleArea}>
          <Text
            style={styles.transactionDescription}
            numberOfLines={1}
          >
            {transaction.description}
          </Text>

          <Text style={styles.transactionId}>
            {transaction.transactionId}
          </Text>
        </View>

        <View
          style={[
            styles.typeBadge,
            isIncome
              ? styles.incomeBadge
              : styles.expenseBadge,
          ]}
        >
          <Text
            style={[
              styles.typeBadgeText,
              {
                color: isIncome
                  ? '#26955E'
                  : '#D87908',
              },
            ]}
          >
            {transaction.type}
          </Text>
        </View>
      </View>

      {/* AMOUNT */}
      <View style={styles.amountRow}>
        <Text style={styles.amountLabel}>
          Amount
        </Text>

        <Text
          style={[
            styles.amountValue,
            {
              color: isIncome
                ? '#26955E'
                : '#D87908',
            },
          ]}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </Text>
      </View>

      {/* DETAILS */}
      <View style={styles.detailsContainer}>
        <DetailItem
          icon="shape-outline"
          label="Category"
          value={transaction.category}
        />

        <DetailItem
          icon="office-building-outline"
          label="Branch"
          value={transaction.branch}
        />

        <DetailItem
          icon="calendar-outline"
          label="Date"
          value={transaction.date}
        />
      </View>

      {/* STATUS */}
      <View style={styles.cardBottom}>
        <View
          style={[
            styles.statusBadge,
            transaction.status === 'Completed'
              ? styles.completedBadge
              : styles.pendingBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              transaction.status === 'Completed'
                ? styles.completedDot
                : styles.pendingDot,
            ]}
          />

          <Text
            style={[
              styles.statusText,
              transaction.status === 'Completed'
                ? styles.completedText
                : styles.pendingText,
            ]}
          >
            {transaction.status}
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
   DETAIL ITEM
============================================================ */

type DetailItemProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
};

function DetailItem({
  icon,
  label,
  value,
}: DetailItemProps) {
  return (
    <View style={styles.detailItem}>
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color="#7B8799"
      />

      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>
          {label}
        </Text>

        <Text
          style={styles.detailValue}
          numberOfLines={1}
        >
          {value}
        </Text>
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
    justifyContent: 'center',
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
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  sectionTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 22,
    color: '#172033',
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
    fontSize: 21,
    color: '#172033',
  },

  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF0F5',
    padding: 16,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 2,
  },

  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  overviewTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 15,
    color: '#172033',
  },

  overviewSubtitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9.5,
    color: '#8993A4',
    marginTop: 2,
  },

  sessionBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  sessionBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  overviewStats: {
    gap: 10,
  },

  overviewStatsDesktop: {
    flexDirection: 'row',
  },

  overviewItem: {
    flex: 1,
    minHeight: 70,
    borderRadius: 12,
    backgroundColor: '#FAFBFD',
    borderWidth: 1,
    borderColor: '#F0F1F5',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  overviewIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overviewText: {
    marginLeft: 10,
  },

  overviewItemTitle: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8993A4',
  },

  overviewItemValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    marginTop: 2,
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

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
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

  totalBadge: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 9,
    backgroundColor: '#F1EAFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  totalBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 10,
    color: '#7040D5',
    marginLeft: 5,
  },

  transactionGrid: {
    gap: 12,
  },

  transactionGridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  transactionCard: {
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

  transactionCardDesktop: {
    width: '32.4%',
  },

  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  incomeIcon: {
    backgroundColor: '#E7F8EF',
  },

  expenseIcon: {
    backgroundColor: '#FFF1E2',
  },

  transactionTitleArea: {
    flex: 1,
    marginLeft: 10,
    marginRight: 7,
  },

  transactionDescription: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 11.5,
    color: '#172033',
  },

  transactionId: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8.5,
    color: '#8A94A6',
    marginTop: 2,
  },

  typeBadge: {
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },

  incomeBadge: {
    backgroundColor: '#E7F8EF',
  },

  expenseBadge: {
    backgroundColor: '#FFF1E2',
  },

  typeBadgeText: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 8.5,
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingBottom: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },

  amountLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 9,
    color: '#8993A4',
  },

  amountValue: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
  },

  detailsContainer: {
    paddingTop: 12,
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 9,
  },

  detailText: {
    flex: 1,
    marginLeft: 8,
  },

  detailLabel: {
    fontFamily: 'PoppinsRegular',
    fontSize: 8,
    color: '#9AA3B2',
  },

  detailValue: {
    fontFamily: 'PoppinsMedium',
    fontSize: 9.5,
    color: '#3B4658',
    marginTop: 1,
  },

  cardBottom: {
    marginTop: 4,
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

  completedBadge: {
    backgroundColor: '#E7F8EF',
  },

  pendingBadge: {
    backgroundColor: '#FFF1E2',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  completedDot: {
    backgroundColor: '#35B878',
  },

  pendingDot: {
    backgroundColor: '#F7941D',
  },

  statusText: {
    fontFamily: 'PoppinsMedium',
    fontSize: 8.5,
  },

  completedText: {
    color: '#26955E',
  },

  pendingText: {
    color: '#D87908',
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