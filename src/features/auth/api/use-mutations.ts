'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { authKeys } from './query-keys';
import { toast } from 'sonner';
import type {
  LoginDTO,
  ActivateDTO,
  ForgotPasswordDTO,
  ResetPasswordDTO,
  GoogleAuthDTO,
  User,
  AuthResponse,
} from '../types';

// ─── Login ────────────────────────────────────────────────────────────────

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginDTO): Promise<AuthResponse> => {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return data;
    },
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        queryClient.setQueryData<User>(authKeys.currentUser(), response.data.user);
      }
    },
  });
};

// ─── Google SSO ───────────────────────────────────────────────────────────

export const useGoogleLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GoogleAuthDTO): Promise<AuthResponse> => {
      const { data } = await apiClient.post<AuthResponse>('/auth/google', payload);
      return data;
    },
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        queryClient.setQueryData<User>(authKeys.currentUser(), response.data.user);
      }
    },
  });
};

// ─── Logout ────────────────────────────────────────────────────────────────

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success('Anda berhasil keluar.');
      window.location.href = '/login';
    },
    onError: () => {
      toast.error('Gagal keluar. Silakan coba lagi.');
    },
  });
};

// ─── Activate Account ──────────────────────────────────────────────────────

export const useActivate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ActivateDTO): Promise<AuthResponse> => {
      const { data } = await apiClient.post<AuthResponse>('/auth/activate', payload);
      return data;
    },
    onSuccess: (response) => {
      if (response.success && response.data?.user) {
        queryClient.setQueryData<User>(authKeys.currentUser(), response.data.user);
        toast.success('Akun Anda berhasil diaktivasi!');
      }
    },
  });
};

// ─── Forgot Password ───────────────────────────────────────────────────────

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordDTO): Promise<{ success: boolean; message: string }> => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/forgot-password',
        payload
      );
      return data;
    },
  });
};

// ─── Reset Password ────────────────────────────────────────────────────────

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: ResetPasswordDTO): Promise<{ success: boolean; message: string }> => {
      const { data } = await apiClient.post<{ success: boolean; message: string }>(
        '/auth/reset-password',
        payload
      );
      return data;
    },
  });
};
