import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import {
  createAssessment,
  deleteAssessment,
  listAssessments,
  updateAssessment,
  type NewAssessment,
} from '@/services/Assessments';
import { syncAssessmentReminders } from '@/services/notifications/assessmentReminders';

export function useAssessments(courseId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['assessments', courseId],
    queryFn: () => (user ? listAssessments(user.uid, courseId) : []),
    enabled: !!user && !!courseId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['assessments', courseId] });
  };

  const createMutation = useMutation({
    mutationFn: (data: NewAssessment) => {
      if (!user) throw new Error('Not authenticated');
      return createAssessment(user.uid, courseId, data);
    },
    onSuccess: () => {
      invalidate();
      if (user) void syncAssessmentReminders(user.uid);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewAssessment> }) => {
      if (!user) throw new Error('Not authenticated');
      return updateAssessment(user.uid, courseId, id, data);
    },
    onSuccess: () => {
      invalidate();
      if (user) void syncAssessmentReminders(user.uid);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (assessmentId: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteAssessment(user.uid, courseId, assessmentId);
    },
    onSuccess: () => {
      invalidate();
      if (user) void syncAssessmentReminders(user.uid);
    },
  });

  return {
    assessments: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createAssessment: createMutation,
    updateAssessment: updateMutation,
    deleteAssessment: deleteMutation,
  };
}
