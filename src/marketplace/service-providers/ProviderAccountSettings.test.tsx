import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceServiceProvidersPartialUpdate } from 'waldur-js-client';

import { EditFieldDialog } from '@/form/EditFieldDialog';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';
import { renderWithProviders } from '@/test/harness';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

import { ProviderAccountSettings } from './ProviderAccountSettings';

vi.mock('@/workspace/selectors', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/workspace/selectors')>()),
  checkIsOwnerOrStaff: vi.fn(() => true),
}));

// A provider that sets none of its account options.
const mockServiceProvider = {
  uuid: 'sp-uuid',
  account_options: {},
} as any;

const renderSection = (accountOptions = {}, setServiceProvider = vi.fn()) =>
  renderWithProviders(
    <ProviderAccountSettings
      serviceProvider={{
        ...mockServiceProvider,
        account_options: accountOptions,
      }}
      setServiceProvider={setServiceProvider}
    />,
  );

const getEditDialogProps = async (
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) => {
  const { openDialog } = useModal();
  vi.mocked(openDialog).mockClear();
  await user.click(screen.getByTestId(`edit-account_options.${name}`));
  return vi.mocked(openDialog).mock.calls[0][1].resolve;
};

describe('ProviderAccountSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkIsOwnerOrStaff).mockReturnValue(true);
  });

  it('renders the provider-level account fields', () => {
    renderSection({ account_scope: 'provider' });

    expect(screen.getByText('Accounts')).toBeInTheDocument();
    expect(screen.getByText('Account scope')).toBeInTheDocument();
    expect(screen.getByText('Per service provider')).toBeInTheDocument();
    expect(screen.getByText('Username generation policy')).toBeInTheDocument();
    expect(screen.getByText('Home directory prefix')).toBeInTheDocument();
    expect(screen.getByText('Login shell')).toBeInTheDocument();
  });

  it('explains how offerings resolve account settings', () => {
    renderSection();

    expect(
      screen.getByText(/then the value here, then the built-in default/),
    ).toBeInTheDocument();
  });

  it('shows what unset provider options fall back to', () => {
    renderSection();

    for (const fallback of [
      'Per offering',
      'Service provider',
      '/home/',
      '/bin/bash',
    ]) {
      expect(
        screen.getByText(`Not set, offerings default to ${fallback}`),
      ).toBeInTheDocument();
    }
  });

  it('shows the anonymized prefix only for the anonymized policy', () => {
    const { unmount } = renderSection();
    expect(
      screen.queryByText('Anonymized username prefix'),
    ).not.toBeInTheDocument();
    unmount();

    renderSection({ username_generation_policy: 'anonymized' });
    expect(screen.getByText('Anonymized username prefix')).toBeInTheDocument();
  });

  it('hides edit actions from users who cannot update the provider', () => {
    vi.mocked(checkIsOwnerOrStaff).mockReturnValue(false);
    renderSection();

    expect(screen.getByRole('table')).toHaveClass('hide-actions');
  });

  it('saves a login shell as a single account option', async () => {
    const user = userEvent.setup();
    const setServiceProvider = vi.fn();
    const updated = {
      ...mockServiceProvider,
      account_options: { login_shell: '/bin/zsh' },
    };
    vi.mocked(marketplaceServiceProvidersPartialUpdate).mockResolvedValue({
      data: updated,
    } as any);
    renderSection({}, setServiceProvider);

    const resolve = await getEditDialogProps(user, 'login_shell');
    renderWithProviders(<EditFieldDialog resolve={resolve} />);

    const input = screen.getByPlaceholderText('/bin/bash');
    await user.type(input, '/bin/zsh');
    await user.click(screen.getByRole('button', { name: 'Confirm' }));

    // Only the edited key: the backend merges account options key by key.
    await waitFor(() =>
      expect(marketplaceServiceProvidersPartialUpdate).toHaveBeenCalledWith({
        path: { uuid: 'sp-uuid' },
        body: { account_options: { login_shell: '/bin/zsh' } },
      }),
    );
    expect(setServiceProvider).toHaveBeenCalledWith(updated);
  });

  it('submits a cleared select as blank, which removes the option', async () => {
    const user = userEvent.setup();
    renderSection({ username_generation_policy: 'anonymized' });

    const resolve = await getEditDialogProps(
      user,
      'username_generation_policy',
    );
    expect(resolve.fieldProps.parse(null)).toBe('');
  });

  it('surfaces the refusal to enable provider scope', async () => {
    const user = userEvent.setup();
    const error = {
      status: 400,
      account_options: {
        account_scope: [
          '2 user(s) hold different usernames on different offerings of this provider.',
        ],
      },
    };
    vi.mocked(marketplaceServiceProvidersPartialUpdate).mockRejectedValue(
      error,
    );
    const setServiceProvider = vi.fn();
    renderSection({}, setServiceProvider);

    const resolve = await getEditDialogProps(user, 'account_scope');
    await expect(
      resolve.callback({ account_options: { account_scope: 'provider' } }),
    ).rejects.toBe(error);

    expect(useNotify().showErrorResponse).toHaveBeenCalledWith(error);
    expect(setServiceProvider).not.toHaveBeenCalled();
  });
});
