import * as React from 'react';
import { connect } from 'react-redux';

import { formatDate, formatRelative } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { TableProps } from '@waldur/table-react/Table';
import { Column } from '@waldur/table-react/types';
import { getUser } from '@waldur/workspace/selectors';

import { IssueTypeIcon } from '../types/IssueTypeIcon';
import { IssueCreateButton } from './IssueCreateButton';

interface IssueTableProps extends TableProps {
  supportOrStaff: boolean;
  filterColumns(cols: Column[]): Column[];
  hiddenColumns?: string[];
  scope?: Record<string, any>;
}

export const TableComponent: React.SFC<IssueTableProps> = props => {
  const { filterColumns, supportOrStaff, hiddenColumns, ...rest } = props;
  const columns = filterColumns([
    {
      title: translate('Key'),
      render: ({ row }) => (
        <Link
          state="support.detail"
          params={{uuid: row.uuid}}
          label={row.key || 'N/A'}
        />
      ),
      orderField: 'key',
    },
    {
      title: translate('Status'),
      render: ({ row }) => (
        <>
          <IssueTypeIcon type={row.type} />
          {' '}
          {row.status || 'N/A'}
        </>
      ),
      orderField: 'status',
    },
    {
      title: translate('Title'),
      render: ({ row }) => <span className="ellipsis" style={{width: 150}}>{row.summary}</span>,
      orderField: 'summary',
    },
    {
      title: translate('Description'),
      render: ({ row }) => <span className="ellipsis" style={{width: 150}}>{row.description}</span>,
    },
    {
      title: translate('Service type'),
      render: ({ row }) => row.resource_type || 'N/A',
      visible: supportOrStaff,
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
      enableExport={true}
      actions={props.scope && <IssueCreateButton scope={props.scope}/>}
    />
  );
};

TableComponent.defaultProps = {
  hiddenColumns: [],
};

const TableOptions = {
  table: 'issuesList',
  fetchData: createFetcher('support-issues'),
  queryField: 'summary',
  mapPropsToFilter: props => props.filter,
};

const mapStateToProps = state => ({
  supportOrStaff: getUser(state).is_staff || getUser(state).is_support,
});

const connector = connect(mapStateToProps);

export const IssuesList = connectTable(TableOptions)(connector(TableComponent));

export default connectAngularComponent(IssuesList);
