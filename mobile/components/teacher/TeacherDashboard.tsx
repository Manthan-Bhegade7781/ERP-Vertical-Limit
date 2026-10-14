import React, {

  useRef,

  useState,

} from 'react';

import {

  Animated,

  ScrollView,

  StyleSheet,

  View,

} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TeacherHeader from './TeacherHeader';

import TeacherBottomNav from './TeacherBottomNav';

import OverviewSection from './Overview/OverviewSection';

import ScheduleSection from './Schedule/ScheduleSection';

import QuickActionsSection from './QuickActions/QuickActionsSection';

import AnnouncementsSection from './Announcements/AnnouncementsSection';

import ProfilePage from './Profile/ProfilePage';

import { useAuth } from '@/context/AuthContext';

import { updateCurrentUser } from '@/services/auth';

import MarkAttendance from './QuickActions/MarkAttendance';

import AddLectureLog from './QuickActions/AddLectureLog';

import BatchesPage from './Batches/BatchesPage';

import StudentsPage from './Students/StudentsPage';

import ReportsPage from './Reports/ReportsPage';

type TabName =

  | 'home'

  | 'batches'

  | 'students'

  | 'profile'

  | 'attendance'

  | 'lectureLog'

  | 'reports';

export default function TeacherDashboard() {

  const insets = useSafeAreaInsets();

  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] =

    useState<TabName>('home');

  /*

   * Profile data

   * Comes from the authenticated user.

   */

  const profileName = user?.fullName ?? '';

  const profileEmail = user?.email ?? '';

  const profilePhone = user?.mobileNumber ?? '';

  /* --------------------------------
     SELECTED STUDENT FOR REPORT
  -------------------------------- */
  const [selectedStudentId, setSelectedStudentId] =
    useState<string | undefined>(undefined);

  const [selectedStudentName, setSelectedStudentName] =
    useState<string | undefined>(undefined);

  /* --------------------------------
     BOTTOM NAV ANIMATION
  -------------------------------- */

  const bottomNavTranslateY =

    useRef(new Animated.Value(0)).current;

  const lastScrollY =

    useRef(0);

  const isBottomNavHidden =

    useRef(false);

  const bottomNavHeight =

    82 + insets.bottom;

  /* --------------------------------

     SCROLL HANDLER

  -------------------------------- */

  const handleContentScroll = (

    event: any,

  ) => {

    const currentScrollY =

      event.nativeEvent.contentOffset.y;

    const difference =

      currentScrollY -

      lastScrollY.current;

    /*

     * Always show navbar when the user

     * reaches the top of the page.

     */

    if (currentScrollY <= 5) {

      if (isBottomNavHidden.current) {

        isBottomNavHidden.current = false;

        Animated.timing(

          bottomNavTranslateY,

          {

            toValue: 0,

            duration: 220,

            useNativeDriver: true,

          },

        ).start();

      }

      lastScrollY.current =

        currentScrollY;

      return;

    }

    /*

     * Ignore tiny movements.

     */

    if (Math.abs(difference) < 4) {

      return;

    }

    /*

     * Scroll DOWN -> hide bottom navigation.

     */

    if (difference > 0) {

      if (!isBottomNavHidden.current) {

        isBottomNavHidden.current = true;

        Animated.timing(

          bottomNavTranslateY,

          {

            toValue: bottomNavHeight,

            duration: 220,

            useNativeDriver: true,

          },

        ).start();

      }

    }

    /*

     * Scroll UP -> show bottom navigation.

     */

    else {

      if (isBottomNavHidden.current) {

        isBottomNavHidden.current = false;

        Animated.timing(

          bottomNavTranslateY,

          {

            toValue: 0,

            duration: 220,

            useNativeDriver: true,

          },

        ).start();

      }

    }

    lastScrollY.current =

      currentScrollY;

  };

  /* --------------------------------

     RESET BOTTOM NAV

  -------------------------------- */

  const resetBottomNav = () => {

    lastScrollY.current = 0;

    isBottomNavHidden.current = false;

    bottomNavTranslateY.setValue(0);

  };

  /* --------------------------------

     TAB CHANGE

  -------------------------------- */

  const handleTabChange = (

    tab: TabName,

  ) => {

    resetBottomNav();

    setActiveTab(tab);

  };

  /* --------------------------------
     OPEN STUDENT REPORT
  -------------------------------- */
  const handleStudentReportPress = (
    studentId: string,
    studentName: string,
  ) => {
    setSelectedStudentId(studentId);
    setSelectedStudentName(studentName);
    resetBottomNav();
    setActiveTab('reports');
  };

  /* --------------------------------

     SAVE PROFILE

  -------------------------------- */

  const handleSaveProfile = async (

    name: string,

    email: string,

    phone: string,

  ) => {

    try {

      const result = await updateCurrentUser(

        name,

        email,

        phone,

      );

      if (

        !result.success ||

        !result.data?.user

      ) {

        console.error(

          'PROFILE UPDATE FAILED:',

          result.message,

        );

        return;

      }

      const updatedUser =

        result.data.user;

      /*

       * Update global authentication state

       * so the new profile information is

       * immediately reflected throughout

       * the app.

       */

      updateUser(updatedUser);

      console.log(

        'PROFILE UPDATED:',

        updatedUser,

      );

    } catch (error) {

      console.error(

        'PROFILE UPDATE ERROR:',

        error,

      );

    }

  };

  return (

    <View style={styles.container}>

      {/* =================================

          HEADER

      ================================= */}

      <TeacherHeader

        onMenuPress={() => {

          console.log(

            'Menu pressed',

          );

        }}

        onNotificationPress={() => {

          console.log(

            'Notifications pressed',

          );

        }}

        onProfilePress={() => {

          resetBottomNav();

          setActiveTab('profile');

        }}

      />

      {/* =================================

          HOME

      ================================= */}

      {activeTab === 'home' && (

        <ScrollView

          style={styles.scrollView}

          contentContainerStyle={[

            styles.scrollContent,

            {

              paddingBottom:

                bottomNavHeight + 20,

            },

          ]}

          showsVerticalScrollIndicator={

            false

          }

          scrollEventThrottle={16}

          onScroll={

            handleContentScroll

          }

        >

          <OverviewSection />

          <ScheduleSection

            onViewAllPress={() => {

              console.log(

                'View All Schedule pressed',

              );

            }}

          />

          <QuickActionsSection

            onAttendancePress={() => {

              handleTabChange(

                'attendance',

              );

            }}

            onLectureLogPress={() => {

              handleTabChange(

                'lectureLog',

              );

            }}

            onBatchesPress={() => {

              handleTabChange(

                'batches',

              );

            }}

            onReportsPress={() => {

              /*

                Quick Actions -> View Reports

              */

              setSelectedStudentId(

                undefined,

              );

              setSelectedStudentName(

                undefined,

              );

              handleTabChange(

                'reports',

              );

            }}

          />

          <AnnouncementsSection

            onViewAllPress={() => {

              console.log(

                'View All Announcements pressed',

              );

            }}

          />

        </ScrollView>

      )}

      {/* =================================

          PROFILE

      ================================= */}

      {activeTab === 'profile' && (

        <View style={styles.pageContainer}>

          <ProfilePage

            name={profileName}

            email={profileEmail}

            phone={profilePhone}

            onSaveProfile={

              handleSaveProfile

            }

            onContentScroll={

              handleContentScroll

            }

          />

        </View>

      )}

      {/* =================================

          BATCHES

      ================================= */}

      {activeTab === 'batches' && (

        <View style={styles.pageContainer}>

          <BatchesPage

            onContentScroll={

              handleContentScroll

            }

          />

        </View>

      )}

      {/* =================================

          STUDENTS

      ================================= */}

      {activeTab === 'students' && (

        <View style={styles.pageContainer}>

          <StudentsPage

            onContentScroll={

              handleContentScroll

            }

            onStudentReportPress={

              handleStudentReportPress

            }

          />

        </View>

      )}

      {/* =================================

          ATTENDANCE

      ================================= */}

      {activeTab === 'attendance' && (

        <View

          style={

            styles.pageContainer

          }

        >

          <MarkAttendance

            onContentScroll={

              handleContentScroll

            }

          />

        </View>

      )}

      {/* =================================

          LECTURE LOG

      ================================= */}

      {activeTab === 'lectureLog' && (

        <View

          style={

            styles.pageContainer

          }

        >

          <AddLectureLog

            onContentScroll={

              handleContentScroll

            }

          />

        </View>

      )}

      {/* =================================

          REPORTS

      ================================= */}

      {activeTab === 'reports' && (

        <View

          style={

            styles.pageContainer

          }

        >

          <ReportsPage

            studentId={

              selectedStudentId

            }

            studentName={

              selectedStudentName

            }

            onContentScroll={

              handleContentScroll

            }

          />

        </View>

      )}

      {/* =================================

          STUDENTS PLACEHOLDER

      ================================= */}

      {/*&#x20;

        This is intentionally not used because

        StudentsPage is now connected above.

      */}

      {/* =================================

          BOTTOM NAVIGATION

          Attendance and lectureLog are subpages, and reports are also
          internal pages. TeacherBottomNav supports only home, batches,
          students, and profile, so internal pages map to home.

      ================================= */}

      <Animated.View

        style={[

          styles.bottomNavWrapper,

          {

            paddingBottom:

              insets.bottom,

            transform: [

              {

                translateY:

                  bottomNavTranslateY,

              },

            ],

          },

        ]}

      >

        <TeacherBottomNav

          activeTab={

            activeTab === 'batches'

              ? 'batches'

              : activeTab === 'students'

                ? 'students'

                : activeTab === 'profile'

                  ? 'profile'

                  : 'home'

          }

          onTabChange={

            handleTabChange

          }

          onAddPress={() => {

            console.log(

              'Add pressed',

            );

          }}

        />

      </Animated.View>

    </View>

  );

}

/* =====================================

   STYLES

===================================== */

const styles = StyleSheet.create({

  container: {

    flex: 1,

    backgroundColor: '#F7F7FA',

  },

  scrollView: {

    flex: 1,

  },

  scrollContent: {

    paddingHorizontal: 20,

    paddingTop: 14,

  },

  pageContainer: {

    flex: 1,

    backgroundColor: '#F6F6F9',

  },

  bottomNavWrapper: {

    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    backgroundColor: '#FFFFFF',

    zIndex: 999,

    elevation: 30,

    borderTopWidth: 1,

    borderTopColor: '#E6E6EA',

    shadowColor: '#000000',

    shadowOffset: {

      width: 0,

      height: -2,

    },

    shadowOpacity: 0.08,

    shadowRadius: 6,

  },

});
