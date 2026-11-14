import { screen } from '@testing-library/react';
import { useCurrentStateAndParams } from '@uirouter/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openportalManagedProjectsRetrieveGet,
  openportalRemoteProjectsRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { ManagedProjectDetail } from './managed-projects/ManagedProjectDetail';
import { RemoteProjectDetail } from './remote-projects/RemoteProjectDetail';

vi.mock('./managed-projects/ManagedProjectAuditLog', () => ({
  ManagedProjectAuditLog: () => null,
}));
vi.mock('./managed-projects/ManagedProjectActions', () => ({
  ManagedProjectActions: () => null,
}));
vi.mock('./remote-projects/RemoteProjectAuditLog', () => ({
  RemoteProjectAuditLog: () => null,
}));
vi.mock('@/navigation/title', () => ({ useTitle: vi.fn() }));

const renderManaged = async (allowed_domains: string[] | null) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    params: { identifier: 'award-42', destination: 'portal.cluster' },
  } as any);
  vi.mocked(openportalManagedProjectsRetrieveGet).mockResolvedValue({
    data: {
      identifier: 'award-42',
      destination: 'portal.cluster',
      state: 'pending',
      details: { name: 'Award project', allowed_domains },
    },
  } as any);
  renderWithProviders(<ManagedProjectDetail />);
  await screen.findByRole('heading', { name: 'Award project' });
};

const renderRemote = async (allowed_domains: string[] | null) => {
  vi.mocked(useCurrentStateAndParams).mockReturnValue({
    params: { remoteProjectUuid: 'rp-1' },
  } as any);
  vi.mocked(openportalRemoteProjectsRetrieve).mockResolvedValue({
    data: {
      uuid: 'rp-1',
      current_project_name: 'Remote project',
      state: 'OK',
      allowed_domains,
    },
  } as any);
  renderWithProviders(<RemoteProjectDetail />);
  await screen.findByRole('heading', { name: 'Remote project' });
};

describe.each([
  ['managed project', renderManaged],
  ['remote project', renderRemote],
])('Allowed domains on the %s page', (_, renderPage) => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reads an empty list as nobody allowed', async () => {
    await renderPage([]);
    expect(screen.getByText('No domains allowed')).toBeInTheDocument();
    expect(screen.queryByText('All domains allowed')).not.toBeInTheDocument();
  });

  it('reads null as every domain allowed', async () => {
    await renderPage(null);
    expect(screen.getByText('All domains allowed')).toBeInTheDocument();
    expect(screen.queryByText('No domains allowed')).not.toBeInTheDocument();
  });

  it('lists the allowed domains', async () => {
    await renderPage(['*.example.org']);
    expect(screen.getByText('*.example.org')).toBeInTheDocument();
  });
});
