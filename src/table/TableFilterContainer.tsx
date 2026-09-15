import { FC } from 'react';
import { Accordion } from 'react-bootstrap';

import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import { FilterItem } from './types';

interface TableFilterContainerProps {
  filters: JSX.Element;
  formId?: string;
  table?: string;
  setFilter?: (item: FilterItem) => void;
  close?(): void; // comes from the drawer
}

/** The mobile/narrow-viewport filter drawer — opened via `useTable()`'s
 * `renderFiltersDrawer`/`openFiltersDrawer`, always at `filterPosition:
 * "sidebar"`. A `filterPosition="header"` variant used to live here too
 * (an always-visible inline row, for `<Table filterPosition="header">`),
 * but no real caller ever paired that prop with `filters` — `Table.tsx`'s
 * own header-filters render branch required both together and never fired
 * in production — so it was removed rather than kept as unreachable code. */
export const TableFilterContainer: FC<TableFilterContainerProps> = (props) => {
  const filtersFormId = props.formId || '';

  return (
    <TableFilterContext.Provider
      value={{
        table: props.table,
        filterPosition: 'sidebar',
        form: filtersFormId,
        setFilter: props.setFilter,
      }}
    >
      <div className="filter-container">
        <SavedFilterSelect
          table={props.table}
          formId={filtersFormId}
          filterPosition="sidebar"
        />
        <Accordion alwaysOpen>{props.filters}</Accordion>
      </div>
    </TableFilterContext.Provider>
  );
};
