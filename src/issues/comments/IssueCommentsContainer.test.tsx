import { screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supportCommentsList } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { IssueCommentsContainer } from './IssueCommentsContainer';

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
  return renderWithProviders(<IssueCommentsContainer issue={issue as any} />);
};

describe('IssueCommentsContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    vi.mocked(supportCommentsList).mockReturnValue(
      new Promise(() => {}) as any,
    );

    renderComponent();

    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('renders comments list when data is loaded and sorts them', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({
      data: mockComments,
    } as any);

    renderComponent();

    expect(await screen.findByTestId('comments-list')).toBeInTheDocument();
    const items = screen.getAllByTestId('comment-item');
    expect(items).toHaveLength(2);
    // Should be sorted by date descending (newest first: c2)
    expect(items[0]).toHaveTextContent('Second comment');
    expect(items[1]).toHaveTextContent('First comment');
  });

  it('renders card with correct title', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    expect(await screen.findByText('Comments')).toBeInTheDocument();
  });

  it('renders add comment button', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    expect(await screen.findByTestId('add-comment-btn')).toBeInTheDocument();
  });

  it('renders reload button', async () => {
    vi.mocked(supportCommentsList).mockResolvedValue({ data: [] } as any);

    renderComponent();

    expect(await screen.findByTestId('reload-btn')).toBeInTheDocument();
  });
});
