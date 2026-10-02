import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RequestStepper } from '../components/request-stepper';
import type { RequestDetail } from '../types';

const baseMockRequest: RequestDetail = {
  id: 'req-123',
  title: 'Desain Banner Acara Dies Natalis',
  status: 'SUBMITTED',
  fromDivisionId: 'div-1',
  fromDivisionName: 'Sponsorship',
  toDivisionId: 'div-2',
  toDivisionName: 'Media Kreatif',
  requesterId: 'usr-1',
  requesterName: 'Budi Santoso',
  brief: { format: 'Instagram Post' },
  deadline: '2026-10-15T00:00:00Z',
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
  permissions: {
    canSubmitDraft: false,
    canEditDraft: false,
    canApproveOrigin: false,
    canTriage: false,
    canRespondInfo: false,
    canConvertToStory: false,
    canDeliver: false,
    canConfirmOrRevise: false,
  },
  events: [
    {
      id: 'ev-1',
      fromStatus: 'DRAFT',
      toStatus: 'SUBMITTED',
      actorId: 'usr-1',
      actorName: 'Budi Santoso',
      note: 'Permohonan diajukan',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ],
};

describe('RequestStepper', () => {
  it('renders all 5 main stages of the lifecycle', () => {
    const scrollToSection = vi.fn();
    render(<RequestStepper request={baseMockRequest} scrollToSection={scrollToSection} />);

    expect(screen.getByText('Pengajuan')).toBeDefined();
    expect(screen.getByText('Triage & Review')).toBeDefined();
    expect(screen.getByText('Pengerjaan Kanban')).toBeDefined();
    expect(screen.getByText('Hasil & Revisi')).toBeDefined();
    expect(screen.getByText('Selesai')).toBeDefined();
  });

  it('triggers scrollToSection when clicking a step', () => {
    const scrollToSection = vi.fn();
    render(<RequestStepper request={baseMockRequest} scrollToSection={scrollToSection} />);

    const step3Button = screen.getByTitle('Lompat ke bagian Pengerjaan Kanban');
    fireEvent.click(step3Button);

    expect(scrollToSection).toHaveBeenCalledWith('section-story');
  });

  it('displays approval alert and CTA for WAITING_ORIGIN_APPROVAL status', () => {
    const onOpenOriginApproval = vi.fn();
    const req: RequestDetail = {
      ...baseMockRequest,
      status: 'WAITING_ORIGIN_APPROVAL',
      permissions: {
        ...baseMockRequest.permissions,
        canApproveOrigin: true,
      },
    };

    render(
      <RequestStepper
        request={req}
        scrollToSection={vi.fn()}
        onOpenOriginApproval={onOpenOriginApproval}
      />
    );

    expect(screen.getByText(/membutuhkan persetujuan koordinator divisi asal/i)).toBeDefined();
    const btn = screen.getByRole('button', { name: /beri persetujuan/i });
    fireEvent.click(btn);
    expect(onOpenOriginApproval).toHaveBeenCalled();
  });

  it('displays revision cycle badge and loop indicator when in REVISION status', () => {
    const onOpenDeliver = vi.fn();
    const req: RequestDetail = {
      ...baseMockRequest,
      status: 'REVISION',
      permissions: {
        ...baseMockRequest.permissions,
        canDeliver: true,
      },
      events: [
        ...baseMockRequest.events,
        {
          id: 'ev-rev-1',
          fromStatus: 'DELIVERED',
          toStatus: 'REVISION',
          actorId: 'usr-1',
          actorName: 'Budi Santoso',
          note: 'Warna background tolong disesuaikan',
          createdAt: '2026-10-02T00:00:00Z',
        },
      ],
    };

    render(
      <RequestStepper
        request={req}
        scrollToSection={vi.fn()}
        onOpenDeliver={onOpenDeliver}
      />
    );

    expect(screen.getByText(/siklus revisi: 1x/i)).toBeDefined();
    expect(screen.getByText(/revisi ke-1 sedang diproses/i)).toBeDefined();

    const deliverBtn = screen.getByRole('button', { name: /kirim ulang hasil/i });
    fireEvent.click(deliverBtn);
    expect(onOpenDeliver).toHaveBeenCalled();
  });

  it('displays completed state when request is CONFIRMED', () => {
    const req: RequestDetail = {
      ...baseMockRequest,
      status: 'CONFIRMED',
      events: [
        ...baseMockRequest.events,
        {
          id: 'ev-conf',
          fromStatus: 'DELIVERED',
          toStatus: 'CONFIRMED',
          actorId: 'usr-1',
          actorName: 'Budi Santoso',
          note: 'Sesuai ekspektasi, terima kasih!',
          createdAt: '2026-10-03T00:00:00Z',
        },
      ],
    };

    render(<RequestStepper request={req} scrollToSection={vi.fn()} />);

    expect(screen.getByText('Permohonan selesai')).toBeDefined();
    expect(screen.getByText('Tuntas')).toBeDefined();
  });

  it('displays draft action strip with edit and submit buttons when in DRAFT status', () => {
    const onOpenSubmitDraft = vi.fn();
    const onOpenEditDraft = vi.fn();
    const req: RequestDetail = {
      ...baseMockRequest,
      status: 'DRAFT',
      permissions: {
        ...baseMockRequest.permissions,
        canSubmitDraft: true,
        canEditDraft: true,
      },
    };

    render(
      <RequestStepper
        request={req}
        scrollToSection={vi.fn()}
        onOpenSubmitDraft={onOpenSubmitDraft}
        onOpenEditDraft={onOpenEditDraft}
      />
    );

    expect(screen.getByText(/permohonan ini masih berupa draft/i)).toBeDefined();
    const editBtn = screen.getByRole('button', { name: /edit draft/i });
    fireEvent.click(editBtn);
    expect(onOpenEditDraft).toHaveBeenCalled();

    const submitBtn = screen.getByRole('button', { name: /ajukan sekarang/i });
    fireEvent.click(submitBtn);
    expect(onOpenSubmitDraft).toHaveBeenCalled();
  });
});

