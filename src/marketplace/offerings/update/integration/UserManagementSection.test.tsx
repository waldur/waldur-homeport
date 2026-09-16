import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useCurrentStateAndParams, useRouter } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { marketplaceProviderOfferingsUpdateIntegration } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { renderWithProviders } from '@/test/harness';

import { useOfferingAccountContext } from './useOfferingAccountContext';
import { DefaultUserManagementSection } from './UserManagementSection';

vi.mock('./GLAuthConfigButton', () => ({
  GLAuthConfigButton: () => null,
}));

// The harness has no router; a Link only needs to show its label here.
vi.mock('@/core/Link', () => ({
  Link: ({ label, children }) => <span>{children ?? label}</span>,
}));

vi.mock('./useOfferingAccountContext', () => ({
  useOfferingAccountContext: vi.fn(),
}));

vi.mock('@/features/connect', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/features/connect')>()),
  isFeatureVisible: vi.fn(() => false),
}));

// A setting the offering does not set: it inherits what it resolves to.
const inheritedSetting = (value: string, source: string) => ({
  value,
  source,
  inherited: { value, source },
});

const inheritedOffering = {
  uuid: 'offering-uuid',
  customer_uuid: 'customer-uuid',
  type: 'Marketplace.Slurm',
  plugin_options: {
    service_provider_can_create_offering_user: true,
    homedir_prefix: '/scratch/',
  },
  secret_options: {},
  account_settings: {
    account_scope: inheritedSetting('provider', 'provider'),
    username_generation_policy: inheritedSetting('anonymized', 'provider'),
    username_anonymized_prefix: inheritedSetting('waldur_', 'default'),
    // The offering's own prefix; the provider sets none.
    homedir_prefix: {
      value: '/scratch/',
      source: 'offering',
      inherited: { value: '/home/', source: 'default' },
    },
    login_shell: inheritedSetting('/bin/bash', 'default'),
  },
} as any;

const accountContext = {
  sharingOfferings: [
    { uuid: 'offering-uuid', name: 'Cluster A' },
    { uuid: 'other-offering-uuid', name: 'Cluster B' },
  ],
  pool: {
    uuid: 'pool-uuid',
    service_provider: 'provider-uuid',
    offering: null,
    min_uid: 9000,
    max_uid: 9019,
    uid_used: 3,
    min_gid: 9000,
    max_gid: 9019,
    gid_used: 3,
  },
} as any;

// The active tab is read from the `section` URL parameter.
const renderSection = (section: string, offering = inheritedOffering) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    state: { name: 'marketplace-offering-update' },
    params: { section },
  } as any);
  return renderWithProviders(
    <DefaultUserManagementSection offering={offering} refetch={vi.fn()} />,
  );
};

// The offering sets ``key`` itself; it keeps inheriting what it did before.
const withSetting = (key: string, value: string, source: string) => ({
  ...inheritedOffering,
  account_settings: {
    ...inheritedOffering.account_settings,
    [key]: {
      value,
      source,
      inherited: inheritedOffering.account_settings[key].inherited,
    },
  },
});

