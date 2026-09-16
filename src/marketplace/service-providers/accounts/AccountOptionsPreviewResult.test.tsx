import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { AccountOptionsPreviewResult } from './AccountOptionsPreviewResult';

// The renames list is a standard table; its rendering is covered elsewhere.
vi.mock('@/table/useTable', () => ({
  useTable: () => ({ rows: [], fetch: vi.fn() }),
}));
vi.mock('@/table/Table', () => ({
  default: () => <div data-testid="renames-table" />,
}));

const unchanged = (value: string) => ({
  before: { value, source: 'default' },
  after: { value, source: 'default' },
});

const offering = {
  uuid: 'offering-a',
  name: 'Cluster A',
  settings: {
    account_scope: unchanged('offering'),
    username_generation_policy: {
      before: { value: 'service_provider', source: 'default' },
      after: { value: 'waldur_username', source: 'provider' },
    },
    username_anonymized_prefix: unchanged('waldur_'),
    homedir_prefix: unchanged('/home/'),
    login_shell: unchanged('/bin/bash'),
  },
  changed: ['username_generation_policy'],
  example: {
    username: '<Waldur username>',
    home_directory: '/home/<Waldur username>',
    login_shell: '/bin/bash',
  },
  renames: [
    {
      username: 'old_name',
      new_username: 'jsmith',
      home_directory: '/home/old_name',
      new_home_directory: '/home/jsmith',
    },
  ],
  provider_accounts_kept: 0,
  accounts_keeping_home_or_shell: 0,
};

const preview = {
  account_options: {
    current: {},
    proposed: { username_generation_policy: 'waldur_username' },
  },
  offerings: [offering],
  renamed: 1,
  provider_accounts_kept: 0,
  accounts_keeping_home_or_shell: 0,
  username_conflicts: 0,
} as any;

describe('AccountOptionsPreviewResult', () => {
  it('shows the changed settings, the example and the renames', () => {
    renderWithProviders(<AccountOptionsPreviewResult preview={preview} />);

    expect(screen.getByText('Cluster A')).toBeInTheDocument();
    expect(screen.getByText(/Username generation policy/)).toBeInTheDocument();
    expect(screen.getByText('waldur_username')).toBeInTheDocument();
    expect(
      screen.getByText(/A new person would get <Waldur username>/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/1 offering account\(s\) renamed/),
    ).toBeInTheDocument();
    expect(screen.getByTestId('renames-table')).toBeInTheDocument();
  });

  it('warns that username conflicts block provider accounts', () => {
    renderWithProviders(
      <AccountOptionsPreviewResult
        preview={{ ...preview, username_conflicts: 2 }}
      />,
    );

    expect(
      screen.getByText(/2 person\(s\) have different usernames/),
    ).toBeInTheDocument();
  });

  it('says when an offering is not affected', () => {
    renderWithProviders(
      <AccountOptionsPreviewResult
        preview={{
          ...preview,
          renamed: 0,
          offerings: [{ ...offering, changed: [], renames: [] }],
        }}
      />,
    );

    expect(screen.getByText(/Nothing changes/)).toBeInTheDocument();
    expect(screen.queryByTestId('renames-table')).not.toBeInTheDocument();
  });
});
