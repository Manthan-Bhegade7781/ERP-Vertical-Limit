import {
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

export type LectureLog = {
  id: string;
  date: string;
  batch: string;
  subject: string;
  time: string;
  description: string;
  source: 'attendance' | 'lecture-log';
};

let lectureLogs: LectureLog[] = [
  {
    id: 'log-001',
    date: '08 Sep 2026',
    batch: '8th Standard',
    subject: 'Physics',
    time: '09:00 AM - 10:00 AM',
    description:
      'Introduction to force and motion. Explained the basic concepts with examples from daily life.',
    source: 'lecture-log',
  },
  {
    id: 'log-002',
    date: '07 Sep 2026',
    batch: '9th Standard',
    subject: 'Physics',
    time: '11:00 AM - 12:00 PM',
    description:
      'Covered Newton’s first law and discussed inertia with classroom examples.',
    source: 'attendance',
  },
];

const listeners: Array<
  (logs: LectureLog[]) => void
> = [];

export function getLectureLogs(): LectureLog[] {
  return [...lectureLogs];
}

export function addLectureLog(
  log: LectureLog,
): void {
  lectureLogs = [
    log,
    ...lectureLogs,
  ];

  listeners.forEach((listener) => {
    listener([...lectureLogs]);
  });
}

export function subscribeToLectureLogs(
  listener: (
    logs: LectureLog[],
  ) => void,
): () => void {
  listeners.push(listener);

  listener([...lectureLogs]);

  return () => {
    const index =
      listeners.indexOf(listener);

    if (index !== -1) {
      listeners.splice(index, 1);
    }
  };
}