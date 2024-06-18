import { FunctionComponent } from 'react';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectLink } from '@waldur/project/ProjectLink';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { useTable } from '@waldur/table/utils';

import { ProjectExpandableRow } from './ProjectExpandableRow';

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
  standalone?;
}> = ({ filter, filters, standalone = false }) => {
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
      keys: ['name'],
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
      keys: ['customer_uuid', 'customer_name'],
    },
    {
      title: translate('Organization abbreviation'),
      render: ({ row }) => <>{row.customer_abbreviation || DASH_ESCAPE_CODE}</>,
      optional: true,
      keys: ['customer_abbreviation'],
    },
    {
      title: translate('Resources'),
      render: ({ row }) => <>{row.resources_count || 0}</>,
      keys: ['resources_count', 'marketplace_resource_count'],
    },
    {
      title: translate('End date'),
      orderField: 'end_date',
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['end_date'],
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDate(row.created) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['created'],
    },
    {
      title: translate('Backend ID'),
      render: ({ row }) => <>{row.backend_id || DASH_ESCAPE_CODE}</>,
      optional: true,
      keys: ['backend_id'],
    },
    {
      title: translate('UUID'),
      render: ({ row }) => <>{row.uuid}</>,
      optional: true,
      keys: ['uuid'],
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
      keys: ['billing_price_estimate'],
    });
  }

  if (isFeatureVisible(ProjectFeatures.oecd_fos_2007_code)) {
    columns.push({
      title: translate('OECD FoS code'),
      render: ({ row }) => (
        <>
          {row.oecd_fos_2007_code
            ? `${row.oecd_fos_2007_code}. ${row.oecd_fos_2007_label}`
            : DASH_ESCAPE_CODE}
        </>
      ),
      optional: true,
      keys: ['oecd_fos_2007_code', 'oecd_fos_2007_label'],
    });
  }

  if (isFeatureVisible(ProjectFeatures.show_industry_flag)) {
    columns.push({
      title: translate('Industry project'),
      render: ({ row }) => (
        <>{row.is_industry ? translate('Yes') : translate('No')}</>
      ),
      optional: true,
      keys: ['is_industry'],
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
      expandableRow={ProjectExpandableRow}
      filters={filters}
      standalone={standalone}
      hasOptionalColumns
    />
  );
};
