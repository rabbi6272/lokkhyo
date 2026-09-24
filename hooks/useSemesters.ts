import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/providers/auth-provider';
import { activateSemester, createSemester, deleteSemester, listSemesters, updateSemester } from '@/services/Semesters';

export function useSemesters() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['semesters'],
    queryFn: () => (user ? listSemesters(user.uid) : []),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; targetGpa: number; startDate: string; totalWeeks: number }) => {
      if (!user) throw new Error('Not authenticated');
      return createSemester(user.uid, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parameters<typeof updateSemester>[2]> }) => {
      if (!user) throw new Error('Not authenticated');
      return updateSemester(user.uid, id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('Not authenticated');
      return deleteSemester(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => {
      if (!user) throw new Error('Not authenticated');
      return activateSemester(user.uid, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['semesters'] });
    },
  });

  return {
    semesters: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createSemester: createMutation,
    updateSemester: updateMutation,
    deleteSemester: deleteMutation,
    activateSemester: activateMutation,
  };
}
