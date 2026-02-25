import { useQuery } from '@tanstack/react-query';
import { uniq } from 'lodash-es';
import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  marketplacePublicOfferingsList,
  marketplaceResourcesList,
  Resource,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { NON_TERMINATED_STATES } from '@waldur/marketplace/resources/list/constants';
import { ResourceActionsButton } from '@waldur/marketplace/resources/list/ResourceActionsButton';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceTerminationDateField } from '@waldur/marketplace/resources/list/ResourceTerminationDateField';
import { resourcesListRequiredFields } from '@waldur/marketplace/resources/list/utils';
import { createFetcher } from '@waldur/table/api';
import {
  ProjectResourcesFilter,
  selectProjectResourcesFilter,
} from '@waldur/table/generated/ProjectResourcesFilter';
import Table from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { getProject } from '@waldur/workspace/selectors';

import { ResourceQuotaField } from './ResourceQuotaField';
import { ResourceRateField } from './ResourceRateField';
import { withResourceComponentsLoader } from './withResourceComponentsLoader';

const QuotaField = withResourceComponentsLoader(ResourceQuotaField);
const RenewalField = withResourceComponentsLoader(({ row, component }) =>
  row.renewal_date?.[component.type]
    ? formatDate(row.renewal_date[component.type])
    : 'N/A',
);

const mandatoryFields = resourcesListRequiredFields(false).concat([
  'offering_uuid',
  'offering_name',
  'limit_usage',
  'limits',
  'current_usages',
  'state',
  'renewal_date',
  'plan_uuid',
  'plan_unit',
]);

export const ProjectLimitUsageBasedResources: FC<{ showCost?: boolean }> = ({
  showCost,
}) => {
  const project = useSelector(getProject);

  const stateFilter = useSelector(selectProjectResourcesFilter);
  const filter = useMemo(
    () => ({
      project_uuid: project.uuid,
      ...stateFilter,
      state: NON_TERMINATED_STATES,
      only_limit_based: true,
      component_count: 1,
    }),
    [project, stateFilter],
  );

  const tableProps = useTable({
    table: 'ProjectLimitBasedResources',
    fetchData: createFetcher(marketplaceResourcesList),
    queryField: 'query',
    filter,
    mandatoryFields,
  });

  // Generate a key to fetch components of offerings
  const componentsKey = useMemo(
    () => uniq(tableProps.rows.map((row) => row.offering_uuid.slice(0, 5))),
    [tableProps],
  );

  const { data, refetch, isLoading, error } = useQuery({
    queryKey: ['offerings-components', ...componentsKey],
    queryFn: () =>
      componentsKey?.length
        ? marketplacePublicOfferingsList({
            query: {
              uuid_list: uniq(
                tableProps.rows.map((row) => row.offering_uuid),
              ).join(','),
              field: ['uuid', 'components', 'plans'],
            },
          }).then((response) => response.data)
        : [],
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });

  const columns = useMemo(
    () =>
      [
        {
          title: translate('Name'),
          render: ResourceNameField,
          orderField: 'name',
        },
        {
          title: translate('Offering'),
          render: ({ row }) => <>{row.offering_name}</>,
          filter: 'offering',
          inlineFilter: (row) => ({
            name: row.offering_name,
            uuid: row.offering_uuid,
          }),
        },
        {
          title: translate('Used/total units'),
          render: ({ row }) => (
            <QuotaField
              row={row}
              type="limit"
              data={data}
              isLoading={isLoading}
            />
          ),
        },
        {
          title: translate('Renewal'),
          render: ({ row }) => (
            <RenewalField
              row={row}
              type="limit"
              data={data}
              isLoading={isLoading}
            />
          ),
        },
        showCost && {
          title: translate('Rate'),
          render: ({ row }) => (
            <ResourceRateField row={row} data={data} isLoading={isLoading} />
          ),
        },
        isFeatureVisible(MarketplaceFeatures.show_resource_end_date) && {
          title: translate('Expiration'),
          render: ({ row }) => (
            <ResourceTerminationDateField row={row} format />
          ),
        },
        {
          title: translate('Usage'),
          render: ({ row }) => (
            <QuotaField
              row={row}
              type="limit"
              data={data}
              isLoading={isLoading}
              progressBar
            />
          ),
        },
      ].filter(Boolean) as Column<Resource>[],
    [data, isLoading, showCost],
  );

  return (
    <div className="mb-5">
      {error && !isLoading && <LoadingErred loadData={refetch} />}
      <Table<Resource>
        {...tableProps}
        filters={<ProjectResourcesFilter project={project} />}
        columns={columns}
        title={translate('Active limit-based resources')}
        subtitle={translate('Resources with a fixed allocation limit')}
        verboseName={translate('limit-based resources')}
        initialSorting={{ field: 'created', mode: 'desc' }}
        initialPageSize={5}
        rowActions={({ row }) => (
          <ResourceActionsButton row={row} refetch={tableProps.fetch} />
        )}
        hasActionBar={true}
        cardBordered={true}
        fullWidth={false}
        minHeight="auto"
        hasQuery
        showPageSizeSelector
      />
    </div>
  );
};
