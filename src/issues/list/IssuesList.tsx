import * as React from 'react';
import { connect } from 'react-redux';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { IssuesListPlaceholder } from '@waldur/issues/list/IssuesListPlaceholder';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableProps } from '@waldur/table-react/Table';
import { Column } from '@waldur/table-react/types';
import { getUser } from '@waldur/workspace/selectors';

import { IssueTypeIcon } from '../types/IssueTypeIcon';

import { IssueCreateButton } from './IssueCreateButton';

interface OwnProps {
  hiddenColumns?: string[];
  scope?: Record<string, any>;
  filter?: Record<string, any>;
}

interface IssueTableProps extends TableProps, OwnProps {
  supportOrStaff: boolean;
  filterColumns(cols: Column[]): Column[];
}

export const TableComponent: React.FC<IssueTableProps> = props => {
  const { filterColumns, supportOrStaff, hiddenColumns, ...rest } = props;
  const columns = filterColumns([
    {
      title: translate('Key'),
      render: ({ row }) => (
        <Link
          state="support.detail"
          params={{ uuid: row.uuid }}
          label={row.key || 'N/A'}
        />
      ),
      orderField: 'key',
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <>
          <IssueTypeIcon type={row.type} /> {row.status || 'N/A'}
        </>
      ),
      orderField: 'status',
    },
    {
      title: translate('Title'),
      render: ({ row }) => (
        <span className="ellipsis" style={{ width: 150 }}>
          {row.summary}
        </span>
      ),
      orderField: 'summary',
    },
    {
      title: translate('Description'),
      render: ({ row }) => (
        <span className="ellipsis" style={{ width: 150 }}>
          {row.description}
        </span>
      ),
    },
    {
      title: translate('Service type'),
      render: ({ row }) => row.resource_type || 'N/A',
      visible: supportOrStaff && !hiddenColumns.includes('resource_type'),
    },
    {
      title: translate('Organization'),
      orderField: 'customer_name',
      render: ({ row }) => row.customer_name || 'N/A',
      visible: !hiddenColumns.includes('customer'),
    },
    {
      title: translate('Caller'),
      orderField: 'caller_full_name',
      render: ({ row }) => row.caller_full_name || 'N/A',
    },
    {
      title: translate('Reporter'),
      orderField: 'reporter_name',
      render: ({ row }) => row.reporter_name || 'N/A',
      visible: supportOrStaff,
    },
    {
      title: translate('Assigned to'),
      orderField: 'assignee_name',
      render: ({ row }) => row.assignee_name || 'N/A',
      visible: supportOrStaff,
    },
    {
      title: translate('Created'),
      orderField: 'created',
      render: ({ row }) => formatDate(row.created),
    },
    {
      title: translate('Time in progress'),
      render: ({ row }) => formatRelative(row.created),
      visible: supportOrStaff,
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

const exportFields = props => {
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
    translate('Caller'),
    supportOrStaff && translate('Reporter'),
    supportOrStaff && translate('Assigned to'),
    translate('Created'),
    supportOrStaff && translate('Time in progress'),
  ].filter(label => label);
};

const TableOptions = {
  table: 'issuesList',
  fetchData: createFetcher('support-issues'),
  queryField: 'summary',
  mapPropsToFilter: props => props.filter,
  exportRow,
  exportFields,
};

const mapStateToProps = state => ({
  supportOrStaff: getUser(state).is_staff || getUser(state).is_support,
});

const connector = connect(mapStateToProps);

export const IssuesList = connector(
  connectTable(TableOptions)(TableComponent),
) as React.ComponentType<OwnProps>;

export default connectAngularComponent(IssuesList, ['filter']);
