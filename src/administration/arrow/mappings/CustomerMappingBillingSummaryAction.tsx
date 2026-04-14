import { ChartBarIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
