import { router } from 'expo-router';

export const openDashboardFeature = (
  feature: string
) => {
  switch (feature) {
    /* =====================================================
       DASHBOARD
       ===================================================== */

    case 'Dashboard':
      router.push('/(tabs)');
      break;

    /* =====================================================
       MAIN MODULES
       ===================================================== */

    case 'Students':
    case 'Teachers':
    case 'Courses':
    case 'Branches':
    case 'Batches':
    case 'Attendance':
    case 'Examinations':
    case 'Assignments':
    case 'Fees Management':
    case 'Performance':
    case 'Users & Roles':
    case 'Announcements':
    case 'Messages':
    case 'Reports':
    case 'Settings':
    case 'Audit Logs':

    /* =====================================================
       DASHBOARD STAT CARDS
       ===================================================== */

    case 'Timetable':
    case 'Staff on Leave':
    case 'Academics':
    case 'Accounts':
    case 'Academic Calendar':

    /* =====================================================
       PROFILE
       ===================================================== */

    case 'Profile':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature,
        },
      });
      break;

    /* =====================================================
       QUICK ACTIONS
       Opens corresponding existing module
       ===================================================== */

    case 'Add Student':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Students',
        },
      });
      break;

    case 'Add Teacher':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Teachers',
        },
      });
      break;

    case 'Add Course':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Courses',
        },
      });
      break;

    case 'Create Batch':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Batches',
        },
      });
      break;

    case 'Generate Report':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Reports',
        },
      });
      break;

    case 'Student Complaint':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Student Complaint',
        },
      });
      break;

    case 'Quiz':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Examinations',
        },
      });
      break;

    case 'Event':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Academic Calendar',
        },
      });
      break;

    case 'PTG':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'PTG',
        },
      });
      break;

    case 'Feedback':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Feedback',
        },
      });
      break;

    case 'WhatsApp':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Messages',
        },
      });
      break;

    /* =====================================================
       FEE COLLECTION
       Opens existing Fees Management page
       ===================================================== */

    case 'Fee Collection':
      router.push({
        pathname: '/(super_admin)/explore',
        params: {
          feature: 'Fees Management',
        },
      });
      break;

    /* =====================================================
       FALLBACK
       ===================================================== */

    default:
      console.log(
        `No route configured for feature: ${feature}`
      );
      break;
  }
};