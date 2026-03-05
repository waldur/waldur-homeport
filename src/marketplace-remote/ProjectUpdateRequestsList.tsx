import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { marketplaceProjectUpdateRequestsList } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';
import { useTitle } from '@waldur/navigation/title';
import { createFetcher } from '@waldur/table/api';
import {
  MarketplaceProjectUpdateRequestsFilter as ProjectUpdateRequestListFilter,
  selectMarketplaceProjectUpdateRequestsFilter as selectProjectUpdateRequestListFilter,
} from '@waldur/table/generated/MarketplaceProjectUpdateRequestsFilter';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectUpdateRequestExpandable } from './ProjectUpdateRequestExpandable';

const getStates = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'canceled', label: translate('Canceled') },
];

export const ProjectUpdateRequestsList: FunctionComponent = () => {
  useTitle(translate('Project updates'));
  const filterState = useSelector(selectProjectUpdateRequestListFilter);
  const project = useSelector(getProject);
  const filter = {
    ...filterState,
    project_uuid: project.uuid,
  };
  const props = useTable({
    table: 'marketplace-project-update-requests',
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
    />
  );
};
