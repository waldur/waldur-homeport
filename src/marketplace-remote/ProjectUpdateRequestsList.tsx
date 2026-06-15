import { FunctionComponent, useMemo } from 'react';
import { marketplaceProjectUpdateRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import {
  MarketplaceProjectUpdateRequestsFilter as ProjectUpdateRequestListFilter,
  selectMarketplaceProjectUpdateRequestsFilter as selectProjectUpdateRequestListFilter,
  MarketplaceProjectUpdateRequestsFilterFormId,
} from '@/table/generated/MarketplaceProjectUpdateRequestsFilter';
import Table from '@/table/Table';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useProject } from '@/workspace/hooks';

import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

const getStates = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'canceled', label: translate('Canceled') },
];

export const ProjectUpdateRequestsList: FunctionComponent = () => {
  useTitle(translate('Project updates'));
  const values = useFilterValues('marketplace-project-update-requests');

  const filterState = useMemo(
    () => selectProjectUpdateRequestListFilter(values),
    [values],
  );

  const project = useProject();
  const filter = {
    ...filterState,
    project_uuid: project.uuid,
  };
  const props = useTable({
    table: 'marketplace-project-update-requests',
    syncFiltersToURL: true,
    fetchData: createFetcher(marketplaceProjectUpdateRequestsList),
    filter,
  });
  return (
    <Table
      {...props}
      columns={[
        {
          title: translate('Offering'),
          render: ({ row }) => row.offering_name,
        },
        {
          title: translate('State'),
          render: ({ row }) => row.state,
          filter: 'state',
          inlineFilter: (row) =>
            getStates().filter((s) => s.value === row.state),
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
          orderField: 'created',
        },
        {
          title: translate('Reviewed at'),
          render: ({ row }) =>
            row.reviewed_at ? formatDateTime(row.reviewed_at) : 'N/A',
        },
        {
          title: translate('Reviewed by'),
          render: ({ row }) => renderFieldOrDash(row.reviewed_by_full_name),
        },
      ]}
      expandableRow={ProjectUpdateRequestExpandable}
      verboseName={translate('requests')}
      filters={<ProjectUpdateRequestListFilter />}
      formId={MarketplaceProjectUpdateRequestsFilterFormId}
    />
  );
};
