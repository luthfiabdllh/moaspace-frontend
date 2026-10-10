'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { programKeys } from './query-keys';
import type {
  CreateProgramDTO,
  UpdateProgramDTO,
  ReviewProgramDTO,
  ProgramItem,
} from '../types';

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as AxiosErrorLike;
  if (err?.response?.data?.message && typeof err.response.data.message === 'string') {
    return err.response.data.message;
  }
  return fallback;
}

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateProgramDTO): Promise<ProgramItem> => {
      const { data } = await apiClient.post<ProgramItem>('/programs', payload);
      return data;
    },
    onSuccess: (newProg) => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success(`Program kerja "${newProg.title}" berhasil diajukan.`);
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengajukan program kerja.'));
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateProgramDTO;
    }): Promise<ProgramItem> => {
      const { data } = await apiClient.patch<ProgramItem>(`/programs/${id}`, payload);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      toast.success('Program kerja berhasil diperbarui.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Gagal memperbarui program kerja.'));
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success('Program kerja berhasil dihapus.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Gagal menghapus program kerja.'));
    },
  });
};

export const useReviewProgramCluster = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewProgramDTO;
    }): Promise<ProgramItem> => {
      const { data } = await apiClient.post<ProgramItem>(
        `/programs/${id}/review/cluster`,
        payload,
      );
      return data;
    },
    onSuccess: (_, { id, payload }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      toast.success(
        payload.decision === 'APPROVED'
          ? 'Persetujuan aspek keilmuan berhasil diberikan.'
          : 'Catatan penolakan aspek keilmuan berhasil dikirim.',
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Gagal mereview aspek keilmuan program kerja.'),
      );
    },
  });
};

export const useReviewProgramGovernance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewProgramDTO;
    }): Promise<ProgramItem> => {
      const { data } = await apiClient.post<ProgramItem>(
        `/programs/${id}/review/governance`,
        payload,
      );
      return data;
    },
    onSuccess: (_, { id, payload }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      queryClient.invalidateQueries({ queryKey: programKeys.detail(id) });
      toast.success(
        payload.decision === 'APPROVED'
          ? 'Persetujuan aspek tata kelola berhasil diberikan.'
          : 'Catatan penolakan aspek tata kelola berhasil dikirim.',
      );
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Gagal mereview tata kelola program kerja.'),
      );
    },
  });
};

export const useAddProgramMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      programId,
      userId,
      role,
    }: {
      programId: string;
      userId: string;
      role: 'CO_PIC' | 'MEMBER';
    }): Promise<ProgramItem> => {
      const { data } = await apiClient.post<ProgramItem>(
        `/programs/${programId}/members`,
        { userId, role },
      );
      return data;
    },
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success('Anggota tim pelaksana berhasil ditambahkan.');
    },
    onError: (error: unknown) => {
      toast.error(
        getApiErrorMessage(error, 'Gagal menambahkan anggota tim pelaksana.'),
      );
    },
  });
};

export const useRemoveProgramMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      programId,
      userId,
    }: {
      programId: string;
      userId: string;
    }): Promise<void> => {
      await apiClient.delete(`/programs/${programId}/members/${userId}`);
    },
    onSuccess: (_, { programId }) => {
      queryClient.invalidateQueries({ queryKey: programKeys.detail(programId) });
      queryClient.invalidateQueries({ queryKey: programKeys.all });
      toast.success('Anggota tim berhasil dikeluarkan.');
    },
    onError: (error: unknown) => {
      toast.error(getApiErrorMessage(error, 'Gagal mengeluarkan anggota tim.'));
    },
  });
};
