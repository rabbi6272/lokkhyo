import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import { listCourses } from '@/services/Courses';
import { listUpcomingReminders } from '@/services/UpcomingReminders';
import type { UpcomingReminder } from '@/lib/types';

export type UpcomingReminderWithCourse = UpcomingReminder & {
  courseId: string;
  courseCode: string;
};

/**
 * All upcoming reminders across every course (for the Routine screen),
 * sorted by date ascending (invalidated alongside per-course queries).
 */
export function useAllUpcomingReminders() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['allUpcomingReminders', user?.uid],
    queryFn: async (): Promise<UpcomingReminderWithCourse[]> => {
      if (!user) return [];
      const courses = await listCourses(user.uid);
      const lists = await Promise.allSettled(
        courses.map((course) =>
          listUpcomingReminders(user.uid, course.id).then((reminders) =>
            reminders.map((r) => ({ ...r, courseId: course.id, courseCode: course.code })),
          ),
        ),
      );
      return lists
        .filter((r): r is PromiseFulfilledResult<UpcomingReminderWithCourse[]> => r.status === 'fulfilled')
        .flatMap((r) => r.value)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    enabled: !!user,
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
