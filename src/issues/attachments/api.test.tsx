import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  supportAttachmentsList,
  supportAttachmentsCreate,
  supportAttachmentsDestroy,
} from 'waldur-js-client';

import { useNotify } from '@/store/notify';
import store from '@/store/store';

import {
  useIssueAttachments,
  useUploadAttachments,
  useDeleteAttachment,
} from './api';

// Mock waldur-js-client
vi.mock('waldur-js-client', () => ({
  supportAttachmentsList: vi.fn(),
  supportAttachmentsCreate: vi.fn(),
  supportAttachmentsDestroy: vi.fn(),
}));

// Mock store hooks
vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showError: vi.fn(),
    showErrorResponse: vi.fn(),
    showSuccess: vi.fn(),
  }),
}));

// Mock store
vi.mock('@/store/store', () => ({
  default: {
    dispatch: vi.fn(),
  },
}));

// Mock core/api
vi.mock('@/core/api', () => ({
  formDataOptions: { headers: { 'Content-Type': 'multipart/form-data' } },
}));

// Mock core/config
vi.mock('@/core/config', () => ({
  ENV: {
    excludedAttachmentTypes: ['.exe', '.bat'],
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

const mockAttachments = [
  {
    uuid: 'attachment-1',
    file_name: 'file1.pdf',
    file_size: 1024,
    created: '2024-01-15T10:00:00Z',
  },
  {
    uuid: 'attachment-2',
    file_name: 'file2.jpg',
    file_size: 2048,
    created: '2024-01-16T12:00:00Z',
  },
];

const mockIssue = {
  uuid: 'issue-123',
  url: 'https://api.example.com/issues/issue-123/',
};

describe('Issue Attachments API Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useIssueAttachments', () => {
    it('fetches attachments and sorts by date descending', async () => {
      vi.mocked(supportAttachmentsList).mockResolvedValue({
        data: mockAttachments,
      } as any);

      const { result } = renderHook(() => useIssueAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(supportAttachmentsList).toHaveBeenCalledWith({
        query: { issue: mockIssue.url },
      });

      // Should be sorted by date descending (newest first)
      expect(result.current.data[0].uuid).toBe('attachment-2');
      expect(result.current.data[1].uuid).toBe('attachment-1');
    });

    it('does not fetch when issueUrl is empty', () => {
      renderHook(() => useIssueAttachments(''), {
        wrapper: createWrapper(),
      });

      expect(supportAttachmentsList).not.toHaveBeenCalled();
    });

    it('returns loading state initially', () => {
      vi.mocked(supportAttachmentsList).mockResolvedValue({ data: [] } as any);

      const { result } = renderHook(() => useIssueAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useUploadAttachments', () => {
    it('uploads files successfully', async () => {
      vi.mocked(supportAttachmentsCreate).mockResolvedValue({
        data: { uuid: 'new-1', file_name: 'test.pdf' },
      } as any);

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const testFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      await act(async () => {
        await result.current.upload([testFile]);
      });

      expect(supportAttachmentsCreate).toHaveBeenCalledWith({
        body: { issue: mockIssue.url, file: testFile },
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });

    it('tracks uploading state', async () => {
      let resolveUpload: (value: any) => void;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });
      vi.mocked(supportAttachmentsCreate).mockReturnValue(uploadPromise as any);

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const testFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(testFile, 'size', { value: 12345 });

      act(() => {
        result.current.upload([testFile]);
      });

      // Should have file in uploading state
      await waitFor(() => {
        expect(result.current.uploading.length).toBe(1);
      });

      expect(result.current.uploading[0].file).toBe(testFile);

      // Resolve the upload
      await act(() => {
        resolveUpload({ data: { uuid: 'new-1' } });
      });

      // Should clear uploading state
      await waitFor(() => {
        expect(result.current.uploading.length).toBe(0);
      });
    });

    it('handles upload errors', async () => {
      const error = new Error('Upload failed');
      vi.mocked(supportAttachmentsCreate).mockRejectedValue(error);
      const { showErrorResponse } = useNotify();

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const testFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(testFile, 'size', { value: 12345 });

      await act(async () => {
        await result.current.upload([testFile]);
      });

      expect(showErrorResponse).toHaveBeenCalledWith(
        error,
        'Unable to upload attachment.',
      );
      expect(store.dispatch).not.toHaveBeenCalled(); // useNotify functions are self-dispatching
    });

    it('retries failed uploads', async () => {
      const error = new Error('Upload failed');
      vi.mocked(supportAttachmentsCreate)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ data: { uuid: 'new-1' } } as any);

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const testFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(testFile, 'size', { value: 12345 });

      // First upload fails
      await act(async () => {
        await result.current.upload([testFile]);
      });

      // Should have error state
      await waitFor(() => {
        expect(result.current.uploading[0]?.error).toBeTruthy();
      });

      // Retry the upload using the key
      const key = result.current.uploading[0].key;
      await act(() => {
        result.current.retry(key);
      });

      // Should succeed and clear
      await waitFor(() => {
        expect(result.current.uploading.length).toBe(0);
      });
    });

    it('cancels uploads', async () => {
      let resolveUpload: (value: any) => void;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });
      vi.mocked(supportAttachmentsCreate).mockReturnValue(uploadPromise as any);

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const testFile = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });
      Object.defineProperty(testFile, 'size', { value: 12345 });

      act(() => {
        result.current.upload([testFile]);
      });

      await waitFor(() => {
        expect(result.current.uploading.length).toBe(1);
      });

      // Cancel the upload using the key
      const key = result.current.uploading[0].key;
      act(() => {
        result.current.cancel(key);
      });

      expect(result.current.uploading.length).toBe(0);

      // Clean up the pending promise
      await act(() => {
        resolveUpload({ data: {} });
      });
    });

    it('rejects excluded file types', async () => {
      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });
      const { showError } = useNotify();

      const exeFile = new File(['content'], 'malware.exe', {
        type: 'application/x-msdownload',
      });

      await act(async () => {
        await result.current.upload([exeFile]);
      });

      expect(showError).toHaveBeenCalledWith(
        'File: malware.exe. \n Restricted, because of type.',
      );
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('uploads multiple files in parallel', async () => {
      vi.mocked(supportAttachmentsCreate).mockResolvedValue({
        data: { uuid: 'new-1' },
      } as any);

      const { result } = renderHook(() => useUploadAttachments(mockIssue.url), {
        wrapper: createWrapper(),
      });

      const file1 = new File(['content1'], 'file1.pdf', {
        type: 'application/pdf',
      });
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file1, 'size', { value: 100 });
      Object.defineProperty(file2, 'size', { value: 200 });

      await act(async () => {
        await result.current.upload([file1, file2]);
      });

      expect(supportAttachmentsCreate).toHaveBeenCalledTimes(2);
    });
  });

  describe('useDeleteAttachment', () => {
    it('deletes an attachment successfully', async () => {
      vi.mocked(supportAttachmentsDestroy).mockResolvedValue({} as any);

      const { result } = renderHook(() => useDeleteAttachment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.deleteAttachment('attachment-1');
      });

      await waitFor(() => {
        expect(supportAttachmentsDestroy).toHaveBeenCalledWith({
          path: { uuid: 'attachment-1' },
        });
      });
    });

    it('tracks deleting state', async () => {
      let resolveDelete: (value: any) => void;
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve;
      });
      vi.mocked(supportAttachmentsDestroy).mockReturnValue(
        deletePromise as any,
      );

      const { result } = renderHook(() => useDeleteAttachment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.deleteAttachment('attachment-1');
      });

      // Should be deleting
      await waitFor(() => {
        expect(result.current.isDeleting('attachment-1')).toBe(true);
      });

      // Resolve the delete
      await act(() => {
        resolveDelete({});
      });

      // Should clear deleting state
      await waitFor(() => {
        expect(result.current.isDeleting('attachment-1')).toBe(false);
      });
    });

    it('shows error on delete failure', async () => {
      const error = new Error('Delete failed');
      vi.mocked(supportAttachmentsDestroy).mockRejectedValue(error);
      const { showErrorResponse } = useNotify();

      const { result } = renderHook(() => useDeleteAttachment(mockIssue.url), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.deleteAttachment('attachment-1');
      });

      await waitFor(() => {
        expect(showErrorResponse).toHaveBeenCalledWith(
          error,
          'Unable to delete attachment.',
        );
      });
    });
  });
});
