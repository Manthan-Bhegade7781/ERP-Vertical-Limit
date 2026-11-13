import { API_BASE_URL } from '@/config/api';
import { getToken } from '@/services/auth';

export type PTGStatus = 'Scheduled' | 'Completed' | 'Pending';

export type StudentPTGMeeting = {
  id: string;
  meetingDate: string;
  formattedDate: string;
  formattedTime: string;
  purpose: string;
  notes: string;
  status: PTGStatus;
  teacherName: string;
  teacherEmail: string;
  teacherSpecialization: string;
  studentName: string;
  guardianName: string;
  guardianMobile: string;
  batchName: string;
  standard: string;
  isUpcoming: boolean;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatTime = (dateString?: string) => {
  if (!dateString) return '—';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export async function fetchStudentPTGMeetings(): Promise<StudentPTGMeeting[]> {
  const token = await getToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE_URL}/ptg?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  const raw = await response.text();
  let result: any = {};
  try {
    result = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Server returned an invalid response (HTTP ${response.status}).`);
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Unable to load PTG meetings.');
  }

  const list: any[] = Array.isArray(result?.data?.meetings)
    ? result.data.meetings
    : Array.isArray(result?.data)
    ? result.data
    : [];

  const now = new Date().getTime();

  return list.map((item: any): StudentPTGMeeting => {
    const meetingTime = new Date(item.meetingDate).getTime();
    const isUpcoming = meetingTime > now && item.status === 'Scheduled';

    const teacherObj = item.teacherId;
    const teacherUser = teacherObj?.userId;
    const teacherName =
      (typeof teacherUser === 'object' && teacherUser?.fullName) ||
      (typeof teacherObj === 'object' && teacherObj?.fullName) ||
      'Faculty Member';
    const teacherEmail =
      (typeof teacherUser === 'object' && teacherUser?.email) || '';
    const teacherSpecialization =
      (typeof teacherObj === 'object' && teacherObj?.specialization) || 'Subject Mentor';

    const studentObj = item.studentId;
    const studentUser = studentObj?.userId;
    const studentName =
      (typeof studentUser === 'object' && studentUser?.fullName) ||
      'Student';
    const guardianName = studentObj?.guardianName || 'Parent / Guardian';
    const guardianMobile = studentObj?.guardianMobile || '';
    const batchName = studentObj?.batchId?.name || '';
    const standard = studentObj?.batchId?.standard || '';

    return {
      id: String(item._id || item.id),
      meetingDate: item.meetingDate || '',
      formattedDate: formatDate(item.meetingDate),
      formattedTime: formatTime(item.meetingDate),
      purpose: item.purpose || 'Academic Progress Review',
      notes: item.notes || '',
      status: (item.status as PTGStatus) || 'Scheduled',
      teacherName,
      teacherEmail,
      teacherSpecialization,
      studentName,
      guardianName,
      guardianMobile,
      batchName,
      standard,
      isUpcoming,
    };
  });
}
