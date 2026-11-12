import { FunctionComponent, useCallback } from 'react';
import { useBreakpointDown } from 'waldur-ui';

import { TableColumnButton } from './TableColumnsButton';
import { TableDisplayModeButton } from './TableDisplayModeButton';
import { TableExportButton } from './TableExportButton';
import { TableFilterButton } from './TableFilterButton';
import { TableMoreActions } from './TableMoreActions';
import { TableProps } from './types';

interface TableButtonsProps extends TableProps {
  toggleFilterMenu?(show?: boolean): void;
  showFilterMenuToggle?: boolean;
  renderFilterButton?: boolean;
}

export const TableButtons: FunctionComponent<TableButtonsProps> = (props) => {
  const isSm = useBreakpointDown('sm');

  const showExportInDropdown =
    (props.enableExport && props.showExportInDropdown) ||
    (props.enableExport && Boolean(props.dropdownActions) && isSm);

  const onClickFilterButton = useCallback(
    (event) => {
      if (props.filterPosition === 'sidebar') {
        props.openFiltersDrawer(props.filters, props.formId);
      } else if (props.showFilterMenuToggle) {
        // The filter row is open: the funnel hides it, as it shows it.
        props.toggleFilterMenu(false);
      } else {
        // The filter row is hidden: show it before the Add-filter click
        // below (see TableToolbar.tsx's onClickFilterButton).
        props.toggleFilterMenu(true);
        const parent: HTMLElement = event.target.closest(
          '[data-slot="card"][data-variant="table"]',
        );
        if (!parent) return;
        const addFilterButton =
          parent.querySelector<HTMLButtonElement>('[data-add-filter]');
        if (addFilterButton) {
          // Applied filters come back with the row; with none, the menu
          // to add one opens.
          if (!props.filtersStorage?.length) {
            addFilterButton.click();
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
      props.filtersStorage,
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
        <div className="flex sm:justify-end max-sm:flex-wrap whitespace-nowrap gap-3 grow sm:grow-0">
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
              size={props.dropdownActionsSize}
              showExport
            />
          ) : (
            <>
              {props.enableExport && <TableExportButton {...props} />}
              {Boolean(props.dropdownActions) && (
                <TableMoreActions
                  {...props}
                  actions={props.dropdownActions}
                  size={props.dropdownActionsSize}
                />
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
