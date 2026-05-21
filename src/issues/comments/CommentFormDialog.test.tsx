import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportCommentsUpdate, supportIssuesComment } from 'waldur-js-client';

import { CommentFormDialog } from './CommentFormDialog';

// Mock waldur-js-client
vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('waldur-js-client')>();
  return {
    ...actual,
    supportIssuesComment: vi.fn(),
    supportCommentsUpdate: vi.fn(),
  };
});

// Mock i18n
vi.mock('@/i18n', () => ({
  translate: (key) => key,
}));

// Mock modal hooks

// Mock notify
vi.mock('@/store/notify', () => ({
  useNotify: vi.fn().mockReturnValue({
    showErrorResponse: vi.fn(),
    showSuccess: vi.fn(),
  }),
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

const renderComponent = (props) => {
  const queryClient = createTestQueryClient();
  const store = mockStore({});

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CommentFormDialog {...props} />
      </QueryClientProvider>
    </Provider>,
  );
};

const mockIssue = {
  uuid: 'issue-123',
  url: 'https://api.example.com/issues/issue-123/',
};

const mockComment = {
  uuid: 'comment-1',
  description: 'Existing comment',
  issue: mockIssue.url,
};

describe('CommentFormDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Add comment" title when creating', () => {
    renderComponent({ resolve: { issue: mockIssue } });
    expect(screen.getByText('Add comment')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders "Change comment" title when editing', () => {
    renderComponent({ resolve: { comment: mockComment, issue: mockIssue } });
    expect(screen.getByText('Change comment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing comment')).toBeInTheDocument();
  });

  it('validates required description', () => {
    renderComponent({ resolve: { issue: mockIssue } });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    const submitBtn = screen.getByText('Confirm').closest('button');
    expect(submitBtn).toBeDisabled();
  });

  it('calls supportIssuesComment on creation', async () => {
    vi.mocked(supportIssuesComment).mockResolvedValue({ data: {} } as any);
    renderComponent({ resolve: { issue: mockIssue } });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New comment' } });

    const submitBtn = screen.getByText('Confirm');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supportIssuesComment).toHaveBeenCalledWith({
        path: { uuid: mockIssue.uuid },
        body: { is_public: true, description: 'New comment' },
      });
    });
  });

  it('calls supportCommentsUpdate on edit', async () => {
    vi.mocked(supportCommentsUpdate).mockResolvedValue({ data: {} } as any);
    renderComponent({ resolve: { comment: mockComment, issue: mockIssue } });

    const input = screen.getByDisplayValue('Existing comment');
    fireEvent.change(input, { target: { value: 'Updated comment' } });

    const submitBtn = screen.getByText('Confirm');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supportCommentsUpdate).toHaveBeenCalledWith({
        path: { uuid: mockComment.uuid },
        body: { is_public: true, description: 'Updated comment' },
      });
    });
  });

  it('submit button is disabled when pristine', () => {
    renderComponent({ resolve: { comment: mockComment, issue: mockIssue } });
    const submitBtn = screen.getByText('Confirm').closest('button');
    expect(submitBtn).toBeDisabled();
  });
});
