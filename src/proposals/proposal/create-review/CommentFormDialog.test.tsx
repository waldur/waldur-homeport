import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { CommentFormDialog } from './CommentFormDialog';

vi.mock('@/modal/actions', () => ({
  useModal: () => ({
    closeDialog: vi.fn(),
  }),
}));

describe('CommentFormDialog', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with title and initial value', () => {
    render(
      <CommentFormDialog
        resolve={{
          title: 'Test Feature',
          value: 'Initial Comment',
          onSubmit: mockOnSubmit,
        }}
      />,
    );

    expect(
      screen.getByText(/Comment about "Test Feature"/i),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('Initial Comment')).toBeInTheDocument();
  });

  it('renders correctly without title', () => {
    render(
      <CommentFormDialog
        resolve={{
          onSubmit: mockOnSubmit,
        }}
      />,
    );

    expect(screen.getByText('Add comment')).toBeInTheDocument();
  });

  it('submits correctly', async () => {
    const user = userEvent.setup();
    render(
      <CommentFormDialog
        resolve={{
          onSubmit: mockOnSubmit,
        }}
      />,
    );

    await user.type(
      screen.getByPlaceholderText('Enter a comment...'),
      'New Comment',
    );
    await user.click(screen.getByRole('button', { name: /Confirm/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ comment: 'New Comment' }),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  it('validates comment is required', () => {
    render(
      <CommentFormDialog
        resolve={{
          onSubmit: mockOnSubmit,
        }}
      />,
    );

    const submitBtn = screen.getByRole('button', { name: /Confirm/i });
    expect(submitBtn).toBeDisabled();
  });
});
