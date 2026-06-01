import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportCommentsUpdate, supportIssuesComment } from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { CommentFormDialog } from './CommentFormDialog';

const renderComponent = (props) => {
  return renderWithProviders(<CommentFormDialog {...props} />);
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
  const user = userEvent.setup();

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

  it('validates required description', async () => {
    renderComponent({ resolve: { issue: mockIssue } });

    const input = screen.getByRole('textbox');
    await user.clear(input);

    await user.tab();

    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(submitBtn).toBeDisabled();
  });

  it('calls supportIssuesComment on creation', async () => {
    vi.mocked(supportIssuesComment).mockResolvedValue({ data: {} } as any);
    renderComponent({ resolve: { issue: mockIssue } });

    const input = screen.getByRole('textbox');
    await user.clear(input);
    await user.type(input, 'New comment');

    const submitBtn = screen.getByText('Confirm');
    await user.click(submitBtn);

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
    await user.clear(input);
    await user.type(input, 'Updated comment');

    const submitBtn = screen.getByText('Confirm');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(supportCommentsUpdate).toHaveBeenCalledWith({
        path: { uuid: mockComment.uuid },
        body: { is_public: true, description: 'Updated comment' },
      });
    });
  });

  it('submit button is disabled when pristine', () => {
    renderComponent({ resolve: { comment: mockComment, issue: mockIssue } });
    const submitBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(submitBtn).toBeDisabled();
  });
});
