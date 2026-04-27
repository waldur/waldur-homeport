import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, expect, it, vi } from 'vitest';

import { RootState } from '@/store/reducers';

import { attachmentUploading } from './fixture';
import { IssueAttachmentsList } from './IssueAttachmentsList';

vi.mock('./IssueAttachment', () => ({
  IssueAttachment: ({ attachment }) => (
    <div data-testid="mocked-attachment">{attachment.file_name}</div>
  ),
}));

const mockAttachments = [
  { uuid: 'test-1', file_name: 'file1.pdf', file_size: 128 },
  { uuid: 'test-2', file_name: 'file2.jpg', file_size: 256 },
];

const initStore: Partial<RootState> = {};

const mockOnRetry = vi.fn();
const mockOnCancel = vi.fn();

const renderWithProvider = (component) => {
  const mockStore = configureStore();
  return render(<Provider store={mockStore(initStore)}>{component}</Provider>);
};

describe('IssueAttachmentsList', () => {
  it('renders nothing when no attachments and no uploads', () => {
    const { container } = renderWithProvider(
      <IssueAttachmentsList
        attachments={[]}
        uploading={[]}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders list of attachments', () => {
    renderWithProvider(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={[]}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByText('file1.pdf')).toBeInTheDocument();
    expect(screen.getByText('file2.jpg')).toBeInTheDocument();
  });

  it('renders pending attachment items for uploading files', () => {
    renderWithProvider(
      <IssueAttachmentsList
        attachments={[]}
        uploading={attachmentUploading}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.getAllByTestId('pending-attachment-item')).toHaveLength(2);
  });

  it('renders both attachments and uploading files', () => {
    renderWithProvider(
      <IssueAttachmentsList
        attachments={mockAttachments as any}
        uploading={attachmentUploading.slice(1)}
        onRetry={mockOnRetry}
        onCancel={mockOnCancel}
      />,
    );
    expect(screen.getAllByTestId('mocked-attachment')).toHaveLength(2);
    expect(screen.getByTestId('pending-attachment-item')).toBeInTheDocument();
  });
});
