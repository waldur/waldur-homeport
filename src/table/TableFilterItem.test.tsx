import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { combineReducers, legacy_createStore as createStore } from 'redux';
import { describe, it, expect, vi } from 'vitest';

import { ModalProvider } from '@/modal/ModalContext';

import { TableFilterContext } from './FilterContextProvider';
import { StringFilter } from './filters';
import { tableInitialReducer } from './store';
import { TableFilterContainer } from './TableFilterContainer';
import { TableSidebarFilterValues } from './TableFilterItem';

describe('TableSidebarFilterValues', () => {
  const mockRemove = vi.fn();

  it('should render nothing for empty value', () => {
    const { container } = render(
      <TableSidebarFilterValues
        value=""
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render nothing for undefined value', () => {
    const { container } = render(
      <TableSidebarFilterValues
        value={undefined}
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('should render string value directly', () => {
    render(
      <TableSidebarFilterValues
        value="Test Value"
        getValueLabel={(v) => v}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Test Value')).toBeInTheDocument();
  });

  it('should extract label from object using getValueLabel', () => {
    const objectValue = { name: 'Proposal Name', uuid: '123-456' };
    render(
      <TableSidebarFilterValues
        value={objectValue}
        getValueLabel={(v) => v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Proposal Name')).toBeInTheDocument();
    expect(screen.queryByText('123-456')).not.toBeInTheDocument();
  });

  it('should extract full_name from reviewer object', () => {
    const reviewerValue = { full_name: 'John Doe', uuid: '789-abc' };
    render(
      <TableSidebarFilterValues
        value={reviewerValue}
        getValueLabel={(v) => v?.full_name || v?.email || v?.username}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle array of objects', () => {
    const arrayValue = [
      { name: 'Item 1', uuid: 'uuid-1' },
      { name: 'Item 2', uuid: 'uuid-2' },
    ];
    render(
      <TableSidebarFilterValues
        value={arrayValue}
        getValueLabel={(v) => v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should handle array with label property', () => {
    const arrayValue = [
      { label: 'State 1', value: 'pending' },
      { label: 'State 2', value: 'approved' },
    ];
    render(
      <TableSidebarFilterValues
        value={arrayValue}
        getValueLabel={(v) => v?.label || v}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('State 1')).toBeInTheDocument();
    expect(screen.getByText('State 2')).toBeInTheDocument();
  });

  it('should render slug from round object', () => {
    const roundValue = { slug: 'round-1', name: 'Round One', uuid: 'xyz-123' };
    render(
      <TableSidebarFilterValues
        value={roundValue}
        getValueLabel={(v) => v?.slug || v?.name}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('round-1')).toBeInTheDocument();
  });

  it('should use badgeValue when provided', () => {
    render(
      <TableSidebarFilterValues
        value="any value"
        getValueLabel={(v) => v}
        badgeValue={() => 'Custom Badge'}
        remove={mockRemove}
      />,
    );
    expect(screen.getByText('Custom Badge')).toBeInTheDocument();
  });
});

/**
 * Regression coverage for the Radix conversion: TableMenuFilterItem
 * (filterPosition="menu") used to rely on Metronic's own
 * data-kt-menu-trigger flyout and a MutationObserver watching for its
 * `.show` class. Both are gone now — this exercises the real
 * StringFilter -> withTableFilter -> TableFilterItem chain, unmocked,
 * the same way ActionsPopoverComponent's own typeahead fix was verified
 * earlier in this migration: type a full word into the flyout's input
 * and confirm every keystroke lands, not just enough to prove it opens.
 */
describe('TableMenuFilterItem (filterPosition="menu")', () => {
  const renderMenuFilter = (apply = vi.fn()) => {
    const table = 'MenuFilterRegressionTable';
    const store = createStore(combineReducers({ tables: tableInitialReducer }));
    render(
      <Provider store={store}>
        <TableFilterContext.Provider
          value={{
            table,
            filterPosition: 'menu',
            form: 'MenuFilterRegressionForm',
            setFilter: () => undefined,
            registerFilterComponent: () => undefined,
            apply,
          }}
        >
          <StringFilter
            title="Catalog"
            name="catalog_name"
            placeholder="Catalog"
            instantApply={false}
          />
        </TableFilterContext.Provider>
      </Provider>,
    );
    return { apply };
  };

  it('opens the flyout on click and the input accepts a full word', async () => {
    const user = userEvent.setup();
    renderMenuFilter();

    expect(() => screen.getByRole('button', { name: 'Catalog' })).not.toThrow();
    await user.click(screen.getByRole('button', { name: 'Catalog' }));

    const input = await screen.findByPlaceholderText('Catalog');
    await user.type(input, 'eessi');
    expect(input).toHaveValue('eessi');
  });

  it('Cancel closes only this flyout without calling apply', async () => {
    const user = userEvent.setup();
    const { apply } = renderMenuFilter();

    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    await screen.findByPlaceholderText('Catalog');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByPlaceholderText('Catalog')).not.toBeInTheDocument();
    expect(apply).not.toHaveBeenCalled();
  });
});

/**
 * Regression coverage for the mobile/sidebar filter drawer bug: reported
 * live as filter rows ("Parent offering", "Category", "Organization")
 * rendering empty and disappearing shortly after the drawer opened.
 * Root cause was that TableSidebarFilterItem rendered `props.children`
 * unconditionally inside Accordion.Body — react-bootstrap's underlying
 * Collapse mounts its children regardless of collapsed state, so with
 * `alwaysOpen` every sidebar filter row's field mounted at once. For an
 * AsyncSelectFilter that meant every row's forced `autoFocus: true` (see
 * useSelect.ts's `tableFilterProps`, which doesn't distinguish sidebar
 * from menu position) fired simultaneously, starving the main thread —
 * confirmed live in Storybook, not reproducible under jsdom's simpler
 * event loop, so this test instead pins the *mounting* contract the fix
 * relies on: a row's own field must not exist in the DOM until that
 * row's own accordion section is the expanded one.
 */
describe('TableSidebarFilterItem (filterPosition="sidebar")', () => {
  const renderSidebarFilter = () => {
    const table = 'SidebarFilterRegressionTable';
    const store = createStore(combineReducers({ tables: tableInitialReducer }));
    render(
      <Provider store={store}>
        <ModalProvider>
          <TableFilterContainer
            table={table}
            formId="SidebarFilterRegressionForm"
            filterPosition="sidebar"
            setFilter={() => undefined}
            filters={
              <StringFilter
                title="Catalog"
                name="catalog_name"
                placeholder="Catalog"
              />
            }
          />
        </ModalProvider>
      </Provider>,
    );
  };

  it('does not mount the field until its accordion section is expanded', async () => {
    const user = userEvent.setup();
    renderSidebarFilter();

    expect(screen.queryByPlaceholderText('Catalog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    expect(await screen.findByPlaceholderText('Catalog')).toBeInTheDocument();
  });

  it('unmounts the field again when the section is collapsed', async () => {
    const user = userEvent.setup();
    renderSidebarFilter();

    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    await screen.findByPlaceholderText('Catalog');

    await user.click(screen.getByRole('button', { name: 'Catalog' }));
    expect(screen.queryByPlaceholderText('Catalog')).not.toBeInTheDocument();
  });
});
