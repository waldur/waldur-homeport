import { FunctionComponent } from 'react';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { Table, createFetcher } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { formatLongText, useTable } from '@waldur/table/utils';
import { ProjectHoverableRow } from '@waldur/user/affiliations/ProjectHoverableRow';

import { ProjectCostField } from './ProjectCostField';
import { ProjectCreateButton } from './ProjectCreateButton';
import { ProjectDetailsButton } from './ProjectDetailsButton';
import { ProjectExpandableRowContainer } from './ProjectExpandableRowContainer';
import { ProjectLink } from './ProjectLink';
import { ProjectTablePlaceholder } from './ProjectTablePlaceholder';

const OrganizationLink: FunctionComponent<{ row }> = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    label={row.customer_name}
  />
);

const exportRow = (row) => [
  row.name,
  row.description,
  formatDateTime(row.created),
];

const exportFields = ['Name', 'Description', 'Created'];

const filter = {
  field: [
    'uuid',
    'name',
    'description',
    'customer_uuid',
    'customer_name',
    'customer_abbreviation',
    'created',
    'billing_price_estimate',
    'type_name',
    'end_date',
    'backend_id',
    'oecd_fos_2007_code',
    'is_industry',
    'marketplace_resource_count',
  ],
};

const HoverableRow = ({ row }) => (
  <>
    <ProjectHoverableRow
      row={{ project_uuid: row.uuid, customer_uuid: row.customer_uuid }}
    />
    <ProjectsListActions project={row} />
    <ProjectDetailsButton project={row} />
  </>
);

export const SupportProjectsList: FunctionComponent = () => {
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'query',
    filter,
    exportRow,
    exportFields,
  });
  const columns = [
    {
      title: translate('Name'),
      render: ProjectLink,
      orderField: 'name',
    },
    {
      title: translate('Organization'),
      render: OrganizationLink,
      orderField: 'customer_name',
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{formatLongText(row.description)}</>,
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
    },
    {
      title: translate('End date'),
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'end_date',
    },
  ];
  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Estimated cost'),
      render: ProjectCostField,
      orderField: 'estimated_cost',
    });
  }

  return (
    <Table
      {...props}
      columns={columns}
      verboseName={translate('projects')}
      hasQuery={true}
      showPageSizeSelector={true}
      placeholderComponent={<ProjectTablePlaceholder />}
      actions={<ProjectCreateButton />}
      hoverableRow={HoverableRow}
      expandableRow={ProjectExpandableRowContainer}
      enableExport={true}
    />
  );
};
