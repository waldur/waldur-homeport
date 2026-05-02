import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supportCommentsList } from 'waldur-js-client';

import { IssueCommentsContainer } from './IssueCommentsContainer';

// Mock the API client
vi.mock('waldur-js-client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('waldur-js-client')>();
  return {
    ...actual,
    supportCommentsList: vi.fn(),
  };
});

// Mock the child components
vi.mock('./IssueCommentButton', () => ({
  IssueCommentButton: () => <button data-testid="add-comment-btn">Add</button>,
}));

vi.mock('@/marketplace/common/RefreshButton', () => ({
  RefreshButton: ({ isLoading }: { isLoading: boolean }) => (
    <button data-testid="reload-btn" disabled={isLoading}>
      Reload
    </button>
  ),
}));

vi.mock('./IssueCommentsList', () => ({
  IssueCommentsList: ({ comments }: { comments: any[] }) => (
    <div data-testid="comments-list">
      {comments.map((c: any) => (
        <div key={c.uuid} data-testid="comment-item">
          {c.description}
        </div>
      ))}
    </div>
  ),
}));

vi.mock('@/core/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
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

const mockIssue = {
  uuid: 'issue-123',
  url: 'https://api.example.com/issues/issue-123/',
  summary: 'Test Issue',
};

const mockComments = [
  {
    uuid: 'c1',
    author_name: 'User A',
    description: 'First comment',
    created: '2024-01-15T10:00:00Z',
  },
  {
    uuid: 'c2',
    author_name: 'User B',
    description: 'Second comment',
    created: '2024-01-16T12:00:00Z',
  },
];

const renderComponent = (issue = mockIssue) => {
  const queryClient = createTestQueryClient();
  const store = mockStore({});

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <IssueCommentsContainer issue={issue as any} />
      </QueryClientProvider>
    </Provider>,
  );
};

describe('IssueCommentsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    vi.mocked(supportCommentsList).mockReturnValue(new Promise(() => {}));

    renderComponent();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders comments list when data is loaded and sorts them', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({
      data: mockComments,
    } as any);

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId('comments-list')).toBeInTheDocument(),
    );
    const items = screen.getAllByTestId('comment-item');
    expect(items).toHaveLength(2);
    // Should be sorted by date descending (newest first: c2)
    expect(items[0]).toHaveTextContent('Second comment');
    expect(items[1]).toHaveTextContent('First comment');
  });

  it('renders card with correct title', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    await waitFor(() =>
      expect(screen.getByText('Comments')).toBeInTheDocument(),
    );
  });

  it('renders add comment button', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId('add-comment-btn')).toBeInTheDocument(),
    );
  });

  it('renders reload button', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    await waitFor(() =>
      expect(screen.getByTestId('reload-btn')).toBeInTheDocument(),
    );
  });
});
