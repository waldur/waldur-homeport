import { AddressBook } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

const CreditUsageDialog = lazyComponent(
  () => import('./CreditUsageDialog'),
  'CreditUsageDialog',
);

export const CreditUsageButton = ({ row }) => {
  const dispatch = useDispatch();
  const openDialog = useCallback(
    () =>
      dispatch(
        openModalDialog(CreditUsageDialog, {
          size: 'xl',
          creditUuid: row.uuid,
          ...(row?.project_uuid
            ? { projectUuid: row.project_uuid }
            : { customerUuid: row.customer_uuid }),
        }),
      ),
    [dispatch, row],
  );
  return (
    <Dropdown.Item as="button" onClick={openDialog}>
      <span className="svg-icon svg-icon-2">
        <AddressBook weight="bold" />
      </span>
      {translate('Credit usage')}
    </Dropdown.Item>
  );
};
