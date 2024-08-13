import { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { createFetcher, Table } from '@waldur/table';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { Column } from '@waldur/table/types';
import { formatLongText, useTable } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';

import { ProjectCostField } from './ProjectCostField';
import { ProjectCreateButton } from './ProjectCreateButton';
import { ProjectDetailsButton } from './ProjectDetailsButton';
import { ProjectExpandableRowContainer } from './ProjectExpandableRowContainer';
import { ProjectLink } from './ProjectLink';

export const ProjectsList: FunctionComponent<{}> = () => {
  const customer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({
      customer: customer.uuid,
      o: 'name',
    }),
    [customer],
  );
  const props = useTable({
    table: PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'query',
    filter,
  });
  const columns: Column[] = [
    {
      title: translate('Name'),
      render: ProjectLink,
      orderField: 'name',
      export: 'name',
      id: 'name',
      keys: [
        'uuid',
        'name',
        'is_industry',
        'backend_id',
        'marketplace_resource_count',
        'oecd_fos_2007_code',
        'type_name',
        'image',
      ],
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{formatLongText(row.description)}</>,
      export: 'description',
      id: 'description',
      keys: ['description'],
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      id: 'created',
      keys: ['created'],
    },
    {
      title: translate('Start date'),
      render: ({ row }) => (
        <>{row.start_date ? formatDate(row.start_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'start_date',
      export: false,
      id: 'start_date',
      optional: true,
      keys: ['start_date'],
    },
    {
      title: translate('End date'),
      render: ({ row }) => (
        <>{row.end_date ? formatDate(row.end_date) : DASH_ESCAPE_CODE}</>
      ),
      orderField: 'end_date',
      export: false,
      id: 'end_date',
      keys: ['end_date'],
    },
  ];
  if (isFeatureVisible(ProjectFeatures.estimated_cost)) {
    columns.push({
      title: translate('Estimated cost'),
      render: ProjectCostField,
      export: false,
      id: 'estimated_cost',
      keys: ['billing_price_estimate'],
    });
  }

  return (
    <Table
      {...props}
      title={translate('Projects')}
      columns={columns}
      verboseName={translate('projects')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={<ProjectCreateButton />}
      rowActions={({ row }) => (
        <>
          <ProjectsListActions project={row} />
          <ProjectDetailsButton project={row} />
        </>
      )}
      expandableRow={ProjectExpandableRowContainer}
      enableExport={true}
      hasOptionalColumns
    />
  );
};
