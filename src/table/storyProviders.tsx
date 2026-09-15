import { Card } from 'react-bootstrap';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { configureStore } from 'redux-mock-store';

import { ModalProvider } from '@/modal/ModalContext';

import { INITIAL_STATE } from './constants';
import { TableState } from './types';

/**
 * Shared harness primitives for every `src/table` story file — the single
 * place that knows how to wire a piece of this module up outside the real
 * app. Consolidated here after three story files independently invented
 * overlapping versions of the same Redux/Modal wiring (a bare no-op store
 * for `Table.stories.tsx`, a real seeded `redux-mock-store` hand-rolled
 * inside `TableFiltersMenu.stories.tsx`, an inline `<Card>` wrapper inside
 * `TablePagination.stories.tsx`) — a fourth story file needing any of this
 * should import it from here, not write a fourth version.
 */

const noop = () => undefined;

/**
 * Every `TableProps` callback `<Table>` needs a working reference for, even
 * when a story never exercises it — `Table.tsx` calls several unconditionally
 * on mount (`setFilterPosition`) or once the responsive `isSm` breakpoint
 * flips `filterPosition` to `'sidebar'` (`renderFiltersDrawer`), regardless
 * of what the story is actually demonstrating. Shared so every `<Table>`
 * a story renders — top-level or nested (e.g. inside an expanded row) —
 * gets the same complete set rather than each accumulating its own (a
 * nested `<Table>` missing one of these throws just as readily as the
 * outer one).
 */
export const tableStoryNoopHandlers = {
  activeColumns: {},
  columnPositions: [],
  // TABLE_DEFAULT_PROPS (Table.tsx) doesn't default this one — real call
  // sites get it from useTable()'s Redux-backed INITIAL_STATE.filterPosition.
  // Without it, `filterPosition` is undefined and the whole menu/sidebar
  // filters block (Table.tsx's "Menu/Sidebar filters" section) renders
  // nothing at all, regardless of `filters`/`filtersStorage`.
  filterPosition: 'menu' as const,
  gotoPage: noop,
  setQuery: noop,
  setFilter: noop,
  applyFiltersFn: noop,
  setFilterPosition: noop,
  openFiltersDrawer: noop,
  renderFiltersDrawer: noop,
  setDisplayMode: noop,
  updatePageSize: noop,
  resetPagination: noop,
  sortList: noop,
  toggleRow: noop,
  selectRow: noop,
  selectAllRows: noop,
  resetSelection: noop,
  toggleColumn: noop,
  initColumnPositions: noop,
  swapColumns: noop,
  resetColumns: noop,
  toggleColumnPin: noop,
};

/**
 * `<Table>` always wraps its children in `FilterContextProvider`, which
 * calls `useDispatch()` unconditionally regardless of whether the story
 * renders any filters — so every Table story needs a Redux `<Provider>`
 * ancestor even when it never dispatches anything. A bare no-op store is
 * enough: nothing in these structural/visual stories reads Redux state,
 * only dispatches on interaction (e.g. changing a filter field), which
 * these stories don't exercise. Stories that *do* need real selector-backed
 * state (saved filters, applied-filter values) want `withSeededTableStore`
 * below instead.
 *
 * `ModalProvider` is needed too — `ErrorView` (rendered when a story sets
 * `error`) calls `useModal()`, which throws outside one.
 */
const noopStore = createStore(() => ({}));

export const withTableProviders = (Story: () => React.ReactElement) => (
  <Provider store={noopStore}>
    <ModalProvider>
      <Story />
    </ModalProvider>
  </Provider>
);

/**
 * A real `redux-mock-store`, seeded with one table's state, for the few
 * components that read Redux selectors directly rather than through props
 * — `TableFiltersMenu`'s `SaveFilterItems`/`SavedFilterSelect` children read
 * `selectTableSavedFilters`/`selectFilterValues` straight from
 * `tables[table]`, bypassing whatever prop is passed alongside. Static and
 * non-reactive on purpose: `redux-mock-store` doesn't run reducers on
 * dispatch, which is fine for a deterministic fixture story, wrong for an
 * interactive one.
 *
 * Note the named import: `redux-mock-store` exports `configureStore` as a
 * named export, not a default one — `import configureStore from
 * 'redux-mock-store'` type-checks (the package ships loose types) and even
 * works under Vitest's lenient CJS interop, but silently fails at runtime
 * under Storybook/Vite's stricter ESM interop ("configureStore is not a
 * function").
 *
 * Not exported — `withSeededTableStore` below is the public entry point;
 * every current caller wants the store paired with `ModalProvider`, not the
 * bare store alone. Export this directly too if a future caller genuinely
 * needs just the store (e.g. to assert against it in a non-rendering test).
 */
function createSeededTableStore(
  tableId: string,
  tableState: Partial<TableState> = {},
) {
  const mockStore = configureStore();
  return mockStore({
    tables: {
      [tableId]: { ...INITIAL_STATE, ...tableState },
    },
  });
}

/**
 * Decorator factory pairing `createSeededTableStore` with `ModalProvider` —
 * the two always travel together in practice (anything reading seeded
 * table state so far has also pulled in `useModal()` transitively, e.g.
 * `TableFiltersMenu`'s "Save as" dialog trigger).
 */
export const withSeededTableStore =
  (tableId: string, tableState?: Partial<TableState>) =>
  (Story: () => React.ReactElement) => (
    <Provider store={createSeededTableStore(tableId, tableState)}>
      <ModalProvider>
        <Story />
      </ModalProvider>
    </Provider>
  );

/**
 * `Table.tsx`'s outer `<Card className="card-table">` — needed standalone
 * wherever a story renders a piece of the table family whose CSS is scoped
 * under that ancestor, rather than the whole `<Table>`. Confirmed necessary
 * for `TablePagination`: `custom/_table.scss` recolors the active page to
 * the app's neutral gray only under `.card.card-table .table-pagination
 * .page-item.active .page-link` — without this wrapper it falls through to
 * Bootstrap's plain (and, in this theme, green) `$primary` default instead.
 * `card-bordered` matches `TABLE_DEFAULT_PROPS.cardBordered`'s real default.
 */
export const withCardTable = (Story: () => React.ReactElement) => (
  <Card className="card-table card-bordered">
    <Story />
  </Card>
);
