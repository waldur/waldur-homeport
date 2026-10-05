import { PencilSimpleIcon } from '@phosphor-icons/react';
import { CustomerCredit } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

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
    <Menu.Item
      icon={<PencilSimpleIcon weight="bold" />}
      onSelect={openCreditFormDialog}
    >
      {translate('Edit')}
    </Menu.Item>
  );
};
