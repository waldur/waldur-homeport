import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';

/**
 * `confirm` spreads its `ConfirmationOptions` into `resolve`, and this dialog
 * used to read only `title`, `body`, `deferred` and `iconNode` -- so the twelve
 * callers that pass `positiveButton` with `forDeletion: true` all rendered
 * "Delete": "Purge queue" among them, and every OpenStack action that removes
 * an interface from a router rather than deleting the router.
 *
 * `useManagedMutation.test.tsx` already passed a custom label through `confirm`,
 * but asserted only that the options arrived, never what was rendered. Hence
 * these, which look at the button.
 */
const renderDialog = (options = {}) => {
  const deferred = { resolve: vi.fn(), reject: vi.fn() };
  renderWithProviders(
    <DeleteConfirmationDialog
      resolve={{
        deferred,
        title: 'Remove router interface',
        body: 'Please select the port that you want to remove.',
        ...options,
      }}
    />,
  );
  return deferred;
};

describe('DeleteConfirmationDialog', () => {
  it('offers the label the caller asked for', () => {
    renderDialog({ positiveButton: 'Remove' });

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('names the operation, not the dialog: "Purge queue" stays "Purge queue"', () => {
    renderDialog({ positiveButton: 'Purge queue' });

    expect(
      screen.getByRole('button', { name: 'Purge queue' }),
    ).toBeInTheDocument();
  });

  it('falls back to Delete when no label is given', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('honours a custom negative label, and defaults it to Cancel', () => {
    const { unmount } = renderWithProviders(<div />);
    unmount();

    renderDialog({ negativeButton: 'Keep it' });
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument();
  });

  it('defaults the negative label to Cancel', () => {
    renderDialog();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('still resolves and rejects through those buttons', async () => {
    const deferred = renderDialog({ positiveButton: 'Remove' });

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(deferred.resolve).toHaveBeenCalled();
    expect(deferred.reject).not.toHaveBeenCalled();
  });

  it('rejects when the negative button is used', async () => {
    const deferred = renderDialog({ negativeButton: 'Keep it' });

    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(deferred.reject).toHaveBeenCalled();
    expect(deferred.resolve).not.toHaveBeenCalled();
  });
});
