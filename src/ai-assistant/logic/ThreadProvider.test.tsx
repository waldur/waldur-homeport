import { ThreadMessageLike } from '@assistant-ui/react';
import { act, renderHook } from '@testing-library/react';
import { FC, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ThreadProvider, useThreadContext } from './ThreadProvider';

vi.mock('@/workspace/hooks', () => ({
  useUser: () => ({ uuid: 'user-1', first_name: 'Test' }),
}));

const wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <ThreadProvider>{children}</ThreadProvider>
);

const seedThreadsWithMessage = (
  api: ReturnType<
    typeof renderHook<ReturnType<typeof useThreadContext>, unknown>
  >['result'],
  threadId: string,
  message: ThreadMessageLike,
) => {
  act(() => {
    api.current.setThreads((prev) => {
      const next = new Map(prev);
      next.set(threadId, [message]);
      return next;
    });
  });
};

describe('ThreadProvider.patchMessageByBackendUuid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('drops undefined keys and leaves existing metadata untouched', () => {
    const { result } = renderHook(() => useThreadContext(), { wrapper });

    const msg: ThreadMessageLike = {
      role: 'assistant',
      content: [{ type: 'text', text: 'hi' }],
      metadata: {
        custom: {
          backendUuid: 'uuid-1',
          feedback_score: false,
          feedback_submitted_at: '2026-04-19T10:00:00Z',
        },
      },
    };
    seedThreadsWithMessage(result, result.current.currentThreadId, msg);

    act(() => {
      result.current.patchMessageByBackendUuid('uuid-1', {
        feedback_score: true,
        feedback_submitted_at: undefined,
      });
    });

    const updated = result.current.threads.get(
      result.current.currentThreadId,
    )![0];
    const custom = updated.metadata!.custom as Record<string, unknown>;
    expect(custom.feedback_score).toBe(true);
    expect(custom.feedback_submitted_at).toBe('2026-04-19T10:00:00Z');
  });

  it('preserves null values (null means cleared, not missing)', () => {
    const { result } = renderHook(() => useThreadContext(), { wrapper });

    const msg: ThreadMessageLike = {
      role: 'assistant',
      content: [{ type: 'text', text: 'hi' }],
      metadata: {
        custom: {
          backendUuid: 'uuid-1',
          feedback_comment: 'old comment',
        },
      },
    };
    seedThreadsWithMessage(result, result.current.currentThreadId, msg);

    act(() => {
      result.current.patchMessageByBackendUuid('uuid-1', {
        feedback_comment: null,
      });
    });

    const updated = result.current.threads.get(
      result.current.currentThreadId,
    )![0];
    const custom = updated.metadata!.custom as Record<string, unknown>;
    expect(custom.feedback_comment).toBeNull();
  });

  it('is a no-op when every patch key is undefined', () => {
    const { result } = renderHook(() => useThreadContext(), { wrapper });

    const msg: ThreadMessageLike = {
      role: 'assistant',
      content: [{ type: 'text', text: 'hi' }],
      metadata: { custom: { backendUuid: 'uuid-1', feedback_score: true } },
    };
    seedThreadsWithMessage(result, result.current.currentThreadId, msg);

    const threadsBefore = result.current.threads;

    act(() => {
      result.current.patchMessageByBackendUuid('uuid-1', {
        feedback_score: undefined,
        feedback_comment: undefined,
      });
    });

    expect(result.current.threads).toBe(threadsBefore);
  });
});
