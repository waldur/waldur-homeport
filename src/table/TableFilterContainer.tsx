import { FC } from 'react';
import { Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { type RootState } from '@waldur/store/reducers';

import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import { FilterItem } from './types';
import { getFiltersFormId } from './utils';

interface TableFilterContainerProps {
  filters: JSX.Element;
  table?: string;
  setFilter?: (item: FilterItem) => void;
  close?(): void; // comes from the drawer
}

export const TableFilterContainer: FC<TableFilterContainerProps> = (props) => {
  const originalFilterPosition = useSelector((state: RootState) => {
    if (props.table && state.tables && state.tables[props.table]) {
      return state.tables[props.table].filterPosition;
    }
    return 'header';
  });
  const filtersFormId = getFiltersFormId(props.filters);

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });
  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
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
        <div className={isMd ? 'd-flex scroll-x' : 'd-flex'}>
          <div
            className={
              isMd
                ? 'd-flex align-items-stretch text-nowrap w-100'
                : 'd-flex align-items-stretch flex-wrap gap-2 w-100'
            }
          >
            {props.filters}
          </div>
        </div>
      )}
    </TableFilterContext.Provider>
  );
};
