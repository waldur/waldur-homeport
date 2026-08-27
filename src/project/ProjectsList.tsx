import { FC, useMemo } from 'react';
import { projectsList } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures, ProjectFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { CUSTOMER_PROJECTS_LIST } from '@/project/constants';
import { ProjectEndDateField } from '@/project/ProjectEndDateField';
import { ProjectsListActions } from '@/project/ProjectsListActions';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  ProjectsFilter,
  ProjectsFilterFormId,
  selectProjectsFilter,
} from '@/table/generated/ProjectsFilter';
import Table from '@/table/Table';
import { Column, TableProps } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { formatLongText } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';
import { Customer } from '@/workspace/types';

import { BatchProjectActions } from './BatchProjectActions';
import { ProjectCostField } from './ProjectCostField';
import { ProjectKindField } from './ProjectKindField';
import { ProjectLink } from './ProjectLink';
import { ProjectsTableActions } from './ProjectsTableActions';

const mandatoryFields = [
  'uuid',
  'name', // Actions
  'customer_name', // DeleteAction
  'customer_uuid', // DeleteAction
  'url', // ChangeEndDateAction
  'end_date', // ChangeEndDateRequestDialog
];

interface ProjectsListProps extends Partial<TableProps> {
  customer?: Customer;
  optionalColumns?: ('description' | 'created')[];
}

export const ProjectsListTable: FC<TableProps & ProjectsListProps> = ({
  customer,
  optionalColumns = [],
  ...props
}) => {
  const columns: Column[] = [
    {
      title: translate('Name'),
      render: ({ row }) => <ProjectLink row={row} showKind />,
      copyField: (row) => row.name,
      orderField: 'name',
      export: 'name',
      id: 'name',
      keys: ['uuid', 'name', 'is_industry', 'kind'],
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
      render: ProjectEndDateField,
      orderField: 'end_date',
      export: false,
      id: 'end_date',
      keys: [
        'end_date',
        'grace_period_days',
        'is_in_grace_period',
        'effective_end_date',
      ],
    },
  ];

  if (
    isFeatureVisible(ProjectFeatures.estimated_cost) &&
    !isFeatureVisible(MarketplaceFeatures.conceal_prices) &&
    customer?.display_billing_info_in_projects !== false
  ) {
    columns.push({
      title: translate('Estimated cost'),
      render: ProjectCostField,
      export: false,
      id: 'estimated_cost',
      keys: ['billing_price_estimate'],
    });
  }
  if (isFeatureVisible(ProjectFeatures.show_kind_in_create_dialog)) {
    columns.push({
      title: translate('Type'),
      render: ProjectKindField,
      export: 'kind',
      id: 'kind',
      keys: ['kind'],
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
      tableActions={
        <ProjectsTableActions customer={customer} refetch={props.fetch} />
      }
      rowActions={({ row }) => (
        <ProjectsListActions project={row} refetch={props.fetch} />
      )}
      enableMultiSelect
      multiSelectActions={BatchProjectActions}
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
  const currentCustomer = useCustomer();
  const table = props.table || CUSTOMER_PROJECTS_LIST;
  const filterValues = useFilterValues(table);
  const filter = useMemo(
    () => ({
      customer: customer ? customer.uuid : currentCustomer?.uuid,
      o: 'name',
      ...selectProjectsFilter(filterValues),
    }),
    [currentCustomer, customer, filterValues],
  );
  const tableProps = useTable({
    table,
    fetchData: createFetcher(projectsList),
    queryField: 'query',
    filter,
    mandatoryFields,
  });

  return (
    <ProjectsListTable
      {...tableProps}
      filters={<ProjectsFilter />}
      formId={ProjectsFilterFormId}
      {...props}
      customer={customer || currentCustomer}
      optionalColumns={optionalColumns}
    />
  );
};
