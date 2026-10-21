import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC, ReactNode } from 'react';
import { Field } from 'react-final-form';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LayoutSlotsProvider, useLayoutSlots } from '@/navigation/slots';
import { useUser } from '@/workspace/hooks';

import { MarketplaceLandingFilter } from '../MarketplaceLandingFilter';

import { MarketplaceScopeBar } from './PageBarFilters';
import { setMarketplaceFilter } from './store/actions';
import { filterReducer } from './store/reducer';

const h = vi.hoisted(() => ({
  desktop: true,
  // The filters in the URL, which getInitialValues reads through the router.
  urlFilters: undefined as Record<string, any> | undefined,
}));

vi.mock('@/core/filters', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/core/filters')>()),
  // A fresh object per call, as the real one parses the URL each time.
  getInitialValues: () =>
    h.urlFilters ? structuredClone(h.urlFilters) : undefined,
  syncFiltersToURL: () => undefined,
}));

vi.mock('waldur-ui', async (importOriginal) => ({
  ...(await importOriginal<typeof import('waldur-ui')>()),
  useBreakpointUp: () => h.desktop,
}));

vi.mock('@/navigation/sidebar/resources-filter/utils', () => ({
  useOrganizationAndProjectAutocompletesForResources: () => ({
    clearAllFilters: vi.fn(),
    removeFilter: vi.fn(),
    syncResourceFilters: vi.fn(),
  }),
}));

// The real autocompletes load their options from the API; a field that
// picks a fixed organization and shows the form's value stands in for them.
vi.mock('../../orders/OrganizationAutocomplete', () => ({
  OrganizationAutocomplete: () => (
    <Field name="organization">
      {({ input }) => (
        <>
          <span data-testid="picked">{input.value?.name ?? 'nothing'}</span>
          <button
            type="button"
            onClick={() => input.onChange({ uuid: 'org-b', name: 'Beta' })}
          >
            Pick Beta
          </button>
        </>
      )}
    </Field>
  ),
}));

vi.mock('../../resources/list/ProjectAutocomplete', () => ({
  ProjectAutocomplete: () => null,
}));

const ACME_UUID = '0123456789abcdef0123456789abcdef';

const createTestStore = () =>
  createStore(
    combineReducers({
      marketplace: combineReducers({ filters: filterReducer }),
    }),
  );

const organizationFilter = (value) =>
  setMarketplaceFilter({
    label: 'Organization',
    name: 'organization',
    value,
    getValueLabel: (item) => item?.name,
  });

const tagFilter = setMarketplaceFilter({
  label: 'Tag',
  name: 'tag',
  value: { uuid: 'tag-1', name: 'GPU' },
  getValueLabel: (item) => item?.name,
});

beforeEach(() => {
  // @/workspace/hooks is mocked for every test (test/mocks/workspace.js).
  vi.mocked(useUser).mockReturnValue({ uuid: 'user-1' } as any);
  h.desktop = true;
  h.urlFilters = undefined;
});

describe('MarketplaceLandingFilter', () => {
  // The form starts from the URL's filters. Clear filters empties the URL, and
  // the form used to restart from `undefined`: final-form then had no values
  // object and threw on every change, so the picker could not pick anything.
  it('can pick an organization after the URL filter is cleared', async () => {
    const user = userEvent.setup();
    h.urlFilters = { organization: { uuid: ACME_UUID, name: 'Acme' } };
    const store = createTestStore();
    store.dispatch(organizationFilter({ uuid: ACME_UUID, name: 'Acme' }));
    const page = (
      <Provider store={store}>
        <MarketplaceLandingFilter />
      </Provider>
    );
    const { rerender } = render(page);

    // Clear filters: the URL and the store both drop the organization, and
    // the bar around the picker renders again.
    act(() => {
      h.urlFilters = undefined;
      store.dispatch(organizationFilter(null));
    });
    rerender(page);

    await user.click(
      screen.getByRole('button', { name: 'Organization & Project' }),
    );
    expect(screen.getByTestId('picked')).toHaveTextContent('nothing');
    await user.click(screen.getByRole('button', { name: 'Pick Beta' }));

    expect(screen.getByTestId('picked')).toHaveTextContent('Beta');
  });
});

