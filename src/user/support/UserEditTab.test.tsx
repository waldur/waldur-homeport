import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usersPartialUpdate } from 'waldur-js-client';

import { ImpersonationStorage } from '@/core/StorageManager';
import { renderWithProviders } from '@/test/harness';
import { useUser } from '@/workspace/hooks';

import { UserEditTab } from './UserEditTab';

vi.mock('@/invitations/join-organization/submission', () => ({
  useRequestToAccessOrganization: () => ({ request: vi.fn() }),
}));

vi.mock('@/core/StorageManager', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ImpersonationStorage: { get: vi.fn(), set: vi.fn(), remove: vi.fn() },
}));

vi.mock('./UserProfileTabs', () => ({
  UserProfileTabs: ({ disabled }) => (
    <div data-testid="profile-tabs" data-disabled={String(disabled)} />
  ),
}));

const user = { uuid: 'user-1', full_name: 'Jane Doe', agreement_date: null };

describe('UserEditTab Terms of Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ImpersonationStorage.get).mockReturnValue(null);
    vi.mocked(useUser).mockReturnValue(user as any);
  });

  it('lets users accept their own Terms and locks the profile until then', async () => {
    vi.mocked(usersPartialUpdate).mockResolvedValue({ data: user } as any);
    renderWithProviders(<UserEditTab user={user as any} />);

    expect(screen.getByTestId('profile-tabs')).toHaveAttribute(
      'data-disabled',
      'true',
    );
    await userEvent.setup().click(screen.getByTestId('tos-checkbox'));

    const body = vi.mocked(usersPartialUpdate).mock.calls[0][0].body as any;
    expect(body.agree_with_policy).toBe(true);
  });

  it('does not let impersonating staff accept the Terms for the user', () => {
    vi.mocked(ImpersonationStorage.get).mockReturnValue('user-1');
    renderWithProviders(<UserEditTab user={user as any} />);

    expect(screen.queryByTestId('tos-checkbox')).not.toBeInTheDocument();
    expect(
      screen.getByText('Pending: Terms and conditions not accepted'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('profile-tabs')).toHaveAttribute(
      'data-disabled',
      'false',
    );
  });
});
