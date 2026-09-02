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
  /** The filter name TableFiltersMenu's column-filter toggle should
   * auto-open once its own menu becomes visible (its own `openName`
   * prop, threaded through context so TableFilterItem's per-filter row
   * can read it without further prop drilling). Paired with
   * `menuIsOpen` below — TableFiltersMenu's content is force-mounted
   * (see its own comment for why), so a filter's row exists in the DOM
   * well before its enclosing menu is ever opened; the auto-open must
   * key off visibility, not mount. */
  openMenuName?: string;
  /** Whether TableFiltersMenu's own Popover is currently open. */
  menuIsOpen?: boolean;
  columnFilter?: boolean;
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
