import { FC } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import {
  SupportUser,
  SupportUserAttachmentBrief,
  SupportUserCommentBrief,
  SupportUserConnections,
  SupportUserIssueBrief,
  supportUsersConnectionsRetrieve,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { TableTabsContainer } from '@/customer/list/TableTabsContainer';
import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

// Mirrors the tab header of the organization/project expandable rows. Counts
// come from the list row, so they render before the connections query lands.
const NavItem = ({ title, eventKey, count }) => (
  <Nav.Item className="text-nowrap">
    <Nav.Link eventKey={eventKey}>
      {title}
      <Badge variant="default" pill outline className="ms-2">
        {count || 0}
      </Badge>
    </Nav.Link>
  </Nav.Item>
);

type ConnectionsSlice = keyof SupportUserConnections;

// One shared endpoint backs every tab, so each table pulls its own slice out of
// the response. Tabs unmount when inactive, so only the visible one fetches.
const ConnectionsTable = <RowType,>({
  supportUserUuid,
  slice,
  columns,
  verboseName,
}: {
  supportUserUuid: string;
  slice: ConnectionsSlice;
  columns: Column<RowType>[];
  verboseName: string;
}) => {
  const tableProps = useTable<RowType>({
    table: `SupportUserConnections-${slice}-${supportUserUuid}`,
    fetchData: () =>
      supportUsersConnectionsRetrieve({
        path: { uuid: supportUserUuid },
      }).then((response) => {
        const rows = (response.data?.[slice] ?? []) as RowType[];
        return { rows, resultCount: rows.length };
      }),
  });

  return (
    <Table<RowType>
      {...tableProps}
      columns={columns}
      verboseName={verboseName}
      hideTitle
      hasActionBar={false}
      placeholderHasRetry={false}
    />
  );
};

// The ticket key links straight to the ticket, so staff can inspect what a
// support user is attached to before merging or deleting it.
const IssueKeyLink = ({
  uuid,
  issueKey,
}: {
  uuid: string;
  issueKey?: string;
}) =>
  issueKey ? (
    <Link
      state="support.detail"
      params={{ issue_uuid: uuid }}
      label={issueKey}
    />
  ) : (
    <>{renderFieldOrDash(issueKey)}</>
  );

const issueColumns: Column<SupportUserIssueBrief>[] = [
  {
    title: translate('Key'),
    render: ({ row }) => <IssueKeyLink uuid={row.uuid} issueKey={row.key} />,
    id: 'key',
  },
  {
    title: translate('Summary'),
    render: ({ row }) => row.summary,
    id: 'summary',
  },
  {
    title: translate('Status'),
    render: ({ row }) => renderFieldOrDash(row.status),
    id: 'status',
  },
  {
    title: translate('Created'),
    render: ({ row }) => formatDateTime(row.created),
    id: 'created',
  },
];

const commentColumns: Column<SupportUserCommentBrief>[] = [
  {
    title: translate('Ticket'),
    render: ({ row }) => (
      <IssueKeyLink uuid={row.issue_uuid} issueKey={row.issue_key} />
    ),
    id: 'issue_key',
  },
  {
    title: translate('Comment'),
    render: ({ row }) => row.description,
    id: 'description',
  },
  {
    title: translate('Visibility'),
    render: ({ row }) =>
      row.is_public ? translate('Public') : translate('Internal'),
    id: 'is_public',
  },
  {
    title: translate('Created'),
    render: ({ row }) => formatDateTime(row.created),
    id: 'created',
  },
];

const attachmentColumns: Column<SupportUserAttachmentBrief>[] = [
  {
    title: translate('Ticket'),
    render: ({ row }) => (
      <IssueKeyLink uuid={row.issue_uuid} issueKey={row.issue_key} />
    ),
    id: 'issue_key',
  },
  {
    title: translate('File'),
    render: ({ row }) => row.file_name,
    id: 'file_name',
  },
  {
    title: translate('Created'),
    render: ({ row }) => formatDateTime(row.created),
    id: 'created',
  },
];

export const SupportUserConnectionsRow: FC<{ row: SupportUser }> = ({
  row,
}) => (
  <ExpandableContainer>
    <TableTabsContainer
      defaultActiveKey="reported"
      unmountOnExit={true}
      className="min-h-375px"
    >
      <div className="overflow-auto">
        <Nav variant="tabs" className="nav-line-tabs flex-nowrap">
          <NavItem
            title={translate('Reported tickets')}
            eventKey="reported"
            count={row.reported_issues_count}
          />
          <NavItem
            title={translate('Assigned tickets')}
            eventKey="assigned"
            count={row.assigned_issues_count}
          />
          <NavItem
            title={translate('Comments')}
            eventKey="comments"
            count={row.comments_count}
          />
          <NavItem
            title={translate('Attachments')}
            eventKey="attachments"
            count={row.attachments_count}
          />
        </Nav>
      </div>
      <Tab.Content className="overflow-auto">
        <Tab.Pane eventKey="reported" unmountOnExit={true}>
          <ConnectionsTable<SupportUserIssueBrief>
            supportUserUuid={row.uuid}
            slice="reported_issues"
            columns={issueColumns}
            verboseName={translate('reported tickets')}
          />
        </Tab.Pane>

        <Tab.Pane eventKey="assigned" unmountOnExit={true}>
          <ConnectionsTable<SupportUserIssueBrief>
            supportUserUuid={row.uuid}
            slice="assigned_issues"
            columns={issueColumns}
            verboseName={translate('assigned tickets')}
          />
        </Tab.Pane>

        <Tab.Pane eventKey="comments" unmountOnExit={true}>
          <ConnectionsTable<SupportUserCommentBrief>
            supportUserUuid={row.uuid}
            slice="comments"
            columns={commentColumns}
            verboseName={translate('comments')}
          />
        </Tab.Pane>

        <Tab.Pane eventKey="attachments" unmountOnExit={true}>
          <ConnectionsTable<SupportUserAttachmentBrief>
            supportUserUuid={row.uuid}
            slice="attachments"
            columns={attachmentColumns}
            verboseName={translate('attachments')}
          />
        </Tab.Pane>
      </Tab.Content>
    </TableTabsContainer>
  </ExpandableContainer>
);
