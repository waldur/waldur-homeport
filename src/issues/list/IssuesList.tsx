import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Issue, supportIssuesList } from 'waldur-js-client';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IssueLinkField } from '@waldur/issues/list/IssueLinkField';
import { IssuesListExpandableRow } from '@waldur/issues/list/IssuesListExpandableRow';
import { StatusColumn } from '@waldur/issues/list/StatusColumn';
import { TitleColumn } from '@waldur/issues/list/TitleColumn';
import { createFetcher } from '@waldur/table/api';
import {
  SupportIssuesFilter as IssuesFilter,
  selectSupportIssuesFilter as selectIssuesFilter,
  StatusOptions,
} from '@waldur/table/generated/SupportIssuesFilter';
import Table from '@waldur/table/Table';
import { Column, TableProps } from '@waldur/table/types';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';
import { getUser } from '@waldur/workspace/selectors';

import { IssueCreateButton } from './IssueCreateButton';

interface OwnProps {
  hiddenColumns?: (
    | 'customer'
    | 'project'
    | 'caller'
    | 'time_in_progress'
    | 'resource_type'
  )[];

  scope?: Record<string, any>;
  scopeType?: string;
  filter?: Record<string, any>;
  standalone?: boolean;
}

export const IssuesList: FC<OwnProps & Partial<TableProps>> = (props) => {
  const { hiddenColumns = [], standalone = true } = props;
  const user = useSelector(getUser);
  const supportOrStaff = user?.is_staff || user?.is_support || false;

  const filter = useSelector(selectIssuesFilter);

  const tableProps = useTable({
    table: `issuesList-${props.scope?.uuid}`,
    fetchData: createFetcher(supportIssuesList),
    queryField: 'query',
    filter: props.filter || filter,
  });

  const columns = useMemo(() => {
    const columns: Array<Column<Issue>> = [
      {
        title: translate('Key'),
        orderField: 'key',
        render: ({ row }) => (
          <IssueLinkField label={renderFieldOrDash(row.key)} row={row} />
        ),

        export: (row) => renderFieldOrDash(row.key),
        exportKeys: ['key'],
      },
      {
        title: translate('Status'),
        render: StatusColumn,
        orderField: 'status',
        filter: 'status',
        inlineFilter: (row) =>
          StatusOptions.filter((op) => op.value === row.status),
        export: (row) => renderFieldOrDash(row.status),
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
        export: (row) => renderFieldOrDash(row.resource_type),
        exportKeys: ['resource_type'],
      });
    }
    if (!hiddenColumns.includes('customer')) {
      columns.push({
        title: translate('Organization'),
        orderField: 'customer_name',
        render: ({ row }) => renderFieldOrDash(row.customer_name),
        export: (row) => renderFieldOrDash(row.customer_name),
        exportKeys: ['customer_name'],
      });
    }
    if (!hiddenColumns.includes('project')) {
      columns.push({
        title: translate('Project'),
        orderField: 'project_name',
        render: ({ row }) => renderFieldOrDash(row.project_name),
        export: (row) => renderFieldOrDash(row.project_name),
        exportKeys: ['project_name'],
      });
    }
    if (!hiddenColumns.includes('caller')) {
      columns.push({
        title: translate('Caller'),
        orderField: 'caller_full_name',
        render: ({ row }) => renderFieldOrDash(row.caller_full_name),
        export: (row) => renderFieldOrDash(row.caller_full_name),
        exportKeys: ['caller_full_name'],
      });
    }

    if (supportOrStaff) {
      columns.push({
        visible: false,
        title: translate('Reporter'),
        render: null,
        export: (row) => renderFieldOrDash(row.reporter_name),
        exportKeys: ['reporter_name'],
      });
      columns.push({
        visible: false,
        title: translate('Assigned to'),
        render: null,
        export: (row) => renderFieldOrDash(row.assignee_name),
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
      filters={props.filter ? undefined : <IssuesFilter />}
      columns={columns}
      title={translate('Support requests')}
      verboseName={translate('support requests')}
      hasQuery={true}
      showPageSizeSelector={true}
      enableExport={true}
      standalone={standalone}
      tableActions={
        props.scope &&
        !props.scope.is_removed && (
          <IssueCreateButton
            scope={props.scope}
            scopeType={props.scopeType}
            refetch={tableProps.fetch}
          />
        )
      }
      expandableRow={({ row }) => (
        <IssuesListExpandableRow row={row} supportOrStaff={supportOrStaff} />
      )}
      {...props}
    />
  );
};
