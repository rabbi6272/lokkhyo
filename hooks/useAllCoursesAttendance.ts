import { useMemo } from 'react';
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import { useCourses } from '@/hooks/useCourses';
import { useRoutines } from '@/hooks/useRoutines';
import { useSemesters } from '@/hooks/useSemesters';
import { listAttendance, setAttendanceStatus } from '@/services/Attendance';
import {
  computeAttendanceStats,
  generateSessionOccurrences,
  mergeSessionsWithRecords,
  type AttendanceSession,
  type AttendanceStats,
} from '@/lib/attendance';
import type { AttendanceStatus, Course } from '@/lib/types';

export interface CourseAttendance {
  course: Course;
  sessions: AttendanceSession[];
  stats: AttendanceStats;
}

export interface DaySession {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  session: AttendanceSession;
}

/**
 * Loads and computes attendance across every course at once: per-course
 * stats, a date-indexed map of every course's sessions (for a unified
 * calendar), and an aggregate percent/at-risk count across all of them.
 */
export function useAllCoursesAttendance() {
  const { user } = useAuth();
  const { courses } = useCourses();
  const { slots } = useRoutines();
  const { semesters } = useSemesters();

  const attendanceQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['attendance', course.id],
      queryFn: () => (user ? listAttendance(user.uid, course.id) : []),
      enabled: !!user && !!course.id,
    })),
  });

  const isLoading = attendanceQueries.some((q) => q.isLoading);

  const courseAttendance: CourseAttendance[] = useMemo(() => {
    return courses.map((course, index) => {
      const semester = semesters.find((s) => s.id === course.semesterId);
      const courseSlots = slots.filter((s) => s.courseId === course.id);
      const records = attendanceQueries[index]?.data ?? [];
      const occurrences = semester?.startDate && semester.totalWeeks
        ? generateSessionOccurrences(courseSlots, semester.startDate, semester.totalWeeks)
        : [];
      const sessions = mergeSessionsWithRecords(occurrences, records);
      const stats = computeAttendanceStats(sessions);
      return { course, sessions, stats };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, semesters, slots, ...attendanceQueries.map((q) => q.data)]);

  const sessionsByDate = useMemo(() => {
    const map = new Map<string, DaySession[]>();
    courseAttendance.forEach(({ course, sessions }) => {
      sessions.forEach((session) => {
        const list = map.get(session.date) ?? [];
        list.push({ courseId: course.id, courseCode: course.code, courseTitle: course.title, session });
        map.set(session.date, list);
      });
    });
    return map;
  }, [courseAttendance]);

  const overall = useMemo(() => {
    const totals = courseAttendance.reduce(
      (acc, c) => {
        acc.present += c.stats.present;
        acc.absent += c.stats.absent;
        return acc;
      },
      { present: 0, absent: 0 },
    );
    const held = totals.present + totals.absent;
    const percent = held > 0 ? Math.round((totals.present / held) * 100) : 0;
    const atRiskCount = courseAttendance.filter((c) => c.stats.held > 0 && !c.stats.eligible).length;
    return { percent, held, atRiskCount };
  }, [courseAttendance]);

  return { courseAttendance, sessionsByDate, overall, isLoading };
}

/**
 * Sets an attendance status for a single session on any course, invalidating
 * that course's cached attendance so every screen reading it stays in sync.
 */
export function useMarkAttendance() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, date, slotId, status }: { courseId: string; date: string; slotId: string; status: AttendanceStatus }) => {
      if (!user) throw new Error('Not authenticated');
      return setAttendanceStatus(user.uid, courseId, date, slotId, status);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', vars.courseId] });
    },
  });
}
