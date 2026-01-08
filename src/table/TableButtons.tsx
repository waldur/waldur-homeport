import { FunctionComponent, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';

import { TableColumnButton } from './TableColumnsButton';
import { TableDisplayModeButton } from './TableDisplayModeButton';
import { TableExportButton } from './TableExportButton';
import { TableFilterButton } from './TableFilterButton';
import { TableMoreActions } from './TableMoreActions';
import { TableProps } from './types';

interface TableButtonsProps extends TableProps {
  toggleFilterMenu?(): void;
  showFilterMenuToggle?: boolean;
  renderFilterButton?: boolean;
}

export const TableButtons: FunctionComponent<TableButtonsProps> = (props) => {
  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const showExportInDropdown =
    (props.enableExport && props.showExportInDropdown) ||
    (props.enableExport && Boolean(props.dropdownActions) && isSm);

  const onClickFilterButton = useCallback(
    (event) => {
      if (props.filterPosition === 'sidebar') {
        props.openFiltersDrawer(props.filters);
      } else {
        props.toggleFilterMenu();
        const parent: HTMLElement = event.target.closest('.card-table');
        if (!parent) return;
        const btns = parent.getElementsByClassName(
          'btn-add-filter',
        ) as HTMLCollectionOf<HTMLButtonElement>;
        if (btns?.length) {
          if (!props.showFilterMenuToggle || props.filtersStorage?.length) {
            btns.item(0).click();
            event.stopPropagation();
          }
        }
      }
    },
    [
      props.openFiltersDrawer,
      props.toggleFilterMenu,
      props.filterPosition,
      props.showFilterMenuToggle,
    ],
  );

  const showDefaultActions =
    Boolean(props.dropdownActions) ||
    props.enableExport ||
    props.filters ||
    Boolean(props.gridItem && props.columns.length) ||
    props.hasOptionalColumns;

  return (
    <>
      {showDefaultActions && (
        <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-4 flex-grow-1 flex-sm-grow-0">
          {/* Filter */}
          {props.renderFilterButton !== false &&
            ['menu', 'sidebar'].includes(props.filterPosition) &&
            props.filters && (
              <TableFilterButton
                onClick={onClickFilterButton}
                hasFilter={!!props.filtersStorage?.length}
                filterCount={props.filtersStorage?.length || 0}
              />
            )}
          {/* Display mode */}
          {Boolean(props.gridItem && props.columns.length) && (
            <TableDisplayModeButton
              mode={props.mode}
              setDisplayMode={props.setDisplayMode}
            />
          )}
          {/* Optional columns */}
          {props.hasOptionalColumns && <TableColumnButton {...props} />}
          {/* Main actions */}
          {showExportInDropdown ? (
            <TableMoreActions
              {...props}
              actions={props.dropdownActions}
              showExport
            />
          ) : (
            <>
              {props.enableExport && <TableExportButton {...props} />}
              {Boolean(props.dropdownActions) && (
                <TableMoreActions {...props} actions={props.dropdownActions} />
              )}
            </>
          )}
        </div>
      )}
      {(!props.standalone || props.standaloneActionsInTable || isSm) &&
        props.tableActions}
    </>
  );
};
