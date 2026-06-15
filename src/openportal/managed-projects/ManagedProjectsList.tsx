import { useMemo } from 'react';
import { openportalManagedProjectsList } from 'waldur-js-client';

import { formatDate, formatDateTime } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { useTitle } from '@/navigation/title';
import { createFetcher } from '@/table/api';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import {
  OpenportalManagedProjectsFilter,
  selectOpenportalManagedProjectsFilter,
  OpenportalManagedProjectsFilterFormId,
} from '@/table/generated/OpenportalManagedProjectsFilter';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useFilterValues } from '@/table/useFilterValues';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ManagedProjectActions } from './ManagedProjectActions';
import { ManagedProjectExpandableRow } from './ManagedProjectExpandableRow';

const renderProjectTemplate = (row: any) => {
  if (row.project_template_data) {
    return row.project_template_data.name;
  }

  if (row.details.template) {
    return row.details.template;
  }

  return renderFieldOrDash(row.details.class);
};

const renderOffering = (destination: string) => {
  if (destination) {
    // split by "." and return the last part
    const parts = destination.split('.');
    return renderFieldOrDash(parts[parts.length - 1]);
  }
  return '-';
};

export const ManagedProjectsList = () => {
  useTitle(translate('Managed Projects'), '', 'browser');

  const values = useFilterValues(`ManagedProjectsList`);

  const filter = useMemo(
    () => selectOpenportalManagedProjectsFilter(values),
    [values],
  );

  const tableProps = useTable({
    table: `ManagedProjectsList`,
    syncFiltersToURL: true,
    fetchData: createFetcher(openportalManagedProjectsList),
    queryField: 'query',
    filter: {
      ...filter,
      state: filter?.state || ['pending'],
    },
  });

  const columns: Array<Column> = [
    {
      title: translate('Project'),
      orderField: 'row.details.name',
      render: ({ row }) => renderFieldOrDash(row.details.name),
      keys: ['name'],
      id: 'managedproject',
    },
    {
      title: translate('Offering'),
      orderField: 'row.offering',
      render: ({ row }) => renderOffering(row.destination),
      keys: ['offering'],
      id: 'offering',
    },
    {
      title: translate('Project Template'),
      orderField: 'row.details.class',
      render: ({ row }) => renderProjectTemplate(row),
      keys: ['project-template'],
      id: 'project-template',
    },
    {
      title: translate('Description'),
      render: ({ row }) => renderFieldOrDash(row.details.description),
      keys: ['description'],
      optional: true,
      id: 'description',
    },
    {
      title: translate('Created'),
      render: ({ row }) => (
        <>{row.created ? formatDateTime(row.created) : DASH_ESCAPE_CODE}</>
      ),
      keys: ['created_date'],
      optional: true,
      id: 'created_date',
    },
    {
      title: translate('Start Date'),
      render: ({ row }) => (
        <>
          {row.details.start_date
            ? formatDate(row.details.start_date)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['start_date'],
      optional: true,
      id: 'start_date',
    },
    {
      title: translate('End Date'),
      render: ({ row }) => (
        <>
          {row.details.end_date
            ? formatDate(row.details.end_date)
            : DASH_ESCAPE_CODE}
        </>
      ),
      keys: ['end_date'],
      optional: true,
      id: 'end_date',
    },
    {
      title: translate('Allocation'),
      render: ({ row }) => renderFieldOrDash(row.details.allocation),
      keys: ['allocation'],
      id: 'allocation',
    },
    {
      title: translate('State'),
      render: ({ row }) => <>{row.state}</>,
      keys: ['state'],
      id: 'state',
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Managed Projects')}
      title={translate('Managed Projects')}
      showPageSizeSelector={true}
      standalone
      hasOptionalColumns
      expandableRowClassName="py-2 pe-2"
      expandableRow={ManagedProjectExpandableRow}
      rowActions={({ row }) => (
        <ManagedProjectActions project={row} refetch={tableProps.fetch} />
      )}
      filters={<OpenportalManagedProjectsFilter />}
      formId={OpenportalManagedProjectsFilterFormId}
    />
  );
};
