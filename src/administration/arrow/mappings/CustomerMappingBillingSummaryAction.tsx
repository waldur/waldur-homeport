import { ChartBarIcon } from '@phosphor-icons/react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { Menu } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

const CustomerBillingSummaryDialog = lazyComponent(() =>
  import('./CustomerBillingSummaryDialog').then((module) => ({
    default: module.CustomerBillingSummaryDialog,
  })),
);

export const CustomerMappingBillingSummaryAction = ({
  row,
}: {
  row: ArrowCustomerMapping;
}) => {
  const { openDialog } = useModal();

  return (
    <Menu.Item
      icon={<ChartBarIcon weight="bold" />}
      onSelect={() => {
        openDialog(CustomerBillingSummaryDialog, {
          resolve: { mapping: row },
          size: 'xl',
        });
      }}
    >
      {translate('Billing summary')}
    </Menu.Item>
  );
};
