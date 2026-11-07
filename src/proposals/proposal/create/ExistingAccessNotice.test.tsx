import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  marketplaceResourcesCount,
  proposalMyRequestedResourcesCount,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { renderWithProviders } from '@/test/harness';

import { ExistingAccessNotice } from './ExistingAccessNotice';

vi.mock('@/proposals/presentation', () => ({
  usesCallVocabulary: () => false,
}));

vi.mock('@/core/api', () => ({ fetchResultCount: vi.fn() }));

const counts = (requests: number, resources: number) => {
  vi.mocked(proposalMyRequestedResourcesCount).mockResolvedValue(
    'requests' as any,
  );
  vi.mocked(marketplaceResourcesCount).mockResolvedValue('resources' as any);
  vi.mocked(fetchResultCount).mockImplementation((result: any) =>
    result === 'requests' ? requests : resources,
  );
};

describe('ExistingAccessNotice', () => {
  beforeEach(() => vi.clearAllMocks());

  it('says nothing to a first request', async () => {
    counts(0, 0);
    renderWithProviders(<ExistingAccessNotice offeringUuid="o1" />);
    await vi.waitFor(() => expect(fetchResultCount).toHaveBeenCalledTimes(2));
    expect(screen.queryByText(/already/)).not.toBeInTheDocument();
  });

  it('warns about an open request for the offering', async () => {
    counts(1, 0);
    renderWithProviders(<ExistingAccessNotice offeringUuid="o2" />);
    expect(
      await screen.findByText('You already requested this offering'),
    ).toBeInTheDocument();
  });

  it('warns about a resource already held', async () => {
    counts(1, 2);
    renderWithProviders(<ExistingAccessNotice offeringUuid="o3" />);
    expect(
      await screen.findByText('You already have this offering'),
    ).toBeInTheDocument();
  });
});
