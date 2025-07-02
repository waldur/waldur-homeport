import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { formatDate, formatDateTime } from '@waldur/core/dateUtils';
import { isFeatureVisible } from '@waldur/features/connect';
import { ProjectFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { PROJECTS_LIST } from '@waldur/project/constants';
import { ProjectsListActions } from '@waldur/project/ProjectsListActions';
import { createFetcher } from '@waldur/table/api';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { Column, TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { formatLongText } from '@waldur/table/utils';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { ProjectCreateButton } from './create/ProjectCreateButton';
import { ProjectImportButton } from './import/ProjectImportButton';
import { ProjectCostField } from './ProjectCostField';
import { ProjectLink } from './ProjectLink';

const mandatoryFields = [
  'uuid',
  'name', // Actions
  'customer_name', // DeleteAction
  'customer_uuid', // DeleteAction
];

interface ProjectsListProps extends Partial<TableProps> {
  customer?: Customer;
  optionalColumns?: ('description' | 'created')[];
}

const TableActions = ({ customer, refetch }) => (
  <>
    <ProjectImportButton customer={customer} refetch={refetch} />
    <ProjectCreateButton customer={customer} refetch={refetch} />
  </>
);

export const ProjectsListTable: FC<TableProps & ProjectsListProps> = ({
  customer,
  optionalColumns = [],
  ...props
}) => {
  const columns: Column[] = [
    {
      title: translate('Name'),
      render: ProjectLink,
      copyField: (row) => row.name,
      orderField: 'name',
      export: 'name',
      id: 'name',
      keys: ['uuid', 'name', 'is_industry'],
    },
    {
      title: translate('Description'),
      render: ({ row }) => <>{formatLongText(row.description)}</>,
      export: 'description',
      id: 'description',
      keys: ['description'],
      optional: optionalColumns.includes('description'),
    },
    {
      title: translate('Created'),
      render: ({ row }) => <>{formatDateTime(row.created)}</>,
      orderField: 'created',
      export: (row) => formatDateTime(row.created),
      exportKeys: ['created'],
      id: 'created',
      keys: ['created'],
      optional: optionalColumns.includes('created'),
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
      title={translate('Projects')}
      columns={columns}
      verboseName={translate('projects')}
      initialSorting={{ field: 'created', mode: 'desc' }}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={<TableActions customer={customer} refetch={props.fetch} />}
      rowActions={({ row }) => (
        <ProjectsListActions project={row} refetch={props.fetch} />
      )}
      enableExport={true}
      hasOptionalColumns
      {...props}
    />
  );
};

export const ProjectsList: FC<ProjectsListProps> = ({
  customer,
  optionalColumns = [],
  ...props
}) => {
  const currentCustomer = useSelector(getCustomer);
  const filter = useMemo(
    () => ({
      customer: customer ? customer.uuid : currentCustomer.uuid,
      o: 'name',
    }),
    [currentCustomer, customer],
  );
  const tableProps = useTable({
    table: props.table || PROJECTS_LIST,
    fetchData: createFetcher('projects'),
    queryField: 'query',
    filter,
    mandatoryFields,
  });

  return (
    <ProjectsListTable
      {...tableProps}
      {...props}
      customer={customer || currentCustomer}
      optionalColumns={optionalColumns}
    />
  );
};
