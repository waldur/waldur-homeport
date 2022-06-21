import { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { TableDropdowns } from './TableDropdowns';
import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<any> = (props) => {
  const [allActions, setAllActions] = useState<any>([]);

  useEffect(() => {
    setAllActions([
      ...(props.actions || []),
      props.rows?.length > 0 &&
        props.enableExport && {
          label: translate('Export'),
          icon: 'fa fa-plus',
        },
    ]);
  }, [props]);

  return (
    <>
      {allActions?.length > 2 ? (
        <TableDropdowns {...props} actions={allActions} />
      ) : (
        <>
          {props.actions?.length &&
            props.actions?.map((item) => (
              <Button key={item.label} className="me-3">
                <i className={item.icon} /> {item.label}
              </Button>
            ))}
          {props.rows?.length > 0 && props.enableExport && (
            <TableExportButton {...props} />
          )}
          <TableRefreshButton {...props} />
        </>
      )}
      <TableLoadingSpinnerContainer {...props} />
    </>
  );
};
