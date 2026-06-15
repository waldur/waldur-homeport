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
