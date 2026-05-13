import { PencilSimpleIcon } from '@phosphor-icons/react';
import { Dropdown } from 'react-bootstrap';
import { CustomerCredit } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const CustomerCreditDialog = lazyComponent(() =>
  import('./CustomerCreditDialog').then((module) => ({
    default: module.CustomerCreditDialog,
  })),
);

export const EditCreditButton = ({
  row,
  refetch,
}: {
  row: CustomerCredit;
  refetch;
}) => {
  const { openDialog } = useModal();

  const openCreditFormDialog = () =>
    openDialog(CustomerCreditDialog, {
      size: 'lg',
      resolve: {
        credit: row,
        refetch,
      },
    });

  return (
    <Dropdown.Item as="button" onClick={openCreditFormDialog}>
      <span className="svg-icon svg-icon-2">
        <PencilSimpleIcon weight="bold" />
      </span>
      {translate('Edit')}
    </Dropdown.Item>
  );
};
