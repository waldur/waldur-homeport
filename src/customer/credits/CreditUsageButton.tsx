import { AddressBookIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Dropdown } from 'react-bootstrap';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const CreditUsageDialog = lazyComponent(() =>
  import('./CreditUsageDialog').then((module) => ({
    default: module.CreditUsageDialog,
  })),
);

export const CreditUsageButton = ({ row, scope }) => {
  const { openDialog: openModal } = useModal();
  const openDialog = useCallback(
    () =>
      openModal(CreditUsageDialog, {
        size: 'xl',
        creditUuid: row.uuid,
        ...(row?.project_uuid
          ? { projectUuid: row.project_uuid, projectName: row.project_name }
          : {
              customerUuid: row.customer_uuid,
              customerName: row.customer_name,
            }),
        scope,
      }),
    [row],
  );
  return (
    <Dropdown.Item as="button" onClick={openDialog}>
      <span className="svg-icon svg-icon-2">
        <AddressBookIcon weight="bold" />
      </span>
      {translate('Credit usage')}
    </Dropdown.Item>
  );
};
