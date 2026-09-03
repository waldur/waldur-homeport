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