describe('DefaultUserManagementSection account settings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({
      stateService: { go: vi.fn() },
    } as any);
    vi.mocked(useOfferingAccountContext).mockReturnValue(accountContext);
  });

  it('groups the settings into searchable tabs', () => {
    renderSection('offering-users');

    for (const name of ['Offering users', 'Accounts', 'POSIX', 'GLAuth']) {
      expect(screen.getByRole('tab', { name })).toBeInTheDocument();
    }
    expect(screen.getByText('Shared user password')).toBeInTheDocument();
  });

  it('hides the GLAuth tab when POSIX accounts are not managed', () => {
    renderSection('offering-users', {
      ...inheritedOffering,
      plugin_options: {
        ...inheritedOffering.plugin_options,
        enable_posix_account: false,
      },
    });

    expect(
      screen.queryByRole('tab', { name: 'GLAuth' }),
    ).not.toBeInTheDocument();
  });

  it('shows the effective value and where it is inherited from', () => {
    renderSection('accounts');

    expect(screen.getByText('Per service provider')).toBeInTheDocument();
    expect(screen.getByText('Anonymized')).toBeInTheDocument();
    expect(screen.getAllByText('Inherited from service provider')).toHaveLength(
      2,
    );
    // The anonymized prefix.
    expect(screen.getAllByText('Default')).toHaveLength(1);
  });

  it('names the other offerings that share accounts', () => {
    renderSection('accounts');

    expect(screen.getByText('Shared with')).toBeInTheDocument();
    expect(screen.getByText('Cluster B')).toBeInTheDocument();
    expect(screen.getByText('Provider account settings')).toBeInTheDocument();
  });

  it('says per-offering accounts are not shared', () => {
    renderSection(
      'accounts',
      withSetting('account_scope', 'offering', 'offering'),
    );

    expect(
      screen.getByText('Not shared: this offering holds its own accounts'),
    ).toBeInTheDocument();
  });

  it('shows the anonymized prefix for an inherited anonymized policy', () => {
    renderSection('accounts');

    // The offering sets no username_generation_policy of its own.
    expect(screen.getByText('Username anonymized prefix')).toBeInTheDocument();
    expect(screen.getByText('waldur_')).toBeInTheDocument();
  });

  it('hides the anonymized prefix when the effective policy is different', () => {
    renderSection(
      'accounts',
      withSetting('username_generation_policy', 'full_name', 'offering'),
    );

    expect(
      screen.queryByText('Username anonymized prefix'),
    ).not.toBeInTheDocument();
  });

  it('names the provider value a reset leads to', () => {
    renderSection(
      'accounts',
      withSetting('username_generation_policy', 'full_name', 'offering'),
    );

    expect(
      screen.getByRole('button', {
        name: 'Use provider setting (Anonymized)',
      }),
    ).toBeInTheDocument();
  });

  it('shows the POSIX ID pool the accounts draw from', () => {
    renderSection('posix');

    expect(
      screen.getByText('UIDs 9000–9019 (3 used) · GIDs 9000–9019 (3 used)'),
    ).toBeInTheDocument();
    expect(screen.getByText('Service provider pool')).toBeInTheDocument();
    // UID source, primary GID source and login shell.
    expect(screen.getAllByText('Default')).toHaveLength(3);
  });

  it('warns when no POSIX ID pool exists', () => {
    vi.mocked(useOfferingAccountContext).mockReturnValue({
      ...accountContext,
      pool: null,
    });
    renderSection('posix');

    expect(screen.getByText(/^No POSIX ID pool/)).toBeInTheDocument();
  });

  it('clears an offering override so the setting is inherited again', async () => {
    const user = userEvent.setup();
    vi.mocked(marketplaceProviderOfferingsUpdateIntegration).mockResolvedValue({
      data: {},
    } as any);
    renderSection('posix');

    // Only the home directory prefix is set by the offering itself, and the
    // provider sets none, so clearing it falls back to the built-in default.
    const resetButtons = screen.getAllByRole('button', { name: /^Use / });
    expect(resetButtons).toHaveLength(1);
    expect(resetButtons[0]).toHaveTextContent('Use default (/home/)');
    await user.click(resetButtons[0]);

    await waitFor(() =>
      expect(
        marketplaceProviderOfferingsUpdateIntegration,
      ).toHaveBeenCalledWith({
        path: { uuid: 'offering-uuid' },
        body: { plugin_options: { homedir_prefix: '' } },
      }),
    );
  });

  it('does not offer to clear naming settings when users are not managed', () => {
    renderSection('posix', {
      ...inheritedOffering,
      plugin_options: {
        ...inheritedOffering.plugin_options,
        service_provider_can_create_offering_user: false,
      },
    });

    expect(
      screen.queryByRole('button', { name: /^Use / }),
    ).not.toBeInTheDocument();
  });

  it('links to the pools page only where it is enabled', () => {
    const { unmount } = renderSection('posix');
    // The pool is still shown; only the link to a disabled page is not.
    expect(screen.getByText('Service provider pool')).toBeInTheDocument();
    expect(screen.queryByText('Manage pools')).not.toBeInTheDocument();
    unmount();

    vi.mocked(isFeatureVisible).mockReturnValue(true);
    renderSection('posix');
    expect(screen.getByText('Manage pools')).toBeInTheDocument();
  });
});
