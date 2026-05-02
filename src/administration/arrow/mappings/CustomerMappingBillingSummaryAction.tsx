import { ChartBarIcon } from '@phosphor-icons/react';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

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
    <ActionItem
      title={translate('Billing summary')}
      action={() => {
        openDialog(CustomerBillingSummaryDialog, {
          resolve: { mapping: row },
          size: 'xl',
        });
      }}
      iconNode={<ChartBarIcon weight="bold" />}
    />
  );
};
