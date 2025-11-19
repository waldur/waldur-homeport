import { FC, useMemo } from 'react';
import {
  ProviderPlanDetails,
  OfferingComponent,
  marketplaceResourcesList,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceNameField } from '@waldur/marketplace/orders/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { ResourcesListActions } from '@waldur/user/affiliations/ResourcesListActions';

interface OwnProps {
  row: ProviderPlanDetails;
  components: OfferingComponent[];
}

export const PlanResourcesTable: FC<OwnProps> = (props) => {
  const filter = useMemo(
    () => ({
      plan_uuid: props.row.uuid,
    }),
    [props.row],
  );
  const tableProps = useTable({
    table: `PlanResourcesTable-${props.row.uuid}`,
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={[
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Customer'),
          render: ({ row }) => <>{row.customer_name}</>,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} pill outline />
          ),
          orderField: 'state',
        },
      ]}
      verboseName={translate('Resources')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasActionBar={false}
      hoverShadow={false}
      initialPageSize={5}
      minHeight="auto"
      rowActions={ResourcesListActions}
    />
  );
};
