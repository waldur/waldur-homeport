import { FunctionComponent, useMemo } from 'react';
import { paymentProfilesList } from 'waldur-js-client';

import { StateIndicator } from '@/core/StateIndicator';
import { PAYMENT_PROFILES_TABLE } from '@/customer/details/constants';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useCustomer, useUser } from '@/workspace/hooks';

import { PaymentProfileActions } from './PaymentProfileActions';
import { PaymentProfileCreateButton } from './PaymentProfileCreateButton';

export const PaymentProfileList: FunctionComponent<{}> = () => {
  const customer = useCustomer();
  const user = useUser();
  const isStaff = user?.is_staff;
  const isSupport = user?.is_support;

  const filter = useMemo(
    () => ({
      organization_uuid: customer.uuid,
      o: 'is_active',
    }),
    [customer],
  );

  const props = useTable({
    table: PAYMENT_PROFILES_TABLE,
    fetchData: createFetcher(paymentProfilesList),
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
      copyField: (row) => row.name,
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <StateIndicator
          label={row.is_active ? translate('Enabled') : translate('Disabled')}
          variant={row.is_active ? 'success' : 'default'}
          outline
          pill
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
