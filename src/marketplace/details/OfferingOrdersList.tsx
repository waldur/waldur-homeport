import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';

import { formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { OrderProviderActions } from '@waldur/marketplace/orders/actions/OrderProviderActions';
import { OrderStateCell } from '@waldur/marketplace/orders/list/OrderStateCell';
import { OrderTypeCell } from '@waldur/marketplace/orders/list/OrderTypeCell';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
import { Offering } from '@waldur/marketplace/types';
import { OrderExpandableRow } from '@waldur/navigation/header/confirmation-drawer/OrderExpandableRow';
import { Table, createFetcher } from '@waldur/table';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

import { OrdersFilter } from '../orders/list/OrdersFilter';

import { TABLE_OFFERING_ORDERS } from './constants';

interface OwnProps {
  offering: Offering;
}
interface OfferingOrderFilter {
  state?: { value: string };
  type?: { value: string };
}

export const OfferingOrdersList: FunctionComponent<OwnProps> = ({
  offering,
}) => {
  const filterValues: OfferingOrderFilter = useSelector(
    getFormValues('OrderFilter'),
  );

  const filter = useMemo(() => {
    const filter: Record<string, string> = {
      offering_uuid: offering.uuid,
    };
    if (filterValues) {
      if (filterValues.state) {
        filter.state = filterValues.state.value;
      }
      if (filterValues.type) {
        filter.type = filterValues.type.value;
      }
    }
    return filter;
  }, [filterValues, offering]);

  const props = useTable({
    table: TABLE_OFFERING_ORDERS,
    fetchData: createFetcher('marketplace-orders'),
    filter,
  });

  const columns = [
    {
      title: translate('Resource'),
      render: ResourceNameField,
    },
    {
      title: translate('Project'),
      render: ({ row }) => <>{row.project_name}</>,
    },
    {
      title: translate('Created at'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
    },
    {
      title: translate('Type'),
      render: OrderTypeCell,
    },
    {
      title: translate('State'),
      render: OrderStateCell,
    },
    {
      title: translate('Cost'),
      render: ({ row }) => <>{defaultCurrency(row.cost)}</>,
    },
    {
      title: translate('Plan'),
      render: ({ row }) => <>{renderFieldOrDash(row.plan_name)}</>,
    },
  ];

  return (
    <Table
      {...props}
      columns={columns}
      title={translate('Orders')}
      verboseName={translate('Orders')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      initialPageSize={5}
      hoverableRow={OrderProviderActions}
      expandableRow={OrderExpandableRow}
      hasPagination={true}
      filters={<OrdersFilter />}
    />
  );
};
