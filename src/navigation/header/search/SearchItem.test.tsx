import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { SearchItem, SearchItemProps } from './SearchItem';

vi.mock('@/core/Link', () => ({
  Link: ({ params, children, className }) => (
    <a href="/test" className={className} data-params={JSON.stringify(params)}>
      {children}
    </a>
  ),
}));

vi.mock('@/navigation/sidebar/resources-filter/utils', () => ({
  useOrganizationAndProjectAutocompletesForResources: () => ({
    syncResourceFilters: vi.fn(),
  }),
}));

describe('SearchItem', () => {
  it('opens the link params but saves the item without them', async () => {
    const isFavorite = vi.fn<SearchItemProps['isFavorite']>(() => undefined);
    const addFavoritePage = vi.fn();
    renderWithProviders(
      <SearchItem
        to="marketplace-resource-details"
        params={{ resource_uuid: 't1' }}
        linkParams={{ tab: 'ports', object: 'p1' }}
        title="tenant"
        detail="Port vip: 192.168.1.60"
        isFavorite={isFavorite}
        addFavoritePage={addFavoritePage}
        removeFavorite={vi.fn()}
      />,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'data-params',
      JSON.stringify({ resource_uuid: 't1', tab: 'ports', object: 'p1' }),
    );
    expect(screen.getByText('Port vip: 192.168.1.60')).toBeInTheDocument();
    expect(isFavorite).toHaveBeenCalledWith('marketplace-resource-details', {
      resource_uuid: 't1',
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'Add to favorites' }),
    );
    expect(addFavoritePage).toHaveBeenCalledWith(
      expect.objectContaining({ params: { resource_uuid: 't1' } }),
      expect.anything(),
    );
  });
});
