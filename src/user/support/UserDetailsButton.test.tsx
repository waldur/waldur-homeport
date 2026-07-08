import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';

import { UserDetailsButton } from './UserDetailsButton';

const mockOpenDialog = vi.fn();

describe('UserDetailsButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      openDialog: mockOpenDialog,
      closeDialog: vi.fn(),
      confirm: vi.fn(),
    } as any);
  });

  // Guards the regression where the popup was handed the raw list row and
  // never re-fetched, leaving sparse-fieldset values (e.g. Organization
  // address) blank. It must open with the user_uuid so the dialog fetches the
  // full user, and pass the row as initialData for an instant first paint.
  it('opens the dialog with user_uuid and seeds it with the row', async () => {
    const row = { uuid: 'user-42', full_name: 'Jane Doe' };
    const user = userEvent.setup();

    renderWithProviders(<UserDetailsButton row={row as any} />);
    await user.click(screen.getByText('Details'));

    expect(mockOpenDialog).toHaveBeenCalledTimes(1);
    const options = mockOpenDialog.mock.calls[0][1];
    expect(options.resolve).toEqual({ user_uuid: 'user-42', user: row });
  });
});
