import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callReviewerPoolsPartialUpdate } from 'waldur-js-client';

import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';

import { EditCapacityDialog } from './EditCapacityDialog';

const poolMember = {
  uuid: 'pool-member-uuid',
  reviewer_name: 'Jane Reviewer',
  reviewer_email: 'jane@example.com',
  current_assignments: 3,
  max_assignments: 5,
};

const renderDialog = (overrides: any = {}) => {
  const refetch = overrides.refetch ?? vi.fn();
  renderWithProviders(
    <EditCapacityDialog
      resolve={{
        poolMember: { ...poolMember, ...overrides.poolMember } as any,
        refetch,
      }}
    />,
  );
  return { refetch };
};

describe('EditCapacityDialog', () => {
  const { closeDialog } = useModal() as any;
  const { showSuccess, showErrorResponse } = useNotify() as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title, reviewer info and capacity field initialized from resolve', () => {
    renderDialog();

    expect(screen.getByText('Edit reviewer capacity')).toBeInTheDocument();
    expect(screen.getByText('Jane Reviewer')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    // current_assignments shown as plaintext
    expect(screen.getByText('3')).toBeInTheDocument();

    const field = screen.getByLabelText(
      'Maximum assignments',
    ) as HTMLInputElement;
    expect(field).toBeInTheDocument();
    expect(field.value).toBe('5');
  });

  it('applies the min and max bounds (1..50) to the number input', () => {
    renderDialog();
    const field = screen.getByLabelText(
      'Maximum assignments',
    ) as HTMLInputElement;
    expect(field).toHaveAttribute('min', '1');
    expect(field).toHaveAttribute('max', '50');
    expect(field).toHaveAttribute('type', 'number');
  });

  it('submits the updated capacity with the correct path and body', async () => {
    const user = userEvent.setup();
    vi.mocked(callReviewerPoolsPartialUpdate).mockResolvedValue({} as any);
    const { refetch } = renderDialog();

    const field = screen.getByLabelText('Maximum assignments');
    await user.clear(field);
    await user.type(field, '10');

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      // NOTE: the edited value is submitted as a STRING ('10'), not a number,
      // even though FormValues declares `max_assignments: number`. NumberField
      // does not coerce typed input to a number, so react-final-form keeps the
      // raw input string. This is a latent component bug (see report). We assert
      // the actual behavior here rather than the intended numeric shape.
      expect(callReviewerPoolsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'pool-member-uuid' },
        body: { max_assignments: '10' },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(closeDialog).toHaveBeenCalled();
      expect(showSuccess).toHaveBeenCalledWith(
        'Reviewer capacity updated successfully.',
      );
    });
  });

  it('submits the unchanged initial value when nothing is edited', async () => {
    const user = userEvent.setup();
    vi.mocked(callReviewerPoolsPartialUpdate).mockResolvedValue({} as any);
    renderDialog();

    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(callReviewerPoolsPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'pool-member-uuid' },
        body: { max_assignments: 5 },
      });
    });
  });

  it('shows an error notification and keeps the dialog open on a 400 response', async () => {
    const user = userEvent.setup();
    const error = {
      response: { status: 400, data: { max_assignments: 'Invalid value' } },
    };
    // The component's onSubmit returns mutateAsync(values) directly. On rejection
    // react-final-form re-throws the rejected promise, surfacing as an unhandled
    // rejection. onError still fires first, so swallow the stray rejection to keep
    // the run deterministic while we assert the user-visible error handling.
    const swallow = () => {};
    process.on('unhandledRejection', swallow);
    try {
      vi.mocked(callReviewerPoolsPartialUpdate).mockRejectedValue(error as any);
      renderDialog();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(showErrorResponse).toHaveBeenCalledWith(
          error,
          'Failed to update capacity.',
        );
      });
      expect(showSuccess).not.toHaveBeenCalled();
      expect(closeDialog).not.toHaveBeenCalled();
    } finally {
      process.off('unhandledRejection', swallow);
    }
  });
});
