import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceServiceProvidersGlauthTreeRetrieve,
  marketplaceServiceProvidersGlauthUsersConfigRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ProviderDirectory } from './ProviderDirectory';

vi.mock('@/form/MonacoEditor', () => ({
  MonacoEditor: ({ value }) => <pre>{value}</pre>,
}));
vi.mock('@/marketplace/offerings/update/integration/GLAuthTreeView', () => ({
  GLAuthTreeView: () => null,
}));

const provider = {
  uuid: 'provider-uuid',
  customer_name: 'HPC provider',
  customer_slug: 'hpc',
} as any;

const tree = {
  offerings: [
    { uuid: 'a', name: 'Cluster A', slug: 'a' },
    { uuid: 'b', name: 'Cluster B', slug: 'b' },
  ],
  groups: [],
  users: [],
  robot_accounts: [],
  warnings: [],
};

const mockDirectory = (overrides = {}) => {
  vi.mocked(
    marketplaceServiceProvidersGlauthUsersConfigRetrieve,
  ).mockResolvedValue({ data: '[[groups]]\nname = "hpc_9001"\n' } as any);
  vi.mocked(marketplaceServiceProvidersGlauthTreeRetrieve).mockResolvedValue({
    data: { ...tree, ...overrides },
  } as any);
};

describe('ProviderDirectory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('names the offerings the directory covers', async () => {
    mockDirectory();
    renderWithProviders(<ProviderDirectory provider={provider} />);

    expect(
      await screen.findByText(
        /offerings that share accounts: Cluster A, Cluster B/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/name = "hpc_9001"/)).toBeInTheDocument();
  });

  it('shows what the offerings disagree on', async () => {
    mockDirectory({
      warnings: ['The offerings set different shared user passwords.'],
    });
    renderWithProviders(<ProviderDirectory provider={provider} />);

    expect(
      await screen.findByText(
        'The offerings set different shared user passwords.',
      ),
    ).toBeInTheDocument();
  });

  it('explains an empty directory', async () => {
    mockDirectory({ offerings: [] });
    renderWithProviders(<ProviderDirectory provider={provider} />);

    expect(
      await screen.findByText(/No offering of this service provider shares/),
    ).toBeInTheDocument();
  });
});
