import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IssueLinkField } from '@waldur/issues/list/IssueLinkField';
import { IssuesListExpandableRow } from '@waldur/issues/list/IssuesListExpandableRow';
import { StatusColumn } from '@waldur/issues/list/StatusColumn';
import { TitleColumn } from '@waldur/issues/list/TitleColumn';
import { Table, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
import { useTable } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { IssueCreateButton } from './IssueCreateButton';
import { IssuesFilter } from './IssuesFilter';

interface OwnProps {
  hiddenColumns?: (
    | 'customer'
    | 'project'
    | 'caller'
    | 'time_in_progress'
    | 'resource_type'
  )[];
  scope?: Record<string, any>;
  filter?: Record<string, any>;
}

const mapStateToFilter = createSelector(
  getFormValues('IssuesFilter'),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.status) {
      result.status = filters.status.map((option) => option.value);
    }
    return result;
  },
);

export const IssuesList: FC<OwnProps & Partial<TableProps>> = (props) => {
  const { hiddenColumns = [] } = props;
  const user = useSelector(getUser);
  const supportOrStaff = user?.is_staff || user?.is_support || false;

  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: `issuesList-${props.scope?.uuid}`,
    fetchData: createFetcher('support-issues'),
    queryField: 'query',
    filter: props.filter || filter,
  });

  const columns = useMemo(() => {
    const columns: Array<Column> = [
      {
        title: translate('Key'),
        orderField: 'key',
        render: ({ row }) => (
          <IssueLinkField label={row.key || 'N/A'} row={row} />
        ),
        export: (row) => row.key || 'N/A',
        exportKeys: ['key'],
      },
      {
        title: translate('Status'),
        render: StatusColumn,
        orderField: 'status',
        filter: 'status',
        export: (row) => row.status || 'N/A',
        exportKeys: ['status'],
      },
      {
        title: translate('Title'),
        render: TitleColumn,
        orderField: 'summary',
        export: 'summary',
      },
      {
        visible: false,
        title: translate('Title'),
        render: null,
        export: 'description',
      },
    ];
    if (supportOrStaff && !hiddenColumns.includes('resource_type')) {
      columns.push({
        visible: false,
        title: translate('Service type'),
        render: null,
        export: (row) => row.resource_type || 'N/A',
        exportKeys: ['resource_type'],
      });
    }
    if (!hiddenColumns.includes('customer')) {
      columns.push({
        title: translate('Organization'),
        orderField: 'customer_name',
        render: ({ row }) => row.customer_name || 'N/A',
        export: (row) => row.customer_name || 'N/A',
        exportKeys: ['customer_name'],
      });
    }
    if (!hiddenColumns.includes('project')) {
      columns.push({
        title: translate('Project'),
        orderField: 'project_name',
        render: ({ row }) => row.project_name || 'N/A',
        export: (row) => row.project_name || 'N/A',
        exportKeys: ['project_name'],
      });
    }
    if (!hiddenColumns.includes('caller')) {
      columns.push({
        title: translate('Caller'),
        orderField: 'caller_full_name',
        render: ({ row }) => row.caller_full_name || 'N/A',
        export: (row) => row.caller_full_name || 'N/A',
        exportKeys: ['caller_full_name'],
      });
    }

    if (supportOrStaff) {
      columns.push({
        visible: false,
        title: translate('Reporter'),
        render: null,
        export: (row) => row.reporter_name || 'N/A',
        exportKeys: ['reporter_name'],
      });
      columns.push({
        visible: false,
        title: translate('Assigned to'),
        render: null,
        export: (row) => row.assignee_name || 'N/A',
        exportKeys: ['assignee_name'],
      });
    }
    columns.push({
      visible: false,
      title: translate('Created'),
      render: null,
      export: (row) => formatDate(row.created),
      exportKeys: ['created'],
    });

    if (supportOrStaff && !hiddenColumns.includes('time_in_progress')) {
      columns.push({
        title: translate('Time in progress'),
        render: ({ row }) => <>{formatRelative(row.created)}</>,
        export: (row) => formatRelative(row.created),
        exportKeys: ['created'],
      });
    }
    return columns;
  }, [hiddenColumns, supportOrStaff]);

  return (
    <Table
      {...tableProps}
      {...props}
      filters={props.filter ? undefined : <IssuesFilter />}
      columns={columns}
      title={translate('Issues')}
      verboseName={translate('support requests')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      tableActions={
        props.scope && (
          <IssueCreateButton scope={props.scope} refetch={tableProps.fetch} />
        )
      }
      expandableRow={({ row }) => (
        <IssuesListExpandableRow row={row} supportOrStaff={supportOrStaff} />
      )}
    />
  );
};
