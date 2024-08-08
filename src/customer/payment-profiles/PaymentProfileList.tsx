import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { StateIndicator } from '@waldur/core/StateIndicator';
import { PAYMENT_PROFILES_TABLE } from '@waldur/customer/details/constants';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import {
  getCustomer,
  isStaff as isStaffSelector,
  isSupport as isSupportSelector,
} from '@waldur/workspace/selectors';

import { PaymentProfileActions } from './PaymentProfileActions';
import { PaymentProfileCreateButton } from './PaymentProfileCreateButton';

export const PaymentProfileList: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const isStaff = useSelector(isStaffSelector);
  const isSupport = useSelector(isSupportSelector);

  const filter = useMemo(
    () => ({
      organization_uuid: customer.uuid,
      o: 'is_active',
    }),
    [customer],
  );

  const props = useTable({
    table: PAYMENT_PROFILES_TABLE,
    fetchData: createFetcher('payment-profiles'),
    filter,
  });

  const tooltipAndDisabledAttributes = {
    disabled: isSupport && !isStaff,
    tooltip:
      isSupport && !isStaff
        ? translate('You must be staff to modify payment profiles')
        : null,
  };

  const columns = [
    {
      title: translate('Type'),
      render: ({ row }) => row.payment_type_display,
      orderField: 'payment_type',
    },
    {
      title: translate('Name'),
      render: ({ row }) => row.name,
      orderField: 'name',
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.is_active ? translate('Enabled') : translate('Disabled')}
          variant={row.is_active ? 'success' : 'plain'}
        />
      ),
      orderField: 'is_active',
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('payment profiles')}
      showPageSizeSelector={true}
      tableActions={
        <PaymentProfileCreateButton
          refetch={props.fetch}
          {...tooltipAndDisabledAttributes}
        />
      }
      rowActions={({ row }) => (
        <PaymentProfileActions
          profile={row}
          refetch={props.fetch}
          tooltipAndDisabledAttributes={tooltipAndDisabledAttributes}
        />
      )}
    />
  );
};
