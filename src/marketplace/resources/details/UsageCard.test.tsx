import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as sdk from 'waldur-js-client';

import { renderWithProviders } from '@/test/harness';

import { getComponentsAndUsages } from '../usage/utils';

import { UsageCard } from './UsageCard';

// waldur-js-client is mocked globally (test/mocks/modal.js).

vi.mock('../usage/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../usage/utils')>()),
  getComponentsAndUsages: vi.fn(),
}));

vi.mock('../usage/UsageExportDropdown', () => ({
  UsageExportDropdown: () => null,
}));

const resource = {
  uuid: 'resource-uuid',
  name: 'Allocation',
  state: 'OK',
  created: '2026-01-15T10:00:00Z',
  is_usage_based: true,
  is_limit_based: false,
} as any;

const answer = (team: Promise<unknown>) => {
  vi.mocked(sdk.marketplaceResourcesTeamList).mockReturnValue(team as any);
  vi.mocked(getComponentsAndUsages).mockResolvedValue({
    components: [],
    usages: [],
    userUsages: [],
  } as any);
};

const httpError = (status: number) => ({ status, response: { status } });

const renderCard = async () => {
  renderWithProviders(<UsageCard resource={resource} />);
  // The usage query has settled once the card body leaves its spinner.
  await screen.findByText('Offering does not have any usage-based components.');
};

describe('UsageCard', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it.each([403, 404])(
    'shows no error when the team route answers %s',
    async (status) => {
      // A role only on a resource project, or a site-wide role, may see the
      // resource's usage but not list its project's members.
      answer(Promise.reject(httpError(status)));

      await renderCard();
      await waitFor(() =>
        expect(sdk.marketplaceResourcesTeamList).toHaveBeenCalled(),
      );

      expect(screen.queryByText('Error')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Reload' }),
      ).not.toBeInTheDocument();
    },
  );

  it('offers a retry when the team fails otherwise', async () => {
    answer(Promise.reject(httpError(500)));

    await renderCard();

    expect(
      await screen.findByRole('button', { name: 'Reload' }),
    ).toBeInTheDocument();
  });
});
