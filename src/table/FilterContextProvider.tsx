import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useState,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { change } from 'redux-form';

import { RootState } from '@waldur/store/reducers';

import { FilterItem, TableProps, TableState } from './types';
import { getFiltersFormId } from './utils';

interface ITableFilterContext {
  filterPosition: TableState['filterPosition'];
  form: string;
  changeFormField?: (field: string, value: any) => void;
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
  const originalFilterPosition = useSelector((state: RootState) => {
    if (props.table && state.tables && state.tables[props.table]) {
      return state.tables[props.table].filterPosition;
    }
    return 'header';
  });
  const filtersFormId = getFiltersFormId(props.filters);

  const [filterComponents, setFilterComponents] = useState([]);

  const registerFilterComponent = (comp) => {
    setFilterComponents((prev) =>
      prev.some((p) => p.name === comp.name) ? prev : [...prev, comp],
    );
  };

  const apply = () => {
    props.applyFiltersFn(true);
    props.toggleFilterMenu(true);
  };

  const dispatch = useDispatch();
  const changeFormField = useCallback(
    (field: string, value) => {
      dispatch(change(filtersFormId, field, value));
    },
    [dispatch, filtersFormId],
  );

  return (
    <TableFilterContext.Provider
      value={{
        selectedSavedFilter: props.selectedSavedFilter,
        filterPosition: originalFilterPosition,
        form: filtersFormId,
        changeFormField,
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
