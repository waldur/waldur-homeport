import React from 'react';
import { Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { RootState } from '@waldur/store/reducers';

import { SavedFilterSelect } from './SavedFilterSelect';
import { FilterItem, TableState } from './types';
import { getFiltersFormId } from './utils';

interface ITableFilterContext {
  filterPosition: TableState['filterPosition'];
  form: string;
  setFilter: (item: FilterItem) => void;
  apply?: () => void;
  columnFilter?: boolean;
  selectedSavedFilter?: TableState['selectedSavedFilter'];
}

export const TableFilterContext = React.createContext<ITableFilterContext>(
  {} as any,
);

interface TableFilterContainerProps {
  filters: JSX.Element;
  table?: string;
  setFilter?: (item: FilterItem) => void;
  close?(): void; // comes from the drawer
}

export const TableFilterContainer: React.FC<TableFilterContainerProps> = (
  props,
) => {
  const originalFilterPosition = useSelector((state: RootState) => {
    if (props.table && state.tables && state.tables[props.table]) {
      return state.tables[props.table].filterPosition;
    }
    return 'header';
  });
  const filtersFormId = getFiltersFormId(props.filters);

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });
  const filterPosition =
    isSm && originalFilterPosition === 'menu'
      ? 'sidebar'
      : originalFilterPosition;

  return (
    <TableFilterContext.Provider
      value={{
        filterPosition,
        form: filtersFormId,
        setFilter: props.setFilter,
      }}
    >
      {filterPosition === 'sidebar' ? (
        // Sidebar filters
        <div className="filter-container">
          <SavedFilterSelect table={props.table} formId={filtersFormId} />
          <Accordion alwaysOpen>{props.filters}</Accordion>
        </div>
      ) : (
        // Header filters
        <div className="d-flex scroll-x">
          <div className="d-flex align-items-stretch text-nowrap w-100">
            {props.filters}
          </div>
        </div>
      )}
    </TableFilterContext.Provider>
  );
};
