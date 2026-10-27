import { FC, ReactNode } from 'react';

import { Accordion } from 'waldur-ui';

import { TableFilterContext } from './FilterContextProvider';
import { SavedFilterSelect } from './SavedFilterSelect';
import { FilterItem } from './types';

interface TableFilterContainerProps {
  filters: JSX.Element;
  formId?: string;
  table?: string;
  setFilter?: (item: FilterItem) => void;
  /** Actions under the filters (Save / Cancel / Apply), inside the same
   * filter context so they save under this `formId`. */
  footer?: ReactNode;
}

/** The mobile/narrow-viewport filter panel's content — shown by the table's
 * `TableFilterSheet` when its `openFiltersDrawer` runs, always at
 * `filterPosition: "sidebar"`. A `filterPosition="header"` variant used to live here too
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
      <div className="flex-1 min-h-0 overflow-y-auto p-5 whitespace-normal [&_[data-slot=filter-field]]:pt-0">
        <SavedFilterSelect
          table={props.table}
          formId={filtersFormId}
          filterPosition="sidebar"
        />
        <Accordion type="multiple">{props.filters}</Accordion>
      </div>
      {props.footer && (
        <div className="py-3 px-5 border-t-[1px] border-t-secondary">
          {props.footer}
        </div>
      )}
    </TableFilterContext.Provider>
  );
};
