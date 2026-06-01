import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  supportAttachmentsList,
  supportAttachmentsCreate,
} from 'waldur-js-client';

import { createTestQueryClient, renderWithProviders } from '@/test/harness';

import { IssueAttachmentsContainer } from './IssueAttachmentsContainer';

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
  {
    uuid: 'a1',
    file_name: 'file1.pdf',
    file_size: 1024,
    file: 'https://example.com/file1.pdf',
    created: '2024-01-15T10:00:00Z',
  },
  {
    uuid: 'a2',
    file_name: 'file2.jpg',
    file_size: 2048,
    file: 'https://example.com/file2.jpg',
    created: '2024-01-16T12:00:00Z',
  },
];

const renderComponent = (issue = mockIssue) => {
  return renderWithProviders(
    <IssueAttachmentsContainer issue={issue as any} />,
  );
};

describe('IssueAttachmentsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    vi.mocked(supportAttachmentsList).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders attachments list when data is loaded', async () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({
      data: mockAttachments,
    } as any);

    renderComponent();

    expect(await screen.findByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders card with correct title', async () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent();

    expect(await screen.findByText('Attachments')).toBeInTheDocument();
  });

  it('renders upload container when add_attachment_is_available is true', async () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent();

    expect(await screen.findByTestId('upload-container')).toBeInTheDocument();
  });

  it('does not render upload container when add_attachment_is_available is false', async () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent({ ...mockIssue, add_attachment_is_available: false });

    await waitFor(() => {
      expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    });
    expect(screen.queryByTestId('upload-container')).not.toBeInTheDocument();
  });

  it('renders reload button', async () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({
      data: [],
    } as any);

    renderComponent();

    await screen.findByText('Attachments');
    const buttons = screen.getAllByRole('button');
    const reloadBtn = buttons.find(
      (btn) => btn.getAttribute('data-testid') !== 'upload-container',
    );
    expect(reloadBtn).toBeInTheDocument();
  });

  it('shows cached data while refetching', () => {
    vi.mocked(supportAttachmentsList).mockReturnValue(
      new Promise(() => {}) as any,
    );

    const queryClient = createTestQueryClient();
    queryClient.setQueryData(
      ['issueAttachments', mockIssue.url],
      mockAttachments,
    );

    renderWithProviders(
      <IssueAttachmentsContainer issue={mockIssue as any} />,
      { queryClient },
    );

    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
  });

  it('calls upload when files are dropped', async () => {
    const user = userEvent.setup();
    vi.mocked(supportAttachmentsList).mockResolvedValue({ data: [] } as any);
    vi.mocked(supportAttachmentsCreate).mockResolvedValue({
      data: { uuid: 'new-1', file_name: 'test.pdf' },
    } as any);

    renderComponent();

    await user.click(screen.getByTestId('upload-container'));

    expect(supportAttachmentsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { issue: mockIssue.url, file: expect.any(File) },
        headers: { 'Content-Type': null },
      }),
    );
  });

  it('passes issueUrl to supportAttachmentsList call', () => {
    vi.mocked(supportAttachmentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    expect(supportAttachmentsList).toHaveBeenCalledWith({
      query: { issue: mockIssue.url },
    });
  });

  it('displays uploading items', async () => {
    const user = userEvent.setup();
    vi.mocked(supportAttachmentsList).mockResolvedValue({ data: [] } as any);

    let resolveUpload;
    const uploadPromise = new Promise((resolve) => {
      resolveUpload = resolve;
    });
    vi.mocked(supportAttachmentsCreate).mockReturnValue(uploadPromise as any);

    renderComponent();

    await user.click(screen.getByTestId('upload-container'));

    expect(
      await screen.findByTestId('pending-attachment-item'),
    ).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();

    act(() => {
      resolveUpload({ data: { uuid: 'new-1', file_name: 'test.pdf' } });
    });

    await waitFor(() => {
      expect(
        screen.queryByTestId('pending-attachment-item'),
      ).not.toBeInTheDocument();
    });
  });

  it('disables upload container while loading', async () => {
    vi.mocked(supportAttachmentsList).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderComponent();

    expect(await screen.findByTestId('upload-container')).toHaveAttribute(
      'data-disabled',
      'true',
    );
  });
});
