import { FC, memo, useMemo } from 'react';
import {
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  Resource,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
  offeringUuid: string;
}

export const OfferingResourcesTable: FC<OfferingResourcesTableProps> = memo(
  ({ offeringUuid }) => {
    const filter = useMemo(
      () => ({
        offering_uuid: [offeringUuid],
      }),
      [offeringUuid],
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
          render: ({ row }) => <>{row.project_name || '-'}</>,
        },
        {
          title: translate('Category'),
          render: ({ row }) => <>{row.category_title}</>,
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
      table: 'OfferingResources-' + offeringUuid,
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
