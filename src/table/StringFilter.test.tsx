import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, expect, it } from 'vitest';

import { TableFilterContext } from './FilterContextProvider';
import { StringFilter } from './filters';
import { getTableState } from './selectors';
import { tableInitialReducer } from './store';

describe('StringFilter', () => {
  it('stores a string rather than a DOM event so the table query key can be serialized', async () => {
    const table = 'OfferingSoftwarePackages';
    const store = createStore(combineReducers({ tables: tableInitialReducer }));

    render(
      <Provider store={store}>
        <TableFilterContext.Provider
          value={{
            table,
            filterPosition: 'header',
            form: 'MarketplaceSoftwarePackagesFilter',
            setFilter: () => undefined,
          }}
        >
          <StringFilter
            title="Catalog"
            name="catalog_name"
            placeholder="Catalog"
          />
        </TableFilterContext.Provider>
      </Provider>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Catalog' }));
    await userEvent.type(screen.getByPlaceholderText('Catalog'), 'eessi');

    const filterItem = getTableState(table)(
      store.getState() as any,
    )?.filtersStorage?.find((f) => f.name === 'catalog_name');

    expect(filterItem?.value).toBe('eessi');
    expect(() =>
      JSON.stringify({ catalog_name: filterItem?.value }),
    ).not.toThrow();
  });
});
