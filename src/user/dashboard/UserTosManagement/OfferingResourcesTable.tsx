import { FC, memo, useMemo } from 'react';
import {
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { ResourceNameField } from '@/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

const mandatoryFields: MarketplaceResourcesListData['query']['field'] = [
  'uuid',
  'name',
  'category_title',
  'offering_name',
  'project_name',
  'created',
  'state',
  'backend_metadata',
];

interface OfferingResourcesTableProps {
  offering: { uuid: string };
}

export const OfferingResourcesTable: FC<OfferingResourcesTableProps> = memo(
  ({ offering }) => {
    const filter = useMemo(
      () => ({
        offering_uuid: [offering.uuid],
      }),
      [offering.uuid],
    );

    const columns = useMemo(
      () => [
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Project'),
          render: ({ row }) => <>{renderFieldOrDash(row.project_name)}</>,
        },
        {
          title: translate('Category'),
          render: ({ row }) => <>{renderFieldOrDash(row.category_title)}</>,
        },
        {
          title: translate('Created'),
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
      ],
      [],
    );

    const tableProps = useTable({
      table: 'OfferingResources-' + offering.uuid,
      fetchData: createFetcher(marketplaceResourcesList),
      filter,
      mandatoryFields,
    });

    return (
      <Table<Resource>
        {...tableProps}
        columns={columns}
        verboseName={translate('Resources')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        hasActionBar={false}
        hoverShadow={false}
        initialPageSize={5}
        minHeight="auto"
      />
    );
  },
);
