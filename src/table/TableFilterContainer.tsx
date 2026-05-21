import { FC } from 'react';
import { Accordion } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@/core/constants';

import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import { FilterItem, FilterPosition } from './types';

interface TableFilterContainerProps {
  filters: JSX.Element;
  formId?: string;
  table?: string;
  filterPosition?: FilterPosition;
  setFilter?: (item: FilterItem) => void;
  close?(): void; // comes from the drawer
}

export const TableFilterContainer: FC<TableFilterContainerProps> = (props) => {
  const filtersFormId = props.formId || '';

  const isMd = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.md });
  const filterPosition: FilterPosition = props.filterPosition || 'header';

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
          <SavedFilterSelect
            table={props.table}
            formId={filtersFormId}
            filterPosition={filterPosition}
          />
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
