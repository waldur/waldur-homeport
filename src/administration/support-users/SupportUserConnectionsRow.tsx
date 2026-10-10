import { FC } from 'react';
import {
  SupportUser,
  SupportUserAttachmentBrief,
  SupportUserCommentBrief,
  SupportUserConnections,
  SupportUserIssueBrief,
  supportUsersConnectionsRetrieve,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { Link } from '@/core/Link';
import { translate } from '@/i18n';
import { EmbeddedTabs } from '@/table/EmbeddedTabs';
import { ExpandableContainer } from '@/table/ExpandableContainer';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

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
    <EmbeddedTabs
      framed
      defaultValue="reported"
      className="min-h-375px"
      tabs={[
        {
          key: 'reported',
          title: translate('Reported tickets'),
          count: row.reported_issues_count ?? 0,
          content: (
            <ConnectionsTable<SupportUserIssueBrief>
              supportUserUuid={row.uuid}
              slice="reported_issues"
              columns={issueColumns}
              verboseName={translate('reported tickets')}
            />
          ),
        },
        {
          key: 'assigned',
          title: translate('Assigned tickets'),
          count: row.assigned_issues_count ?? 0,
          content: (
            <ConnectionsTable<SupportUserIssueBrief>
              supportUserUuid={row.uuid}
              slice="assigned_issues"
              columns={issueColumns}
              verboseName={translate('assigned tickets')}
            />
          ),
        },
        {
          key: 'comments',
          title: translate('Comments'),
          count: row.comments_count ?? 0,
          content: (
            <ConnectionsTable<SupportUserCommentBrief>
              supportUserUuid={row.uuid}
              slice="comments"
              columns={commentColumns}
              verboseName={translate('comments')}
            />
          ),
        },
        {
          key: 'attachments',
          title: translate('Attachments'),
          count: row.attachments_count ?? 0,
          content: (
            <ConnectionsTable<SupportUserAttachmentBrief>
              supportUserUuid={row.uuid}
              slice="attachments"
              columns={attachmentColumns}
              verboseName={translate('attachments')}
            />
          ),
        },
      ]}
    />
  </ExpandableContainer>
);
