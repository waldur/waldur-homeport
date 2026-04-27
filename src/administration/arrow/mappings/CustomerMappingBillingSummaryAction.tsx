import { ChartBarIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
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
  const dispatch = useDispatch();

  const handleClick = () => {
    dispatch(
      openModalDialog(CustomerBillingSummaryDialog, {
        resolve: { mapping: row },
        size: 'xl',
      }),
    );
  };

  return (
    <ActionItem
      title={translate('Billing summary')}
      action={handleClick}
      iconNode={<ChartBarIcon weight="bold" />}
    />
  );
};
