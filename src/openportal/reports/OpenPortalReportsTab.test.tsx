import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  openportalOfferingMappingRetrieve,
  openportalUserMappingRetrieve,
} from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';
import { useProject } from '@/workspace/hooks';

import * as api from './api';
import { OpenPortalReportsTab } from './OpenPortalReportsTab';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';

// Only the two report fetchers are stubbed; the mapping helpers run for real
// against the mocked SDK, because the bug this file guards lives in how their
// responses are consumed.
vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof api>()),
  fetchUsageReports: vi.fn(),
  fetchStorageReports: vi.fn(),
}));

const RESOURCE = 'cluster-a.shared';
const USER_ID = 'alice.project-a.portal';

const usageItem: any = {
  id: 1,
  year: 2026,
  month: 8,
  project_identifier: 'project-a.portal',
  resource: RESOURCE,
  is_complete: true,
  report: {
    project: 'project-a.portal',
    users: { [USER_ID]: 'alice.project-a' },
    reports: {
      '2026-08-01': {
        is_complete: true,
        reports: { 'alice.project-a': { seconds: 3600 } },
      },
    },
  },
};

const storageItem: any = {
  id: 2,
  year: 2026,
  month: 8,
  project_identifier: 'project-a.portal',
  resource: RESOURCE,
  report: {
    project: 'project-a.portal',
    generated_at: '2026-08-31T00:00:00Z',
    project_quotas: { home: { limit: '1024.00 GB', usage: '24.00 KB' } },
    user_quotas: {
      [USER_ID]: { home: { limit: 'unlimited', usage: '1.00 GB' } },
    },
    users: { [USER_ID]: 'alice.project-a' },
  },
};

describe('OpenPortalReportsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(useProject).mockReturnValue({ uuid: 'proj-uuid' } as any);
    vi.mocked(api.fetchUsageReports).mockResolvedValue([
      ProjectUsageReport.fromApiResponse(usageItem),
    ]);
    vi.mocked(api.fetchStorageReports).mockResolvedValue([
      ProjectStorageReport.fromApiResponse(storageItem),
    ]);
  });

  it('renders the charts when every identifier resolves to a name', async () => {
    vi.mocked(openportalOfferingMappingRetrieve).mockResolvedValue({
      data: { [RESOURCE]: { uuid: 'o1', name: 'Shared cluster' } },
    } as any);
    vi.mocked(openportalUserMappingRetrieve).mockResolvedValue({
      data: { [USER_ID]: { full_name: 'Alice' } },
    } as any);

    renderWithProviders(<OpenPortalReportsTab />);

    await waitFor(() => expect(screen.getByText('Usage')).toBeInTheDocument());
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  // The mapping endpoints answer with null for any identifier they cannot
  // resolve — documented behaviour, and common at project level where a
  // report's resource may have no matching offering. A null must not take the
  // charts down with it.
  it('still renders the charts when an identifier maps to null', async () => {
    vi.mocked(openportalOfferingMappingRetrieve).mockResolvedValue({
      data: { [RESOURCE]: null },
    } as any);
    vi.mocked(openportalUserMappingRetrieve).mockResolvedValue({
      data: { [USER_ID]: null },
    } as any);

    renderWithProviders(<OpenPortalReportsTab />);

    await waitFor(() => expect(screen.getByText('Usage')).toBeInTheDocument());
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });

  // Names are decoration. If the lookup fails outright the report is still
  // worth showing against raw identifiers.
  it('still renders the charts when the mapping lookup fails', async () => {
    vi.mocked(openportalOfferingMappingRetrieve).mockRejectedValue(
      new Error('boom'),
    );
    vi.mocked(openportalUserMappingRetrieve).mockRejectedValue(
      new Error('boom'),
    );

    renderWithProviders(<OpenPortalReportsTab />);

    await waitFor(() => expect(screen.getByText('Usage')).toBeInTheDocument());
    expect(screen.getByText('Storage')).toBeInTheDocument();
  });
});
