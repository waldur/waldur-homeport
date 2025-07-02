import { ExportIcon } from '@phosphor-icons/react';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';

import { GRID_BREAKPOINTS } from '@waldur/core/constants';
import { translate } from '@waldur/i18n';

import { EXPORT_OPTIONS } from './exporters/constants';
import { TableColumnButton } from './TableColumnsButton';
import { TableDisplayModeButton } from './TableDisplayModeButton';
import { TableExportButton } from './TableExportButton';
import { TableFilterButton } from './TableFilterButton';
import { TableMoreActions } from './TableMoreActions';
import { TableProps, TableDropdownItem } from './types';
import { useExportDialog } from './useExportDialog';

interface TableButtonsProps extends TableProps {
  toggleFilterMenu?(): void;
  showFilterMenuToggle?: boolean;
}

export const TableButtons: FunctionComponent<TableButtonsProps> = (props) => {
  const openExportDialog = useExportDialog();

  const [dropdownActions, setDropdownActions] = useState<TableDropdownItem[]>(
    [],
  );

  const isSm = useMediaQuery({ maxWidth: GRID_BREAKPOINTS.sm });

  const showExportInDropdown =
    (props.enableExport && props.showExportInDropdown) ||
    (props.enableExport && isSm);

  useEffect(() => {
    setDropdownActions(
      (props.dropdownActions && props.dropdownActions instanceof Array
        ? props.dropdownActions.filter(
            (x) => !x.isMobileAction || (x.isMobileAction && isSm),
          )
        : []
      ).concat(
        showExportInDropdown
          ? [
              {
                label: translate('Export'),
                iconNode: <ExportIcon />,
                children: EXPORT_OPTIONS.map(({ value, label }) => ({
                  label: label,
                  action: () => openExportDialog(props.table, value, props),
                })),
              },
            ]
          : [],
      ),
    );
  }, [props.dropdownActions, showExportInDropdown, isSm]);

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
    dropdownActions?.length ||
    props.enableExport ||
    props.filters ||
    Boolean(props.gridItem && props.columns.length) ||
    props.hasOptionalColumns;

  return (
    <>
      {showDefaultActions && (
        <div className="d-flex justify-content-sm-end flex-wrap flex-sm-nowrap text-nowrap gap-3 flex-grow-1 flex-sm-grow-0">
          {/* Filter */}
          {['menu', 'sidebar'].includes(props.filterPosition) &&
            props.filters && (
              <TableFilterButton
                onClick={onClickFilterButton}
                hasFilter={!!props.filtersStorage?.length}
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
            <TableMoreActions actions={dropdownActions} />
          ) : (
            <>
              {props.enableExport && <TableExportButton {...props} />}
              {dropdownActions.length > 0 && (
                <TableMoreActions actions={dropdownActions} />
              )}
            </>
          )}
        </div>
      )}
      {(!props.standalone || isSm) && props.tableActions}
    </>
  );
};
