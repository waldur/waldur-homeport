import { FC, useCallback, useMemo } from 'react';
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

  const exportRow = useCallback(
    (row) => {
      const result = [
        row.key || 'N/A',
        row.status || 'N/A',
        row.summary,
        row.description,
      ];
      if (supportOrStaff && !hiddenColumns.includes('resource_type')) {
        result.push(row.resource_type || 'N/A');
      }
      if (!hiddenColumns.includes('customer')) {
        result.push(row.customer_name || 'N/A');
      }
      if (!hiddenColumns.includes('project')) {
        result.push(row.project_name || 'N/A');
      }
      result.push(row.caller_full_name || 'N/A');
      if (supportOrStaff) {
        result.push(row.reporter_name || 'N/A');
      }
      if (supportOrStaff) {
        result.push(row.assignee_name || 'N/A');
      }
      result.push(formatDate(row.created));
      result.push(formatRelative(row.created));
      return result;
    },
    [supportOrStaff, hiddenColumns],
  );

  const exportFields = useCallback(
    () =>
      [
        translate('Key'),
        translate('Status'),
        translate('Title'),
        translate('Description'),
        supportOrStaff &&
          !hiddenColumns.includes('resource_type') &&
          translate('Service type'),
        !hiddenColumns.includes('customer') && translate('Organization'),
        !hiddenColumns.includes('project') && translate('Project'),
        translate('Caller'),
        supportOrStaff && translate('Reporter'),
        supportOrStaff && translate('Assigned to'),
        translate('Created'),
        supportOrStaff && translate('Time in progress'),
      ].filter((label) => label),
    [supportOrStaff, hiddenColumns],
  );

  const filter = useSelector(mapStateToFilter);

  const tableProps = useTable({
    table: `issuesList-${props.scope?.uuid}`,
    fetchData: createFetcher('support-issues'),
    queryField: 'query',
    filter: props.filter || filter,
    exportRow,
    exportFields,
  });

  const columns = useMemo(() => {
    const columns: Array<Column> = [
      {
        title: translate('Key'),
        orderField: 'key',
        render: ({ row }) => (
          <IssueLinkField label={row.key || 'N/A'} row={row} />
        ),
      },
      {
        title: translate('Status'),
        render: StatusColumn,
        orderField: 'status',
        filter: 'status',
      },
      {
        title: translate('Title'),
        render: TitleColumn,
        orderField: 'summary',
      },
    ];
    if (!hiddenColumns.includes('customer')) {
      columns.push({
        title: translate('Organization'),
        orderField: 'customer_name',
        render: ({ row }) => row.customer_name || 'N/A',
      });
    }
    if (!hiddenColumns.includes('project')) {
      columns.push({
        title: translate('Project'),
        orderField: 'project_name',
        render: ({ row }) => row.project_name || 'N/A',
      });
    }
    if (!hiddenColumns.includes('caller')) {
      columns.push({
        title: translate('Caller'),
        orderField: 'caller_full_name',
        render: ({ row }) => row.caller_full_name || 'N/A',
      });
    }

    if (supportOrStaff && !hiddenColumns.includes('time_in_progress')) {
      columns.push({
        title: translate('Time in progress'),
        render: ({ row }) => <>{formatRelative(row.created)}</>,
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
      actions={props.scope && <IssueCreateButton scope={props.scope} />}
      expandableRow={({ row }) => (
        <IssuesListExpandableRow row={row} supportOrStaff={supportOrStaff} />
      )}
    />
  );
};
