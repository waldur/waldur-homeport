import React, { FunctionComponent, useEffect, useState } from 'react';

import { translate } from '@waldur/i18n';

import { TableProps } from './Table';
import { TableExportButton } from './TableExportButton';
import { TableMoreActions } from './TableMoreActions';
import { TableDropdownItem } from './types';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<any> = (props: TableProps) => {
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
                    action: () => props.exportAs('clipboard'),
                  },
                  {
                    label: 'CSV',
                    action: () => props.exportAs('csv'),
                  },
                  {
                    label: 'PDF',
                    action: () => props.exportAs('pdf'),
                  },
                  {
                    label: 'Excel',
                    action: () => props.exportAs('excel'),
                  },
                ],
              },
            ]
          : [],
      ),
    );
  }, [props.dropdownActions, props.exportAs, showExportInDropdown]);

  if (!props.selectedRows?.length) {
    return (
      <>
        {props.actions}
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
