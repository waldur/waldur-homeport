import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';
import { TableColumnButton } from './TableColumnsButton';
import { TableDisplayModeButton } from './TableDisplayModeButton';
import { TableExportButton } from './TableExportButton';
import { TableFilterButton } from './TableFilterButton';
import { TableMoreActions } from './TableMoreActions';
import { TableDropdownItem } from './types';

import './TableButtons.scss';

interface TableButtonsProps extends TableProps {
  toggleFilterMenu?(): void;
  showFilterMenuToggle?: boolean;
}

export const TableButtons: FunctionComponent<TableButtonsProps> = (props) => {
  const [dropdownActions, setDropdownActions] = useState<TableDropdownItem[]>(
    [],
  );
  const showExportInDropdown = Boolean(
    props.enableExport && props.actions && props.dropdownActions?.length,
  );

  useEffect(() => {
    setDropdownActions(
      (props.dropdownActions && props.dropdownActions instanceof Array
        ? props.dropdownActions
        : []
      ).concat(
        showExportInDropdown
          ? [
              {
                label: translate('Export'),
                icon: 'fa fa-download',
                children: [
                  {
                    label: translate('Copy to clipboard'),
                    action: () => props.openExportDialog('clipboard', props),
                  },
                  {
                    label: 'CSV',
                    action: () => props.openExportDialog('csv', props),
                  },
                  {
                    label: 'PDF',
                    action: () => props.openExportDialog('pdf', props),
                  },
                  {
                    label: 'Excel',
                    action: () => props.openExportDialog('excel', props),
                  },
                ],
              },
            ]
          : [],
      ),
    );
  }, [props.dropdownActions, props.openExportDialog, showExportInDropdown]);

  const onClickFilterButton = useCallback(
    (event) => {
      if (props.filterPosition === 'sidebar') {
        props.openFiltersDrawer(props.filters);
      } else {
        if (!props.filtersStorage?.length) {
          props.toggleFilterMenu();
        }
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

  if (!props.selectedRows?.length) {
    return (
      <>
        {['menu', 'sidebar'].includes(props.filterPosition) &&
          props.filters && <TableFilterButton onClick={onClickFilterButton} />}
        {!props.standalone && props.actions}
        {Boolean(props.gridItem && props.columns.length) && (
          <TableDisplayModeButton
            mode={props.mode}
            setDisplayMode={props.setDisplayMode}
          />
        )}
        {props.hasOptionalColumns && <TableColumnButton {...props} />}
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
      </>
    );
  } else {
    return (
      props.multiSelectActions &&
      React.createElement(props.multiSelectActions, {
        rows: props.selectedRows,
        refetch: () => {
          props.fetch();
          props.resetSelection();
        },
      })
    );
  }
};
