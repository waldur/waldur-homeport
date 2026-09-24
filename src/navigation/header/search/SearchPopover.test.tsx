import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/harness';

import { SearchPopover } from './SearchPopover';

vi.mock('../favorite-pages/FavoritePageService', () => ({
  useFavoritePages: () => ({
    favPages: [],
    isCurrentPageFavorite: true,
    addCurrentPageFavorite: vi.fn(),
    addFavoritePage: vi.fn(),
    removeFavorite: vi.fn(),
    isFavorite: () => false,
  }),
}));

vi.mock('@/navigation/sidebar/resources-filter/utils', () => ({
  useOrganizationAndProjectAutocompletesForResources: () => ({
    syncResourceFilters: vi.fn(),
  }),
}));

const idle = { data: undefined, status: 'pending', isLoading: false } as any;

const Harness = () => {
  const [activeTab, setActiveTab] = useState('all');
  return (
    <SearchPopover
      result={idle}
      usersResult={idle}
      query="abc"
      show
      setQuery={vi.fn()}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isStaffOrSupportUser={false}
      close={vi.fn()}
    />
  );
};

describe('SearchPopover category tabs', () => {
  const user = userEvent.setup();

  it('Tab lands on the selected tab and the arrows move between tabs', async () => {
    renderWithProviders(<Harness />);

    screen.getByRole('textbox').focus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Clear' })).toHaveFocus();

    await user.tab();
    const allResults = screen.getByRole('tab', { name: 'All results' });
    expect(allResults).toHaveFocus();
    expect(allResults).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowRight}');
    const organizations = screen.getByRole('tab', { name: 'Organizations' });
    expect(organizations).toHaveFocus();
    expect(organizations).toHaveAttribute('aria-selected', 'true');
    expect(allResults).toHaveAttribute('aria-selected', 'false');
  });

  it('keeps the scrollable tab row itself out of the Tab order', () => {
    renderWithProviders(<Harness />);

    // Firefox makes scroll boxes focusable unless they opt out. The scroll
    // box is a plain wrapper with no role, so it is reached from the tablist.
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByRole('tablist').parentElement).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });
});
