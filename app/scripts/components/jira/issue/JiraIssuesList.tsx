import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { formatLongText } from '@waldur/table-react/utils';

import { JiraIssueCreateButton } from './JiraIssueCreateButton';

const IssueStatusField = props => (
  <Tooltip label={props.row.type_description} id="issueType">
    <img src={props.row.type_icon_url} style={{width: 16}} className="m-r-xs"/>
    {props.row.status}
  </Tooltip>
);

const IssueSlaField = withTranslation(props => (
  <Tooltip label={props.translate('Time to resolution')} id="slaField">
    {props.row.first_response_sla ? formatDateTime(props.row.first_response_sla) : 'N/A'}
  </Tooltip>
));

const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Key'),
      render: ({ row }) => row.key,
    },
    {
      title: translate('Status'),
      render: IssueStatusField,
    },
    {
      title: translate('Title'),
      render: ({ row }) => formatLongText(row.summary),
    },
    {
      title: translate('Description'),
      render: ({ row }) => row.description ? formatLongText(row.description) : 'N/A',
    },
    {
      title: translate('Assigned to'),
      render: ({ row }) => row.assignee_name || 'N/A',
    },
    {
      title: translate('Resolution SLA'),
      render: IssueSlaField,
    },
    {
      title: translate('Created'),
      render: ({ row }) => formatDateTime(row.created),
    },
  ];
  return (
    <Table
      {...props}
      columns={columns}
      actions={<JiraIssueCreateButton project={props.resource}/>}
      verboseName={translate('requests')}
      hasQuery={true}
    />
  );
};

const TableOptions = {
  table: 'jiraIssues',
  fetchData: createFetcher('jira-issues'),
  queryField: 'summary',
  mapPropsToFilter: ({ resource }) => ({project_uuid: resource.uuid}),
  exportFields: [
    'key',
    'type',
    'status',
    'title',
    'description',
    'assignee',
    'sla',
    'created',
  ],
  exportRow: row => [
    row.key,
    row.type_name,
    row.status,
    row.summary,
    row.description,
    row.assignee_name,
    row.first_response_sla,
    formatDateTime(row.created),
  ],
};

const JiraIssuesList = connectTable(TableOptions)(TableComponent);

export default connectAngularComponent(JiraIssuesList, ['resource']);
