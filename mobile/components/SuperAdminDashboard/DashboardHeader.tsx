import React, { useCallback, useEffect, useState } from 'react';

import {

  Alert,

  Modal,

  Pressable,

  ScrollView,

  StyleSheet,

  Text,

  TextInput,

  TouchableOpacity,

  useWindowDimensions,

  View,

} from 'react-native';



import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';

import { router } from 'expo-router';

import { useAuth } from '@/context/AuthContext';
import { getToken } from '@/services/auth';
import { API_BASE_URL } from '@/config/api';



type NotificationItem = {
  id: string;
  icon: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
  type?: string;
  isMessage?: boolean;
};

const getNotificationIcon = (type?: string): string => {
  switch (type) {
    case 'registration': return 'account-plus-outline';
    case 'approval': return 'check-circle-outline';
    case 'rejection': return 'close-circle-outline';
    case 'fee': return 'cash-clock';
    case 'attendance': return 'calendar-check-outline';
    default: return 'bell-outline';
  }
};

const formatNotificationTime = (dateValue?: string): string => {
  if (!dateValue) return 'Recently';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Recently';
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

type DashboardHeaderProps = {

  isDesktop?: boolean;

  onMenuPress?: () => void;

};



const DashboardHeader: React.FC<DashboardHeaderProps> = ({

  isDesktop = true,

  onMenuPress,

}) => {

  const [notificationVisible, setNotificationVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const { logout, user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError('');

    try {
      const token = await getToken();
      if (!token) {
        setNotifications([]);
        setUnreadCount(0);
        setNotificationsError('Please sign in again to view notifications.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Unable to load notifications.');
      }

      const items = Array.isArray(result?.data?.notifications)
        ? result.data.notifications
        : [];

      setNotifications(items.map((item: any) => ({
        id: String(item._id || item.id),
        icon: item.icon || getNotificationIcon(item.type),
        title: item.title || 'Notification',
        message: item.message || '',
        time: formatNotificationTime(item.createdAt),
        isRead: Boolean(item.isRead),
        link: item.link || '',
        type: item.type || 'general',
        isMessage: Boolean(item.isMessage),
      })));
      setUnreadCount(Number(result?.data?.unreadCount ?? items.filter((item: any) => !item.isRead).length));
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setNotificationsError(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationAsRead = async (notificationId: string) => {
    const selected = notifications.find((item) => item.id === notificationId);
    if (!selected || selected.isRead) return;

    // Update the UI immediately, then sync the read status with the backend.
    setNotifications((current) => current.map((item) =>
      item.id === notificationId ? { ...item, isRead: true } : item
    ));
    setUnreadCount((count) => Math.max(0, count - 1));

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not found.');
      const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Unable to mark notification as read.');
    } catch (error) {
      console.error('Mark notification as read error:', error);
      void fetchNotifications();
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (unreadCount === 0) return;
    const previousNotifications = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      const token = await getToken();
      if (!token) throw new Error('Authentication token not found.');
      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Unable to mark all notifications as read.');
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      setNotifications(previousNotifications);
      void fetchNotifications();
    }
  };

  const handleNotificationPress = async (notification: NotificationItem) => {
    await markNotificationAsRead(notification.id);
    closeAll();

    const titleLower = (notification.title || '').toLowerCase();
    const link = notification.link || '';
    const icon = notification.icon || '';

    // If it's a message/reply notification, navigate to Messages page
    if (
      notification.isMessage ||
      link.includes('feature=Messages') ||
      link.includes('Messages') ||
      titleLower.includes('message') ||
      titleLower.includes('reply') ||
      icon.includes('email') ||
      icon.includes('message')
    ) {
      router.push({
        pathname: '/(super_admin)/explore',
        params: { feature: 'Messages' },
      });
      return;
    }

    if (link) {
      try {
        if (link.includes('feature=')) {
          const featureName = link.split('feature=')[1]?.split('&')[0];
          if (featureName) {
            router.push({
              pathname: '/(super_admin)/explore',
              params: { feature: decodeURIComponent(featureName) },
            });
            return;
          }
        }
        router.push(link as any);
        return;
      } catch (error) {
        console.error('Notification navigation error:', error);
      }
    }

    if (
      notification.type === 'registration' ||
      titleLower.includes('registration')
    ) {
      router.push({
        pathname: '/(super_admin)/explore',
        params: { feature: 'Pending Registrations' },
      });
    } else if (notification.type === 'fee' || titleLower.includes('fee')) {
      router.push({
        pathname: '/(super_admin)/explore',
        params: { feature: 'Accounts' },
      });
    } else if (
      notification.type === 'attendance' ||
      titleLower.includes('attendance')
    ) {
      router.push({
        pathname: '/(super_admin)/explore',
        params: { feature: 'Attendance' },
      });
    } else if (titleLower.includes('announcement')) {
      router.push({
        pathname: '/(super_admin)/explore',
        params: { feature: 'Announcements' },
      });
    }
  };

  const openNotifications = () => {

    setProfileVisible(false);

    setNotificationVisible(true);

  };



  const openProfile = () => {

    setNotificationVisible(false);

    setProfileVisible(true);

  };



  const closeAll = () => {

    setNotificationVisible(false);

    setProfileVisible(false);

  };



  const handleProfileOption = (option: string) => {

    setProfileVisible(false);



    if (option === 'profile') {

      router.push({

        pathname: '/(super_admin)/explore',

        params: {

          feature: 'Profile',

        },

      });

    }

    if (option === 'logout') {

  Alert.alert(

    'Logout',

    'Are you sure you want to logout?',

    [

      {

        text: 'Cancel',

        style: 'cancel',

      },

      {

        text: 'Logout',

        style: 'destructive',

        onPress: logout,

      },

    ],

    {

      cancelable: true,

    }

  );

}

  };



  /* ===================================================== */

  /* MOBILE HEADER                                         */

  /* ===================================================== */



  if (!isDesktop) {

    return (

      <>

        <LinearGradient

          colors={['#6D35D8', '#4522B8']}

          start={{ x: 0, y: 0 }}

          end={{ x: 1, y: 1 }}

          style={styles.mobileHeader}

        >

          <View style={styles.mobileTopRow}>

            {/* HAMBURGER */}

            <TouchableOpacity

              style={styles.mobileMenuButton}

              onPress={onMenuPress}

              activeOpacity={0.7}

            >

              <MaterialCommunityIcons

                name="menu"

                size={28}

                color="#FFFFFF"

              />

            </TouchableOpacity>



            {/* TITLE */}

            <View style={styles.mobileTitleContainer}>

              <Text style={styles.mobileTitle}>

                Dashboard

              </Text>

            </View>



            {/* ACTIONS */}

            <View style={styles.mobileActions}>

              {/* NOTIFICATION */}

              <TouchableOpacity

                style={styles.mobileNotification}

                onPress={openNotifications}

                activeOpacity={0.7}

              >

                <MaterialCommunityIcons

                  name="bell-outline"

                  size={23}

                  color="#FFFFFF"

                />



                <View style={styles.notificationBadge}>

                  <Text style={styles.notificationBadgeText}>

                    {unreadCount > 99 ? '99+' : unreadCount}

                  </Text>

                </View>

              </TouchableOpacity>



              {/* PROFILE */}

              <TouchableOpacity

                style={styles.mobileProfileButton}

                onPress={openProfile}

                activeOpacity={0.7}

              >

                <View style={styles.mobileAvatar}>

                  <MaterialCommunityIcons

                    name="account"

                    size={23}

                    color="#6D35D8"

                  />

                </View>

              </TouchableOpacity>

            </View>

          </View>



          <Text style={styles.mobileSubtitle}>

            Welcome back, {"\n"}{user?.fullName || 'there'}!

          </Text>

        </LinearGradient>



        {/* MOBILE MODALS */}

        <NotificationModal

          visible={notificationVisible}

          onClose={closeAll}

          isDesktop={false}

          notifications={notifications}
          unreadCount={unreadCount}
          loading={notificationsLoading}
          error={notificationsError}
          onRefresh={fetchNotifications}
          onMarkAllRead={markAllNotificationsAsRead}
          onNotificationPress={handleNotificationPress}
        />



        <ProfileModal

          visible={profileVisible}

          onClose={closeAll}

          isDesktop={false}

          onOption={handleProfileOption}

          user={user}

        />

      </>

    );

  }



  /* ===================================================== */

  /* DESKTOP HEADER                                        */

  /* ===================================================== */



  return (

    <>

      <LinearGradient

        colors={['#6D35D8', '#4522B8']}

        start={{ x: 0, y: 0 }}

        end={{ x: 1, y: 1 }}

        style={styles.desktopHeader}

      >

        {/* LEFT SIDE */}

        <View style={styles.desktopLeft}>

          <TouchableOpacity

            style={styles.desktopMenuButton}

            onPress={onMenuPress}

            activeOpacity={0.7}

          >

            <MaterialCommunityIcons

              name="menu"

              size={26}

              color="#FFFFFF"

            />

          </TouchableOpacity>



          <View>

            <Text style={styles.desktopTitle}>

              Dashboard

            </Text>



            <Text style={styles.desktopSubtitle}>

              Welcome back, {"\n"}{user?.fullName || 'there'}!

            </Text>

          </View>

        </View>



        {/* RIGHT SIDE */}

        <View style={styles.desktopRight}>

          {/* SEARCH */}

          <View style={styles.searchContainer}>

            <TextInput

              style={styles.searchInput}

              placeholder="Search anything..."

              placeholderTextColor="rgba(255,255,255,0.65)"

            />



            <MaterialCommunityIcons

              name="magnify"

              size={21}

              color="#FFFFFF"

            />

          </View>



          {/* NOTIFICATION */}

          <TouchableOpacity

            style={styles.desktopNotification}

            onPress={openNotifications}

            activeOpacity={0.7}

          >

            <MaterialCommunityIcons

              name="bell-outline"

              size={22}

              color="#FFFFFF"

            />



            <View style={styles.notificationBadge}>

              <Text style={styles.notificationBadgeText}>

                {unreadCount > 99 ? '99+' : unreadCount}

              </Text>

            </View>

          </TouchableOpacity>



          {/* PROFILE */}

          <TouchableOpacity

            style={styles.desktopProfile}

            onPress={openProfile}

            activeOpacity={0.7}

          >

            <View style={styles.desktopAvatar}>

              <MaterialCommunityIcons

                name="account"

                size={23}

                color="#7C879B"

              />

            </View>



            <Text style={styles.profileName}>

              {user?.fullName || 'Super Admin'}

            </Text>



            <MaterialCommunityIcons

              name="chevron-down"

              size={18}

              color="#FFFFFF"

            />

          </TouchableOpacity>

        </View>

      </LinearGradient>



      {/* DESKTOP MODALS */}

      <NotificationModal

        visible={notificationVisible}

        onClose={closeAll}

        isDesktop={true}

        notifications={notifications}
        unreadCount={unreadCount}
        loading={notificationsLoading}
        error={notificationsError}
        onRefresh={fetchNotifications}
        onMarkAllRead={markAllNotificationsAsRead}
        onNotificationPress={handleNotificationPress}
      />



      <ProfileModal

        visible={profileVisible}

        onClose={closeAll}

        isDesktop={true}

        onOption={handleProfileOption}

        user={user}

      />

    </>

  );

};



/* ========================================================= */

/* NOTIFICATION MODAL                                        */

/* ========================================================= */



type NotificationModalProps = {
  visible: boolean;
  onClose: () => void;
  isDesktop: boolean;
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onNotificationPress: (notification: NotificationItem) => void;
};




const NotificationModal: React.FC<NotificationModalProps> = ({
  visible, onClose, isDesktop, notifications, unreadCount, loading, error,
  onRefresh, onMarkAllRead, onNotificationPress,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const panelWidth = Math.min(isDesktop ? 390 : windowWidth - 24, windowWidth - 24);

  return (

    <Modal

      visible={visible}

      transparent

      animationType="fade"

      onRequestClose={onClose}

    >

      <Pressable

        style={styles.modalOverlay}

        onPress={onClose}

      >

        <Pressable

          style={[

            styles.notificationPanel,

            isDesktop

              ? styles.desktopNotificationPanel

              : styles.mobileNotificationPanel,

            { width: panelWidth, maxHeight: Math.max(260, windowHeight - 92), marginRight: isDesktop ? Math.min(80, Math.max(12, windowWidth * 0.035)) : 0 },

          ]}

          onPress={(event) => event.stopPropagation()}

        >

          {/* HEADER */}

          <View style={styles.panelHeader}>

            <View>

              <Text style={styles.panelTitle}>

                Notifications

              </Text>



              <Text style={styles.panelSubtitle}>

                {`You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}

              </Text>

            </View>



            <TouchableOpacity

              onPress={onClose}

              style={styles.closeButton}

            >

              <MaterialCommunityIcons

                name="close"

                size={21}

                color="#64748B"

              />

            </TouchableOpacity>

          </View>

          <TouchableOpacity
            onPress={onMarkAllRead}
            disabled={unreadCount === 0}
            style={{ paddingHorizontal: 8, paddingVertical: 8, opacity: unreadCount === 0 ? 0.45 : 1 }}
          >
            <Text style={{ color: '#6D35D8', fontSize: 11, fontWeight: '600' }}>
              Mark all read
            </Text>
          </TouchableOpacity>

          {/* NOTIFICATIONS */}

          <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={{ paddingBottom: 2 }} showsVerticalScrollIndicator={false}>
          {loading && notifications.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <Text style={styles.notificationMessage}>Loading notifications...</Text>
            </View>
          ) : error && notifications.length === 0 ? (
            <View style={{ paddingVertical: 20, paddingHorizontal: 8, alignItems: 'center' }}>
              <Text style={styles.notificationMessage}>{error}</Text>
              <TouchableOpacity onPress={onRefresh} style={{ marginTop: 10, padding: 8 }}>
                <Text style={{ color: '#6D35D8', fontWeight: '600' }}>Try again</Text>
              </TouchableOpacity>
            </View>
          ) : notifications.length === 0 ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <MaterialCommunityIcons name="bell-check-outline" size={30} color="#94A3B8" />
              <Text style={[styles.notificationMessage, { marginTop: 8 }]}>You are all caught up.</Text>
            </View>
          ) : notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationItem, notification.isRead && { opacity: 0.72 }]}
              activeOpacity={0.7}
              onPress={() => onNotificationPress(notification)}
            >
              <View style={styles.notificationIcon}>
                <MaterialCommunityIcons name={notification.icon as any} size={21} color="#6D35D8" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage}>{notification.message}</Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {!notification.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
          </ScrollView>



          {/* VIEW ALL */}

          <TouchableOpacity

            style={styles.viewAllButton}

            onPress={onClose}

          >

            <Text style={styles.viewAllText}>

              View All Notifications

            </Text>



            <MaterialCommunityIcons

              name="arrow-right"

              size={17}

              color="#6D35D8"

            />

          </TouchableOpacity>

        </Pressable>

      </Pressable>

    </Modal>

  );

};



/* ========================================================= */

/* PROFILE MODAL                                             */

/* ========================================================= */



type ProfileModalProps = {

  visible: boolean;

  onClose: () => void;

  isDesktop: boolean;

  onOption: (option: string) => void;

  user: {

    fullName: string;

    email: string;

    roles: string[];

  } | null;

};



const ProfileModal: React.FC<ProfileModalProps> = ({

  visible,

  onClose,

  isDesktop,

  onOption,

  user,

}) => {

  return (

    <Modal

      visible={visible}

      transparent

      animationType="fade"

      onRequestClose={onClose}

    >

      <Pressable

        style={styles.modalOverlay}

        onPress={onClose}

      >

        <Pressable

          style={[

            styles.profilePanel,

            isDesktop

              ? styles.desktopProfilePanel

              : styles.mobileProfilePanel,

          ]}

          onPress={(event) => event.stopPropagation()}

        >

          {/* PROFILE HEADER */}

          <View style={styles.profileHeader}>

            <View style={styles.largeAvatar}>

              <MaterialCommunityIcons

                name="account"

                size={34}

                color="#6D35D8"

              />

            </View>



            <View style={styles.profileHeaderText}>

              <Text style={styles.profileTitle}>

                {user?.fullName || 'Super Admin'}

              </Text>



              <Text style={styles.profileEmail}>

                {user?.email || 'No email available'}

              </Text>

            </View>

          </View>



          <View style={styles.profileDivider} />



          {/* MY PROFILE */}

          <TouchableOpacity

            style={styles.profileOption}

            onPress={() => onOption('profile')}

            activeOpacity={0.7}

          >

            <View style={styles.profileOptionIcon}>

              <MaterialCommunityIcons

                name="account-outline"

                size={21}

                color="#6D35D8"

              />

            </View>



            <Text style={styles.profileOptionText}>

              My Profile

            </Text>



            <MaterialCommunityIcons

              name="chevron-right"

              size={20}

              color="#94A3B8"

            />

          </TouchableOpacity>

          {/* LOGOUT */}

          <TouchableOpacity

            style={styles.profileOption}

            onPress={() => onOption('logout')}

            activeOpacity={0.7}

          >

            <View

              style={[

                styles.profileOptionIcon,

                styles.logoutIcon,

              ]}

            >

              <MaterialCommunityIcons

                name="logout"

                size={21}

                color="#EF4444"

              />

            </View>



            <Text

              style={[

                styles.profileOptionText,

                styles.logoutText,

              ]}

            >

              Logout

            </Text>



            <MaterialCommunityIcons

              name="chevron-right"

              size={20}

              color="#94A3B8"

            />

          </TouchableOpacity>

        </Pressable>

      </Pressable>

    </Modal>

  );

};



/* ========================================================= */

/* STYLES                                                     */

/* ========================================================= */



const styles = StyleSheet.create({

  /* ============================= */

  /* MOBILE HEADER */

  /* ============================= */



  mobileHeader: {

    width: '100%',

    backgroundColor: '#6D35D8',

    borderBottomWidth: 0,

    paddingTop: 55,

    paddingHorizontal: 16,

    paddingBottom: 15,

    borderBottomLeftRadius: 30,

    borderBottomRightRadius: 30,

  },



  mobileTopRow: {

    width: '100%',

    height: 40,

    flexDirection: 'row',

    alignItems: 'center',

  },



  mobileMenuButton: {

    width: 40,

    height: 40,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 6,

  },



  mobileTitleContainer: {

    flex: 1,

    justifyContent: 'center',

  },



  mobileTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 22,

    lineHeight: 29,

    color: '#FFFFFF',

  },



  mobileActions: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

  },



  mobileNotification: {

    width: 40,

    height: 40,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.25)',

    backgroundColor: 'rgba(255,255,255,0.08)',

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

  },



  mobileProfileButton: {

    width: 40,

    height: 40,

    alignItems: 'center',

    justifyContent: 'center',

  },



  mobileAvatar: {

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

  },



  mobileSubtitle: {

    fontFamily: 'PoppinsMedium',

    fontSize: 13,

    color: 'rgba(255,255,255,0.82)',

    marginLeft: 46,

    marginTop: 1,

  },



  /* ============================= */

  /* NOTIFICATION BADGE */

  /* ============================= */



  notificationBadge: {

    position: 'absolute',

    top: -4,

    right: -4,

    width: 17,

    height: 17,

    borderRadius: 9,

    backgroundColor: '#EF4444',

    borderWidth: 1.5,

    borderColor: '#5A2BC4',

    alignItems: 'center',

    justifyContent: 'center',

  },



  notificationBadgeText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 8,

    color: '#FFFFFF',

  },



  /* ============================= */

  /* DESKTOP HEADER */

  /* ============================= */



  desktopHeader: {

    width: '100%',

    minHeight: 78,

    backgroundColor: '#6D35D8',

    borderBottomWidth: 0,

    paddingHorizontal: 20,

    paddingVertical: 12,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

  },



  desktopLeft: {

    flexDirection: 'row',

    alignItems: 'center',

    flexShrink: 1,

    minWidth: 0,

  },



  desktopMenuButton: {

    width: 42,

    height: 42,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,

  },



  desktopTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 23,

    color: '#FFFFFF',

  },



  desktopSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 13,

    color: 'rgba(255,255,255,0.82)',

  },



  desktopRight: {

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,

    flexShrink: 0,

    marginLeft: 12,

  },



  /* ============================= */

  /* SEARCH */

  /* ============================= */



  searchContainer: {

    width: 210,

    maxWidth: '38%',

    height: 42,

    borderRadius: 10,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.28)',

    backgroundColor: 'rgba(255,255,255,0.10)',

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 13,

  },



  searchInput: {

    flex: 1,

    fontFamily: 'PoppinsRegular',

    fontSize: 12,

    color: '#FFFFFF',

    paddingVertical: 0,

  },



  /* ============================= */

  /* DESKTOP NOTIFICATION */

  /* ============================= */



  desktopNotification: {

    width: 40,

    height: 40,

    borderRadius: 9,

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.25)',

    backgroundColor: 'rgba(255,255,255,0.08)',

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

  },



  /* ============================= */

  /* DESKTOP PROFILE */

  /* ============================= */



  desktopProfile: {

    flexDirection: 'row',

    alignItems: 'center',

    marginLeft: 1,

  },



  desktopAvatar: {

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: '#FFFFFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 7,

  },



  profileName: {

    fontFamily: 'PoppinsMedium',

    fontSize: 12,

    color: '#FFFFFF',

    marginRight: 2,

    maxWidth: 150,

  },



  /* ============================= */

  /* MODAL */

  /* ============================= */



  modalOverlay: {

    flex: 1,

    backgroundColor: 'rgba(15, 23, 42, 0.28)',

    alignItems: 'flex-end',

    justifyContent: 'flex-start',

    paddingHorizontal: 12,

  },



  /* ============================= */

  /* NOTIFICATION PANEL */

  /* ============================= */



  notificationPanel: {

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 6,

    },

    shadowOpacity: 0.18,

    shadowRadius: 15,

    elevation: 10,

    overflow: 'hidden',

  },



  desktopNotificationPanel: {

    width: 390,

    maxWidth: '100%',

    marginTop: 78,

    marginRight: 80,

  },



  mobileNotificationPanel: {

    width: '100%',

    marginTop: 68,

    marginRight: 0,

  },



  panelHeader: {

    paddingHorizontal: 16,

    paddingVertical: 14,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    borderBottomWidth: 1,

    borderBottomColor: '#EEF0F4',

  },



  panelTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 16,

    color: '#172033',

  },



  panelSubtitle: {

    fontFamily: 'PoppinsRegular',

    fontSize: 10.5,

    color: '#7B8498',

    marginTop: 2,

  },



  closeButton: {

    width: 32,

    height: 32,

    borderRadius: 8,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: '#F5F3FF',

  },



  notificationItem: {

    flexDirection: 'row',

    alignItems: 'flex-start',

    paddingHorizontal: 13,

    paddingVertical: 12,

    borderBottomWidth: 1,

    borderBottomColor: '#F0F2F5',

  },



  notificationIcon: {

    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: '#F0EDFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,

  },



  notificationContent: {

    flex: 1,

  },



  notificationTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 12,

    color: '#202B3E',

  },



  notificationMessage: {

    fontFamily: 'PoppinsRegular',

    fontSize: 11,

    color: '#748096',

    marginTop: 2,

  },



  notificationTime: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9,

    color: '#A0A8B7',

    marginTop: 4,

  },



  unreadDot: {

    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor: '#6D35D8',

    marginTop: 6,

    marginLeft: 7,

  },



  viewAllButton: {

    height: 48,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    gap: 7,

  },



  viewAllText: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 11,

    color: '#6D35D8',

  },



  /* ============================= */

  /* PROFILE PANEL */

  /* ============================= */



  profilePanel: {

    backgroundColor: '#FFFFFF',

    borderRadius: 14,

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: 6,

    },

    shadowOpacity: 0.18,

    shadowRadius: 15,

    elevation: 10,

    overflow: 'hidden',

  },



  desktopProfilePanel: {

    width: 280,

    maxWidth: '100%',

    marginTop: 78,

    marginRight: 12,

  },



  mobileProfilePanel: {

    width: '100%',

    marginTop: 68,

    marginRight: 0,

  },



  profileHeader: {

    flexDirection: 'row',

    alignItems: 'center',

    padding: 18,

  },



  largeAvatar: {

    width: 52,

    height: 52,

    borderRadius: 26,

    backgroundColor: '#F0EDFF',

    alignItems: 'center',

    justifyContent: 'center',

  },



  profileHeaderText: {

    marginLeft: 12,

    flex: 1,

  },



  profileTitle: {

    fontFamily: 'PoppinsSemiBold',

    fontSize: 14,

    color: '#172033',

  },



  profileEmail: {

    fontFamily: 'PoppinsRegular',

    fontSize: 9.5,

    color: '#7B8498',

    marginTop: 2,

  },



  profileDivider: {

    height: 1,

    backgroundColor: '#EEF0F4',

  },



  profileOption: {

    minHeight: 52,

    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: 16,

  },



  profileOptionIcon: {

    width: 34,

    height: 34,

    borderRadius: 9,

    backgroundColor: '#F0EDFF',

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,

  },



  profileOptionText: {

    flex: 1,

    fontFamily: 'PoppinsMedium',

    fontSize: 11.5,

    color: '#334155',

  },



  logoutIcon: {

    backgroundColor: '#FEF2F2',

  },



  logoutText: {

    color: '#EF4444',

  },

});



export default DashboardHeader;