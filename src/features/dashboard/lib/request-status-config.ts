import type { RequestStatus } from '@/features/requests/types';

export const REQUEST_STATUS_BAR_CONFIG: { status: RequestStatus; label: string; bar: string }[] = [
  { status: 'WAITING_ORIGIN_APPROVAL', label: 'Menunggu Approval', bar: 'bg-amber-500' },
  { status: 'SUBMITTED', label: 'Diajukan', bar: 'bg-blue-500' },
  { status: 'NEED_INFO', label: 'Butuh Info', bar: 'bg-purple-500' },
  { status: 'ACCEPTED', label: 'Diterima', bar: 'bg-emerald-500' },
  { status: 'IN_PROGRESS', label: 'Dikerjakan', bar: 'bg-sky-500' },
  { status: 'DELIVERED', label: 'Dikirim', bar: 'bg-indigo-500' },
  { status: 'REVISION', label: 'Revisi', bar: 'bg-rose-500' },
];

// Non-terminal statuses — a request still moving through the workflow.
export const ACTIVE_REQUEST_STATUSES: RequestStatus[] = REQUEST_STATUS_BAR_CONFIG.map(
  (c) => c.status
);
