import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  marketplaceResourcesList,
  MarketplaceResourcesListData,
  Resource,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ARROW_FORM_NAMES } from '../constants';

import { ArrowResourceImportButton } from './ArrowResourceImportButton';
import { ArrowResourcesActions } from './ArrowResourcesActions';
import { ArrowResourcesFilter } from './ArrowResourcesFilter';

const filtersSelector = createSelector(
  getFormValues(ARROW_FORM_NAMES.arrowResourcesFilter),
  (filterValues: any) => {
    const result: MarketplaceResourcesListData['query'] = {
      state: NON_TERMINATED_STATES,
    };
    if (filterValues?.organization) {
      result.customer_uuid = filterValues.organization.uuid;
    }
    if (filterValues?.project) {
      result.project_uuid = filterValues.project.uuid;
    }
    return result;
  },
);

const mandatoryFields: Array<keyof Resource> = [
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
];

interface ArrowResourcesListProps {
  settings?: { uuid: string } | null;
}

export const ArrowResourcesList: FunctionComponent<
  ArrowResourcesListProps
> = () => {
  const formFilter = useSelector(filtersSelector);

  const filter = useMemo(
    () => ({
      ...formFilter,
    }),
    [formFilter],
  );

  const tableProps = useTable({
    table: 'ArrowResources',
    fetchData: createFetcher(marketplaceResourcesList),
    filter,
    queryField: 'query',
    mandatoryFields,
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
              <code className="text-dark">{row.backend_id}</code>
            ) : (
              <span className="text-muted">{DASH_ESCAPE_CODE}</span>
            ),
        },
        {
          title: translate('State'),
          render: ({ row }) => <ResourceStateField resource={row} pill />,
        },
      ]}
      title={translate('Resources')}
      verboseName={translate('resources')}
      initialSorting={{ field: 'name', mode: 'asc' }}
      hasQuery
      filters={<ArrowResourcesFilter />}
      tableActions={<ArrowResourceImportButton refetch={tableProps.fetch} />}
      rowActions={({ row }) => (
        <ArrowResourcesActions row={row} refetch={tableProps.fetch} />
      )}
    />
  );
};
