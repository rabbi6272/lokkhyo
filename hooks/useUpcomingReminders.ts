import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import {
  createUpcomingReminder,
  deleteUpcomingReminder,
  listUpcomingReminders,
  updateUpcomingReminder,
  type NewUpcomingReminder,
} from '@/services/UpcomingReminders';
import { syncAssessmentReminders } from '@/services/notifications/assessmentReminders';

export function useUpcomingReminders(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['upcomingReminders', courseId],
    queryFn: () => (user ? listUpcomingReminders(user.uid, courseId) : []),
    enabled: !!user && !!courseId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['upcomingReminders', courseId] });
    queryClient.invalidateQueries({ queryKey: ['allUpcomingReminders'] });
    queryClient.invalidateQueries({ queryKey: ['upcomingAssessmentReminders'] });
  };

  const sync = () => {
    if (user) void syncAssessmentReminders(user.uid);
  };

  const createMutation = useMutation({
    mutationFn: (data: NewUpcomingReminder) => {
      if (!user) throw new Error('Not authenticated');
      return createUpcomingReminder(user.uid, courseId, data);
    },
    onSuccess: () => {
      invalidate();
      sync();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewUpcomingReminder> }) => {
      if (!user) throw new Error('Not authenticated');
      return updateUpcomingReminder(user.uid, courseId, id, data);
    },
    onSuccess: () => {
      invalidate();
      sync();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reminderId: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteUpcomingReminder(user.uid, courseId, reminderId);
    },
    onSuccess: () => {
      invalidate();
      sync();
    },
  });

  return {
    reminders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createReminder: createMutation,
    updateReminder: updateMutation,
    deleteReminder: deleteMutation,
  };
}

/**
 * Course-agnostic delete (for the Routine screen, where reminders from every
 * course are listed together).
 */
export function useDeleteUpcomingReminder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, reminderId }: { courseId: string; reminderId: string }) => {
      if (!user) throw new Error('Not authenticated');
      return deleteUpcomingReminder(user.uid, courseId, reminderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingReminders'] });
      queryClient.invalidateQueries({ queryKey: ['allUpcomingReminders'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAssessmentReminders'] });
      if (user) void syncAssessmentReminders(user.uid);
    },
  });
}
