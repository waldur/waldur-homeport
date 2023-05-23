import React from 'react';
import { connect } from 'react-redux';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { IssueLinkField } from '@waldur/issues/list/IssueLinkField';
import { IssuesListExpandableRow } from '@waldur/issues/list/IssuesListExpandableRow';
import { IssuesListPlaceholder } from '@waldur/issues/list/IssuesListPlaceholder';
import { StatusColumn } from '@waldur/issues/list/StatusColumn';
import { TitleColumn } from '@waldur/issues/list/TitleColumn';
import { RootState } from '@waldur/store/reducers';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { Column } from '@waldur/table/types';
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
  filter?: Record<string, any>;
}

interface IssueTableProps extends TableProps, OwnProps {
  supportOrStaff: boolean;
  filterColumns(cols: Column[]): Column[];
}

export const TableComponent: React.FC<IssueTableProps> = (props) => {
  const { filterColumns, supportOrStaff, hiddenColumns, ...rest } = props;
  const columns = filterColumns([
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
    },
    {
      title: translate('Title'),
      render: TitleColumn,
      orderField: 'summary',
    },
    {
      title: translate('Organization'),
      orderField: 'customer_name',
      render: ({ row }) => row.customer_name || 'N/A',
      visible: !hiddenColumns.includes('customer'),
    },
    {
      title: translate('Project'),
      orderField: 'project_name',
      render: ({ row }) => row.project_name || 'N/A',
      visible: !hiddenColumns.includes('project'),
    },
    {
      title: translate('Caller'),
      orderField: 'caller_full_name',
      render: ({ row }) => row.caller_full_name || 'N/A',
      visible: !hiddenColumns.includes('caller'),
    },
    {
      title: translate('Time in progress'),
      render: ({ row }) => <>{formatRelative(row.created)}</>,
      visible: supportOrStaff && !hiddenColumns.includes('time_in_progress'),
    },
  ]);

  return (
    <Table
      {...rest}
      columns={columns}
      verboseName={translate('support requests')}
      hasQuery={true}
      showPageSizeSelector={true}
      placeholderComponent={<IssuesListPlaceholder />}
      enableExport={true}
      actions={props.scope && <IssueCreateButton scope={props.scope} />}
      expandableRow={({ row }) => (
        <IssuesListExpandableRow row={row} supportOrStaff={supportOrStaff} />
      )}
    />
  );
};

TableComponent.defaultProps = {
  hiddenColumns: [],
};

const exportRow = (row, props) => {
  const { supportOrStaff, hiddenColumns = [] } = props;
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
};

const exportFields = (props) => {
  const { supportOrStaff, hiddenColumns = [] } = props;
  return [
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
  ].filter((label) => label);
};

const TableOptions = {
  table: 'issuesList',
  fetchData: createFetcher('support-issues'),
  queryField: 'summary',
  mapPropsToFilter: (props) => props.filter,
  mapPropsToTableId: (props) => (props.scope ? [props.scope.uuid] : []),
  exportRow,
  exportFields,
};

const mapStateToProps = (state: RootState) => ({
  supportOrStaff:
    getUser(state)?.is_staff || getUser(state)?.is_support || false,
});

const connector = connect(mapStateToProps);

export const IssuesList = connector(
  connectTable(TableOptions)(TableComponent),
) as React.ComponentType<OwnProps & Partial<TableProps>>;
