import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { useIssueAttachments, useUploadAttachments } from './api';
import { IssueAttachmentsContainer } from './IssueAttachmentsContainer';

// Mock the API hooks
vi.mock('./api', () => ({
  useIssueAttachments: vi.fn(),
  useUploadAttachments: vi.fn(),
}));

// Mock the child components
vi.mock('@/marketplace/offerings/update/components/RefreshButton', () => ({
  RefreshButton: ({ loading }: { loading: boolean }) => (
    <button data-testid="reload-btn" disabled={loading}>
      Reload
    </button>
  ),
}));

vi.mock('./IssueAttachmentsList', () => ({
  IssueAttachmentsList: ({
    attachments,
    uploading,
  }: {
    attachments: any[];
    uploading: any[];
  }) => (
    <div data-testid="attachments-list">
      {attachments.map((a: any) => (
        <div key={a.uuid} data-testid="attachment-item">
          {a.file_name}
        </div>
      ))}
      {uploading.map((u: any) => (
        <div key={u.key} data-testid="uploading-item">
          {u.file.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/form/upload/UploadContainer', () => ({
  UploadContainer: ({
    onDrop,
    disabled,
  }: {
    onDrop: (files: File[]) => void;
    disabled: boolean;
  }) => (
    <button
      type="button"
      data-testid="upload-container"
      data-disabled={disabled}
      onClick={() =>
        onDrop([new File(['content'], 'test.pdf', { type: 'application/pdf' })])
      }
    >
      Drop files here
    </button>
  ),
}));

const mockIssue = {
  uuid: 'issue-123',
  url: 'https://api.example.com/issues/issue-123/',
  summary: 'Test Issue',
  add_attachment_is_available: true,
};

const mockAttachments = [
  { uuid: 'a1', file_name: 'file1.pdf', file_size: 1024 },
  { uuid: 'a2', file_name: 'file2.jpg', file_size: 2048 },
];

const mockUploadHook = {
  uploading: [],
  upload: vi.fn(),
  retry: vi.fn(),
  cancel: vi.fn(),
};

const renderComponent = (issue = mockIssue) => {
  return renderWithProviders(
    <IssueAttachmentsContainer issue={issue as any} />,
  );
};

describe('IssueAttachmentsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUploadAttachments).mockReturnValue(mockUploadHook);
  });

  it('renders loading spinner when loading with no data', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders attachments list when data is loaded', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: mockAttachments,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('attachments-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('attachment-item')).toHaveLength(2);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
  });

  it('renders card with correct title', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText('Attachments')).toBeInTheDocument();
  });

  it('renders upload container when add_attachment_is_available is true', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('upload-container')).toBeInTheDocument();
  });

  it('does not render upload container when add_attachment_is_available is false', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent({ ...mockIssue, add_attachment_is_available: false });

    expect(screen.queryByTestId('upload-container')).not.toBeInTheDocument();
  });

  it('renders reload button', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('reload-btn')).toBeInTheDocument();
  });

  it('shows cached data while refetching', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: mockAttachments,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    // Should show attachments, not loading spinner
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('attachments-list')).toBeInTheDocument();
  });

  it('calls upload when files are dropped', () => {
    const uploadFn = vi.fn();
    vi.mocked(useUploadAttachments).mockReturnValue({
      ...mockUploadHook,
      upload: uploadFn,
    });
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    fireEvent.click(screen.getByTestId('upload-container'));

    expect(uploadFn).toHaveBeenCalledWith([expect.any(File)]);
  });

  it('passes issueUrl to useIssueAttachments hook', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(useIssueAttachments).toHaveBeenCalledWith(mockIssue.url);
    expect(useUploadAttachments).toHaveBeenCalledWith(mockIssue.url);
  });

  it('displays uploading items', () => {
    const mockFile = new File(['content'], 'uploading.pdf');
    vi.mocked(useUploadAttachments).mockReturnValue({
      ...mockUploadHook,
      uploading: [{ key: 'key1', file: mockFile, progress: 50 }],
    });
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: mockAttachments,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('uploading-item')).toBeInTheDocument();
    expect(screen.getByText('uploading.pdf')).toBeInTheDocument();
  });

  it('disables upload container while loading', () => {
    vi.mocked(useIssueAttachments).mockReturnValue({
      data: mockAttachments,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('upload-container')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });
});
