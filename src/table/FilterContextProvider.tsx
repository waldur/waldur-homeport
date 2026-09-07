import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';
import { useDispatch } from 'react-redux';

import { setFilter } from './actions';
import { FilterItem, TableProps, TableState } from './types';

interface ITableFilterContext {
  table: string;
  filterPosition: TableState['filterPosition'];
  form: string;
  changeFilterValue?: (name: string, value: any) => void;
  setFilter: (item: FilterItem) => void;
  apply?: (hideMenu?: boolean) => void;
  /** The filter name TableFiltersMenu's column-header toggle targets —
   * its own `openName` prop, threaded through context so
   * TableFilterItem's per-filter row can read it without further prop
   * drilling. Set only by the column-header instance; undefined in the
   * "Add filter" list instance. TableMenuFilterItem uses its mere
   * presence to tell the two contexts apart: the one row matching it
   * renders its field directly (see that file's own comment), and every
   * other row renders nothing. */
  openMenuName?: string;
  /** Whether TableFiltersMenu's own Popover is currently open — the
   * column-header target row (see `openMenuName` above) uses this to
   * defer mounting its field until the popup is actually visible.
   * Mounting it unconditionally, the moment the force-mounted popup
   * itself mounts (page load, for every filterable column at once),
   * let components like react-select's own auto-focus-on-mount behavior
   * fire immediately and simultaneously across every column — reported
   * live as a React "Should not already be working" crash in Storybook,
   * traced to `Select.focusInput()`; a real, if less catastrophic,
   * scattershot-focus concern in production too. */
  menuIsOpen?: boolean;
  /** Closes the enclosing TableFiltersMenu's own Popover without calling
   * `apply` — set only by the column-header toggle instance, for its
   * single target filter's own "Cancel" button (see TableFilterItem.tsx:
   * a column-header popup renders that one filter's field directly, with
   * no per-item Popover of its own left to close). Undefined in the "Add
   * filter" list instance, where each row still manages its own nested
   * Popover and Cancel just collapses that row locally. */
  closeMenu?(): void;
  /** Name of the row currently expanded inside the "Add filter" list —
   * an individual filter's own `name`, or one of the synthetic
   * "Current filters"/"Saved filters" row names SaveFilterItems uses.
   * Owned and set by TableFiltersMenu.tsx (its "Add filter"-list
   * instance only — the column-header instance doesn't use this row
   * shape at all, see `openMenuName`) so opening one row closes any
   * previously open sibling.
   *
   * Each row is otherwise an independent Radix Popover with no shared
   * "only one open" grouping of its own, and Radix's own default
   * outside-click dismissal alone isn't enough to coordinate that:
   * switching rows in the real ~12-row list (mixed dropdown/toggle
   * fields — a short 2-row list doesn't reproduce this) needed a
   * *second* click, the first only dismissed the old row. Root cause is
   * Radix's default onCloseAutoFocus: the old row's close is
   * asynchronous, so by the time it actually unmounts and returns focus
   * to its own trigger, the new row (already open elsewhere in the DOM)
   * reads that stray focus event as an outside interaction and
   * dismisses itself — a screenshot mid-transition catches both looking
   * open at once. Fixed by suppressing onOpenAutoFocus/onCloseAutoFocus
   * on every row's own Popover.Content, not by anything in this field —
   * this coordination alone was never the missing piece. Undefined
   * outside TableFiltersMenu's own context override, in which case
   * TableMenuFilterItem falls back to fully independent local state —
   * correct for a filter rendered standalone, with no siblings to
   * coordinate with. */
  activeItemName?: string;
  /** Accepts a functional updater (`(prev) => next`), not just a plain
   * value — required for the "only clear if I'm still the active one"
   * guard each row's own onOpenChange uses (see `activeItemName`'s own
   * comment for the race this guards against). */
  setActiveItemName?(
    update:
      string | undefined | ((prev: string | undefined) => string | undefined),
  ): void;
  selectedSavedFilter?: TableState['selectedSavedFilter'];
  filterComponents?: any[];
  registerFilterComponent?(comp): void;
}

export const TableFilterContext = createContext<ITableFilterContext>({} as any);

interface FilterContextProviderProps extends Pick<
  TableProps,
  | 'table'
  | 'filters'
  | 'formId'
  | 'filterPosition'
  | 'setFilter'
  | 'applyFiltersFn'
  | 'selectedSavedFilter'
> {
  toggleFilterMenu?(show?): void;
}

export const FilterContextProvider: FC<
  PropsWithChildren<FilterContextProviderProps>
> = (props) => {
  const filtersFormId = props.formId || '';

  const [filterComponents, setFilterComponents] = useState([]);

  const registerFilterComponent = useCallback((comp) => {
    setFilterComponents((prev) =>
      prev.some((p) => p.name === comp.name) ? prev : [...prev, comp],
    );
  }, []);

  const apply = () => {
    props.applyFiltersFn(true);
    props.toggleFilterMenu(true);
  };

  const dispatch = useDispatch();

  const changeFilterValue = useCallback(
    (name: string, value) => {
      dispatch(
        setFilter(props.table, {
          name,
          value,
          label: null,
          component: null,
        }),
      );
    },
    [dispatch, props.table],
  );

  return (
    <TableFilterContext.Provider
      value={{
        table: props.table,
        selectedSavedFilter: props.selectedSavedFilter,
        filterPosition: props.filterPosition,
        form: filtersFormId,
        changeFilterValue,
        setFilter: props.setFilter,
        apply,
        filterComponents,
        registerFilterComponent,
      }}
    >
      {props.children}
    </TableFilterContext.Provider>
  );
};