/**
 * A stand-in for Layout: the two slots the scope bar fills, the page tabs'
 * actions and the bar under the tabs, rendered side by side.
 */
const LayoutSlots: FC<{ children: ReactNode }> = ({ children }) => {
  const { value, slotRef } = useLayoutSlots();
  return (
    <LayoutSlotsProvider value={value}>
      {children}
      <div data-testid="tab-row" ref={slotRef.actions} />
      <div data-testid="filter-bar" ref={slotRef.filters} />
    </LayoutSlotsProvider>
  );
};

const MarketplacePage = () => <MarketplaceScopeBar />;

const renderPage = (store = createTestStore()) =>
  render(
    <Provider store={store}>
      <LayoutSlots>
        <MarketplacePage />
      </LayoutSlots>
    </Provider>,
  );

const picker = (slot: HTMLElement) =>
  within(slot).queryByRole('button', { name: 'Organization & Project' });

describe('MarketplaceScopeBar', () => {
  describe('on desktop', () => {
    it('puts the picker in the tab row, at the tabs’ size, and no bar without filters', () => {
      renderPage();

      const button = picker(screen.getByTestId('tab-row'));
      expect(button).toBeInTheDocument();
      // md: 36px, a tab's height (sm, in the bar, is 28px).
      expect(button).toHaveClass('py-[8px]');
      expect(screen.getByTestId('filter-bar')).toBeEmptyDOMElement();
    });

    it('lists the filters in force in a row of their own under the tabs', () => {
      const store = createTestStore();
      store.dispatch(organizationFilter({ uuid: ACME_UUID, name: 'Acme' }));
      renderPage(store);

      const bar = screen.getByTestId('filter-bar');
      expect(bar).toHaveTextContent('Filtered by');
      expect(bar).toHaveTextContent('Acme');
      expect(picker(bar)).not.toBeInTheDocument();
      expect(picker(screen.getByTestId('tab-row'))).toBeInTheDocument();
    });
  });

  describe('below lg', () => {
    beforeEach(() => {
      h.desktop = false;
    });

    it('leaves the tab row to the tabs and puts the picker in the bar', () => {
      renderPage();

      expect(screen.getByTestId('tab-row')).toBeEmptyDOMElement();
      const button = picker(screen.getByTestId('filter-bar'));
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('py-[4px]');
    });

    it('shows the filters in force beside the picker', () => {
      const store = createTestStore();
      store.dispatch(organizationFilter({ uuid: ACME_UUID, name: 'Acme' }));
      renderPage(store);

      const bar = screen.getByTestId('filter-bar');
      expect(picker(bar)).toBeInTheDocument();
      expect(bar).toHaveTextContent('Filtered by');
      expect(bar).toHaveTextContent('Acme');
    });
  });

  describe('for a visitor', () => {
    beforeEach(() => {
      vi.mocked(useUser).mockReturnValue(null);
    });

    it('shows nothing until a filter is set', () => {
      renderPage();

      expect(screen.getByTestId('tab-row')).toBeEmptyDOMElement();
      expect(screen.getByTestId('filter-bar')).toBeEmptyDOMElement();
    });

    it('shows the tag filter, without the picker', () => {
      const store = createTestStore();
      store.dispatch(tagFilter);
      renderPage(store);

      const bar = screen.getByTestId('filter-bar');
      expect(bar).toHaveTextContent('GPU');
      expect(picker(bar)).not.toBeInTheDocument();
      expect(screen.getByTestId('tab-row')).toBeEmptyDOMElement();
    });
  });
});
