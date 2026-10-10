import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateTask } from '../api/use-mutations';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCreateTask mutation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );

  it('includes storyPoints and override in API payload', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { id: 'task-1', title: 'Task Test' },
    });

    const { result } = renderHook(() => useCreateTask(), { wrapper });

    await result.current.mutateAsync({
      storyId: 'story-123',
      title: 'Task Test',
      storyPoints: 5,
      override: true,
      priority: 'HIGH',
      status: 'BACKLOG',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/tasks', {
      storyId: 'story-123',
      title: 'Task Test',
      status: 'BACKLOG',
      priority: 'HIGH',
      storyPoints: 5,
      override: true,
      isBlocked: false,
      assigneeId: undefined,
      description: undefined,
      dueDate: undefined,
      blockedReason: undefined,
    });
  });
});
