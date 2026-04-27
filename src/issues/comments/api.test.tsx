import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  supportCommentsList,
  supportIssuesComment,
  supportCommentsUpdate,
  supportCommentsDestroy,
} from 'waldur-js-client';

import { showErrorResponse } from '@/store/notify';
import store from '@/store/store';

import {
  useIssueComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
} from './api';

// Mock waldur-js-client
vi.mock('waldur-js-client', () => ({
  supportCommentsList: vi.fn(),
  supportIssuesComment: vi.fn(),
  supportCommentsUpdate: vi.fn(),
  supportCommentsDestroy: vi.fn(),
}));

// Mock store notify
vi.mock('@/store/notify', () => ({
  showErrorResponse: vi.fn(() => ({ type: 'SHOW_ERROR' })),
}));

// Mock store
vi.mock('@/store/store', () => ({
  default: {
    dispatch: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const mockStore = configureStore();

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  const reduxStore = mockStore({});

  return ({ children }: { children: ReactNode }) => (
    <Provider store={reduxStore}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
};

const mockComments = [
  {
    uuid: 'comment-1',
    author_name: 'User A',
    description: 'First comment',
    created: '2024-01-15T10:00:00Z',
  },
  {
    uuid: 'comment-2',
    author_name: 'User B',
    description: 'Second comment',
    created: '2024-01-16T12:00:00Z',
  },
];

const mockIssue = {
  uuid: 'issue-123',
  url: 'https://api.example.com/issues/issue-123/',
};

describe('Issue Comments API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useIssueComments', () => {
    it('fetches comments and sorts by date descending', async () => {
      vi.mocked(supportCommentsList).mockResolvedValue({
        data: mockComments,
      } as any);

      const { result } = renderHook(() => useIssueComments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supportCommentsList).toHaveBeenCalledWith({
        query: { issue: mockIssue.url },
      });

      // Should be sorted by date descending (newest first)
      expect(result.current.data[0].uuid).toBe('comment-2');
      expect(result.current.data[1].uuid).toBe('comment-1');
    });

    it('does not fetch when issueUrl is empty', () => {
      renderHook(() => useIssueComments(''), {
        wrapper: createWrapper(),
      });

      expect(supportCommentsList).not.toHaveBeenCalled();
    });

    it('returns loading state initially', () => {
      vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

      const { result } = renderHook(() => useIssueComments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateComment', () => {
    it('creates a comment successfully', async () => {
      const newComment = { uuid: 'new-1', description: 'New comment' };
      vi.mocked(supportIssuesComment).mockResolvedValue({
        data: newComment,
      } as any);

      const { result } = renderHook(() => useCreateComment(mockIssue as any), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('New comment');
      });

      expect(supportIssuesComment).toHaveBeenCalledWith({
        path: { uuid: mockIssue.uuid },
        body: {
          is_public: true,
          description: 'New comment',
        },
      });
    });

    it('shows error on failure', async () => {
      const error = new Error('Network error');
      vi.mocked(supportIssuesComment).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateComment(mockIssue as any), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('New comment');
        } catch {
          // Expected to throw
        }
      });

      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to post comment.',
      );
      expect(store.dispatch).toHaveBeenCalled();
    });
  });

  describe('useUpdateComment', () => {
    it('updates a comment successfully', async () => {
      const updatedComment = { uuid: 'comment-1', description: 'Updated' };
      vi.mocked(supportCommentsUpdate).mockResolvedValue({
        data: updatedComment,
      } as any);

      const { result } = renderHook(() => useUpdateComment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          commentId: 'comment-1',
          description: 'Updated',
        });
      });

      expect(supportCommentsUpdate).toHaveBeenCalledWith({
        path: { uuid: 'comment-1' },
        body: {
          is_public: true,
          description: 'Updated',
        },
      });
    });

    it('shows error on failure', async () => {
      const error = new Error('Update failed');
      vi.mocked(supportCommentsUpdate).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateComment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({
            commentId: 'comment-1',
            description: 'Updated',
          });
        } catch {
          // Expected to throw
        }
      });

      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to edit comment.',
      );
    });
  });

  describe('useDeleteComment', () => {
    it('deletes a comment successfully', async () => {
      vi.mocked(supportCommentsDestroy).mockResolvedValue({} as any);

      const { result } = renderHook(() => useDeleteComment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync('comment-1');
      });

      expect(supportCommentsDestroy).toHaveBeenCalledWith({
        path: { uuid: 'comment-1' },
      });
    });

    it('shows error on failure', async () => {
      const error = new Error('Delete failed');
      vi.mocked(supportCommentsDestroy).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteComment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        try {
          await result.current.mutateAsync('comment-1');
        } catch {
          // Expected to throw
        }
      });

      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to delete comment.',
      );
    });
  });
});
