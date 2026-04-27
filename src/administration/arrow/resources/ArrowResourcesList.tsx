import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { marketplaceResourcesList, Resource } from 'waldur-js-client';

import { translate } from '@/i18n';
import { NON_TERMINATED_STATES } from '@/marketplace/resources/list/constants';
import { ResourceStateField } from '@/marketplace/resources/list/ResourceStateField';
import { ResourceLink } from '@/resource/ResourceLink';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  MarketplaceResourcesFilter,
  selectMarketplaceResourcesFilter,
  MarketplaceResourcesFilterFormId,
} from '@/table/generated/MarketplaceResourcesFilter';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { ArrowResourceImportButton } from './ArrowResourceImportButton';
import { ArrowResourcesActions } from './ArrowResourcesActions';

interface ArrowResourcesListProps {
  settings?: { uuid: string } | null;
}

export const ArrowResourcesList: FunctionComponent<
  ArrowResourcesListProps
> = () => {
  const filterValues = useSelector(selectMarketplaceResourcesFilter);
  const formValues: any = useSelector(
    getFormValues(MarketplaceResourcesFilterFormId),
  );

  const filter = useMemo(
    () => ({
      state: NON_TERMINATED_STATES,
      ...filterValues,
    }),
    [filterValues],
  );

  const tableProps = useTable({
    table: 'ArrowResources',
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
    queryField: 'query',
    mandatoryFields: [
      'uuid',
      'name',
      'state',
      'backend_id',
      'customer_name',
      'customer_uuid',
      'project_name',
      'project_uuid',
      'backend_metadata',
      'provider_uuid',
    ],
  });

  return (
    <Table<Resource>
      {...tableProps}
      columns={[
        {
          title: translate('Resource'),
          render: ({ row }) => (
            <ResourceLink
              uuid={row.uuid}
              label={
                <span className="fw-bold">{row.name || DASH_ESCAPE_CODE}</span>
              }
            />
          ),
        },
        {
          title: translate('Organization'),
          render: ({ row }) => (
            <span>{row.customer_name || DASH_ESCAPE_CODE}</span>
          ),
          filter: 'organization',
        },
        {
          title: translate('Project'),
          render: ({ row }) => (
            <span>{row.project_name || DASH_ESCAPE_CODE}</span>
          ),
          filter: 'project',
        },
        {
          title: translate('Backend ID'),
          render: ({ row }) =>
            row.backend_id ? (
              <span>{row.backend_id}</span>
            ) : (
              <span className="text-muted">{DASH_ESCAPE_CODE}</span>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => (
            <ResourceStateField resource={row} pill outline />
          ),
        },
      ]}
      title={translate('Resources')}
      verboseName={translate('resources')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasQuery
      filters={
        <MarketplaceResourcesFilter
          organizationUuid={formValues?.organization?.uuid}
        />
      }
      tableActions={<ArrowResourceImportButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <ArrowResourcesActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
