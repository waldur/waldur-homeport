import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useIssueComments } from './api';
import { IssueCommentsContainer } from './IssueCommentsContainer';

// Mock the API hook
vi.mock('./api', () => ({
  useIssueComments: vi.fn(),
}));

// Mock the child components
vi.mock('./IssueCommentButton', () => ({
  IssueCommentButton: () => <button data-testid="add-comment-btn">Add</button>,
}));

vi.mock(
  '@waldur/marketplace/offerings/update/components/RefreshButton',
  () => ({
    RefreshButton: ({ loading }: { loading: boolean }) => (
      <button data-testid="reload-btn" disabled={loading}>
        Reload
      </button>
    ),
  }),
);

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

vi.mock('@waldur/core/LoadingSpinner', () => ({
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
  { uuid: 'c1', author_name: 'User A', description: 'First comment' },
  { uuid: 'c2', author_name: 'User B', description: 'Second comment' },
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
    vi.mocked(useIssueComments).mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders comments list when data is loaded', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: mockComments,
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('comments-list')).toBeInTheDocument();
    expect(screen.getAllByTestId('comment-item')).toHaveLength(2);
    expect(screen.getByText('First comment')).toBeInTheDocument();
    expect(screen.getByText('Second comment')).toBeInTheDocument();
  });

  it('renders card with correct title', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('renders add comment button', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('add-comment-btn')).toBeInTheDocument();
  });

  it('renders reload button', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(screen.getByTestId('reload-btn')).toBeInTheDocument();
  });

  it('shows cached data while refetching', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: mockComments,
      isLoading: true,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    // Should show comments, not loading spinner
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    expect(screen.getByTestId('comments-list')).toBeInTheDocument();
  });

  it('passes issueUrl to useIssueComments hook', () => {
    vi.mocked(useIssueComments).mockReturnValue({
      data: [],
      isLoading: false,
      refetch: vi.fn(),
    } as any);

    renderComponent();

    expect(useIssueComments).toHaveBeenCalledWith(mockIssue.url);
  });
});
