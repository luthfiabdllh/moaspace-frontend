import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { requestsKeys } from './query-keys';
import { storyKeys } from '@/features/stories/api/query-keys';
import type {
  CreateRequestDTO,
  UpdateRequestDTO,
  OriginApprovalDTO,
  TriageRequestDTO,
  RespondInfoDTO,
  ConvertToStoryDTO,
  DeliverRequestDTO,
  ConfirmRequestDTO,
} from '../types';

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRequestDTO) => {
      const res = await axios.post('/api/requests', data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.isDraft) {
        toast.success('Draft permohonan berhasil disimpan!');
      } else {
        toast.success('Permohonan kolaborasi berhasil diajukan!');
      }
      queryClient.invalidateQueries({ queryKey: requestsKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan/mengajukan permohonan.');
    },
  });
}

export function useApproveOrigin(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OriginApprovalDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}/origin-approval`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.action === 'APPROVE') {
        toast.success('Permohonan disetujui untuk diteruskan ke divisi tujuan!');
      } else {
        toast.info('Permohonan telah ditolak secara internal.');
      }
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal memproses persetujuan asal.');
    },
  });
}

export function useTriageRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TriageRequestDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}/triage`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.action === 'ACCEPT') {
        toast.success('Permohonan diterima!');
      } else if (variables.action === 'REJECT') {
        toast.info('Permohonan ditolak.');
      } else {
        toast.info('Permintaan informasi tambahan telah dikirim ke pemohon.');
      }
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal memproses triage.');
    },
  });
}

export function useRespondInfo(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RespondInfoDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}/respond-info`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Informasi tambahan berhasil dikirim ke divisi tujuan!');
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengirim informasi tambahan.');
    },
  });
}

export function useConvertToStory(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConvertToStoryDTO) => {
      const res = await axios.post(`/api/requests/${requestId}/convert-to-story`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Permohonan berhasil dikonversi menjadi Story di Kanban!');
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengonversi permohonan ke Story.');
    },
  });
}

export function useDeliverRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: DeliverRequestDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}/deliver`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Hasil pengerjaan berhasil dikirim ke pemohon!');
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengirim hasil kerja.');
    },
  });
}

export function useConfirmRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ConfirmRequestDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}/confirm`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      if (variables.action === 'CONFIRM') {
        toast.success('Hasil kerja telah dikonfirmasi selesai!');
      } else {
        toast.info('Permintaan revisi telah diajukan ke tim pengerja.');
      }
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: storyKeys.all });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengonfirmasi hasil.');
    },
  });
}

export function useUpdateDraft(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateRequestDTO) => {
      const res = await axios.patch(`/api/requests/${requestId}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Draft permohonan berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal memperbarui draft permohonan.');
    },
  });
}

export function useSubmitDraft(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/api/requests/${requestId}/submit-draft`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Draft permohonan berhasil diajukan!');
      queryClient.invalidateQueries({ queryKey: requestsKeys.detail(requestId) });
      queryClient.invalidateQueries({ queryKey: requestsKeys.lists() });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengajukan draft permohonan.');
    },
  });
}
