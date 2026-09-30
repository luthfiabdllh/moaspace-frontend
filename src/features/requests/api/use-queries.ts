import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { requestsKeys } from './query-keys';
import type { RequestListItem, RequestDetail, RequestTemplate } from '../types';

export function useRequests(filters: {
  direction?: 'incoming' | 'outgoing' | 'all';
  divisionId?: string;
  status?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: requestsKeys.list(filters),
    queryFn: async (): Promise<RequestListItem[]> => {
      const params = new URLSearchParams();
      if (filters.direction) params.append('direction', filters.direction);
      if (filters.divisionId) params.append('divisionId', filters.divisionId);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await axios.get(`/api/requests?${params.toString()}`);
      return res.data;
    },
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestsKeys.detail(id),
    queryFn: async (): Promise<RequestDetail> => {
      const res = await axios.get(`/api/requests/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}

export function useDivisionTemplates(divisionId?: string) {
  return useQuery({
    queryKey: requestsKeys.templates(divisionId || ''),
    queryFn: async (): Promise<RequestTemplate[]> => {
      if (!divisionId) return [];
      const res = await axios.get(`/api/divisions/${divisionId}/templates`);
      return res.data;
    },
    enabled: Boolean(divisionId),
  });
}

export function useTemplate(id?: string) {
  return useQuery({
    queryKey: requestsKeys.template(id || ''),
    queryFn: async (): Promise<RequestTemplate> => {
      const res = await axios.get(`/api/request-templates/${id}`);
      return res.data;
    },
    enabled: Boolean(id),
  });
}
