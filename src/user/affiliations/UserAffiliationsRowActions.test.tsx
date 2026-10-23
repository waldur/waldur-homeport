import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useModal } from '@/modal/actions';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { UserAffiliationsRowActions } from './UserAffiliationsRowActions';

const row = {
  uuid: 'perm-uuid',
  is_active: true,
  scope_type: 'customer',
  scope_uuid: 'scope-uuid',
  scope_name: 'Demo Organization',
  role_name: 'CUSTOMER.READER',
  user_uuid: 'target-uuid',
} as any;

describe('UserAffiliationsRowActions confirmation', () => {
  beforeEach(() => {
    vi.mocked(useUser).mockReturnValue({ is_staff: true } as any);
    vi.mocked(useModal().confirm).mockReturnValue(new Promise(() => {}));
  });

  it('asks to revoke with Cancel and a danger Confirm', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserAffiliationsRowActions row={row} fetch={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Revoke' }));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalledWith(
        'Revoke access',
        expect.stringContaining('CUSTOMER.READER'),
        expect.objectContaining({
          positiveButton: 'Confirm',
          negativeButton: 'Cancel',
          positiveButtonVariant: 'danger',
        }),
      );
    });
  });

  it('asks to restore with Cancel and a primary Confirm', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserAffiliationsRowActions
        row={{ ...row, is_active: false }}
        fetch={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Restore' }));

    await waitFor(() => {
      expect(useModal().confirm).toHaveBeenCalledWith(
        'Restore access',
        expect.stringContaining('CUSTOMER.READER'),
        expect.objectContaining({
          positiveButton: 'Confirm',
          negativeButton: 'Cancel',
          positiveButtonVariant: 'primary',
        }),
      );
    });
  });
});
