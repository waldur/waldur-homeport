import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';
import { getProject } from '@waldur/workspace/selectors';

import { ProjectExpandableRow } from './ProjectExpandableRow';
import { ProjectHoverableRow } from './ProjectHoverableRow';

const exportRow = (row) => [
  row.name,
  row.customer_name,
  row.resources_count || 0,
  row.expiration_time ? formatDateTime(row.expiration_time) : DASH_ESCAPE_CODE,
  formatDateTime(row.created),
];

const exportFields = [
  'Project',
  'Organization',
  'Resources',
  'End date',
  'Created',
];

export const BaseProjectsList: FunctionComponent<{
  filter;
  filters?;
  hasActionBar?;
  standalone?;
}> = ({ filter, filters, hasActionBar = true, standalone = false }) => {
  const currentProject = useSelector(getProject);
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'name',
    filter,
    exportRow,
    exportFields,
  });

  const columns = [
    {
      title: translate('Name'),
      orderField: 'name',
      render: ProjectLink,
    },
    {
      title: translate('Organization'),
      orderField: 'customer_name',
      render: ({ row }) =>
        row.customer_uuid ? (
          <Link
            state="organization.dashboard"
            params={{ uuid: row.customer_uuid }}
            label={row.customer_name}
          />
        ) : (
          <>{row.customer_name}</>
        ),
    },
    {
      title: translate('Resources'),
      render: ({ row }) => <>{row.resources_count || 0}</>,
    },
    {
      title: translate('End date'),
      orderField: 'end_date',
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDate(row.created) : DASH_ESCAPE_CODE}</>
      ),
    },
  ];

  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Cost estimation'),
      render: ({ row }) => (
        <>
          {defaultCurrency(
            (row.billing_price_estimate && row.billing_price_estimate.total) ||
              0,
          )}
        </>
      ),
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      title={translate('Projects')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      rowClass={({ row }) =>
        currentProject?.uuid === row.uuid ? 'bg-gray-200' : ''
      }
      hoverableRow={ProjectHoverableRow}
      expandableRow={ProjectExpandableRow}
      fullWidth={true}
      filters={filters}
      hasActionBar={hasActionBar}
      standalone={standalone}
    />
  );
};
