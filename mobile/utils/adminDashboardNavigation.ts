import { router } from "expo-router";

export type AdminFeature =
  | "Dashboard"
  | "Students"
  | "Teachers"
  | "Subjects"
  | "Batches"
  | "Attendance"
  | "Examinations"
  | "Assignments"
  | "Performance"
  | "Announcements"
  | "Messages"
  | "Reports"
  | "Timetable"
  | "Staff on Leave"
  | "PTG"
  | "Student Complaint"
  | "Feedback"
  | "Profile"
  | "Settings";

export function navigateAdminFeature(feature: AdminFeature) {
  router.push({
    pathname: "/(admin)/explore",
    params: { feature },
  } as never);
}

export function goToAddStudent() {
  router.push("/(admin)/add-student" as never);
}

export function goToAddTeacher() {
  router.push("/(admin)/add-teacher" as never);
}

export function goToAddSubject() {
  router.push("/(admin)/add-subject" as never);
}

export function goToAddBatch() {
  router.push("/(admin)/add-batch" as never);
}

export function goToAddExaminations() {
  router.push("/(admin)/add-examination" as never);
}
export function goToAddAssignment() {
  router.push("/(admin)/add-assignment" as never);
}
export function goToAddPerformance() {
  router.push("/(admin)/add-performance" as never);
}
export function goToAddAnnouncement() {
  router.push("/(admin)/add-announcement" as never);
}
export function goToAddMessage() {
  router.push("/(admin)/add-message" as never);
}
export function goToAddReport() {
  router.push("/(admin)/add-report" as never);
}
export function goToAddTimetable() {
  router.push("/(admin)/add-timetable" as never);
}
export function goToAddStaffOnLeave() {
  router.push("/(admin)/add-staff-on-leave" as never);
}
export function goToAddPTG() {
  router.push("/(admin)/add-ptg" as never);
}
export function goToAddStudentComplaint() {
  router.push("/(admin)/add-student-complaint" as never);
}
export function goToAddFeedback() {
  router.push("/(admin)/add-feedback" as never);
}

export function goToAdminStudents() {
  navigateAdminFeature("Students");
}

export function goToAdminTeachers() {
  navigateAdminFeature("Teachers");
}

export function goToAdminSubjects() {
  navigateAdminFeature("Subjects");
}

export function goToAdminBatches() {
  navigateAdminFeature("Batches");
}

export function goToAdminAttendance() {
  navigateAdminFeature("Attendance");
}

export function goToAdminExaminations() {
  navigateAdminFeature("Examinations");
}

export function goToAdminAssignments() {
  navigateAdminFeature("Assignments");
}

export function goToAdminPerformance() {
  navigateAdminFeature("Performance");
}

export function goToAdminAnnouncements() {
  navigateAdminFeature("Announcements");
}

export function goToAdminMessages() {
  navigateAdminFeature("Messages");
}

export function goToAdminReports() {
  navigateAdminFeature("Reports");
}

export function goToAdminTimetable() {
  navigateAdminFeature("Timetable");
}

export function goToAdminStaffOnLeave() {
  navigateAdminFeature("Staff on Leave");
}

export function goToAdminPTG() {
  navigateAdminFeature("PTG");
}

export function goToAdminStudentComplaint() {
  navigateAdminFeature("Student Complaint");
}

export function goToAdminFeedback() {
  navigateAdminFeature("Feedback");
}

export function goToAdminProfile() {
  navigateAdminFeature("Profile");
}

export function goToAdminSettings() {
  navigateAdminFeature("Settings");
}