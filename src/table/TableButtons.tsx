import { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { OfferingImportDialog } from '@waldur/marketplace/offerings/actions/OfferingImportDialog';
import { openModalDialog } from '@waldur/modal/actions';
import { TableLoadingSpinnerContainer } from '@waldur/table/TableLoadingSpinnerContainer';

import { TableDropdowns } from './TableDropdowns';
import { TableExportButton } from './TableExportButton';
import { TableRefreshButton } from './TableRefreshButton';

import './TableButtons.scss';

export const TableButtons: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  const [allActions, setAllActions] = useState<any>([]);

  useEffect(() => {
    setAllActions([
      ...(props.actions || []),
      props.rows?.length > 0 &&
        props.enableExport && { label: 'Export', icon: 'fa fa-plus' },
      {
        label: 'Refresh',
        icon: 'fa fa-plus',
        handler: () => {
          dispatch(openModalDialog(OfferingImportDialog, { size: 'lg' }));
        },
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <i className={item.icon} /> {translate(item.label)}
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
