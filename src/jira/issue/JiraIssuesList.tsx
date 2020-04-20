import * as React from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Tooltip } from '@waldur/core/Tooltip';
import { withTranslation, TranslateProps } from '@waldur/i18n';
import { JiraIssue } from '@waldur/jira/issue/types';
import { ResourceLink } from '@waldur/resource/ResourceLink';
import { Table, connectTable, createFetcher } from '@waldur/table-react';
import { formatLongText } from '@waldur/table-react/utils';

import { JiraIssueCreateButton } from './JiraIssueCreateButton';
import { JiraIssuePriorityField } from './JiraIssuePriorityField';
import { JiraIssueStatusField } from './JiraIssueStatusField';

const IssueSlaField = withTranslation(
  (props: { row: JiraIssue } & TranslateProps) => (
    <Tooltip label={props.translate('Time to resolution')} id="slaField">
      {props.row.first_response_sla
        ? formatDateTime(props.row.first_response_sla)
        : 'N/A'}
    </Tooltip>
  ),
);

const formatIssueKey = props => (
  <ResourceLink type="JIRA.Issue" uuid={props.row.uuid} label={props.row.key} />
);

const TableComponent = props => {
  const { translate } = props;
  const columns = [
    {
      title: translate('Key'),
      render: formatIssueKey,
    },
    {
      title: translate('Status'),
      render: ({ row }) => <JiraIssueStatusField {...row} />,
    },
    {
      title: translate('Priority'),
      render: ({ row }) => <JiraIssuePriorityField {...row} />,
    },
    {
      title: translate('Title'),
      render: ({ row }) => formatLongText(row.summary),
    },
    {
      title: translate('Description'),
      render: ({ row }) =>
        row.description ? formatLongText(row.description) : 'N/A',
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
      actions={<JiraIssueCreateButton project={props.resource} />}
      verboseName={translate('requests')}
      hasQuery={true}
      enableExport={true}
    />
  );
};

const TableOptions = {
  table: 'jiraIssues',
  fetchData: createFetcher('jira-issues'),
  queryField: 'summary',
  mapPropsToFilter: ({ resource }) => ({ jira_project_uuid: resource.uuid }),
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
    row.description || 'N/A',
    row.assignee_name || 'N/A',
    row.first_response_sla || 'N/A',
    formatDateTime(row.created),
  ],
};

export const JiraIssuesList = connectTable(TableOptions)(TableComponent);
