import React, { FunctionComponent, useEffect, useState } from 'react';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';
import { TableColumnButton } from './TableColumnsButton';
import { TableExportButton } from './TableExportButton';
import { TableFilterButton } from './TableFilterButton';
import { TableMoreActions } from './TableMoreActions';
import { TableDropdownItem } from './types';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<TableProps> = (props) => {
  const [dropdownActions, setDropdownActions] = useState<TableDropdownItem[]>(
    [],
  );
  const showExportButton = props.rows?.length > 0 && props.enableExport;
  const showExportInDropdown = Boolean(
    showExportButton && props.actions && props.dropdownActions?.length,
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

  if (!props.selectedRows?.length) {
    return (
      <>
        {props.filterPosition === 'sidebar' && props.filters && (
          <TableFilterButton
            onClick={() => props.openFiltersDrawer(props.filters)}
          />
        )}
        {props.actions}
        {props.hasOptionalColumns && <TableColumnButton {...props} />}
        {showExportInDropdown ? (
          <TableMoreActions actions={dropdownActions} />
        ) : (
          <>
            {showExportButton && <TableExportButton {...props} />}
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
