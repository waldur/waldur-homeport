import { FC, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { assignmentBatchesList, AssignmentBatchList } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { PoolSummaryButton } from '@/proposals/update/reviewer-pool/PoolSummaryButton';
import { useReviewerPoolTabs } from '@/proposals/update/reviewer-pool/tabs';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableTabs } from '@/table/TableTabs';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../types';

import { AssignmentBatchExpandableRow } from './AssignmentBatchExpandableRow';
import { AssignmentBatchRowActions } from './AssignmentBatchRowActions';
import { AssignmentBatchStatusBadge } from './AssignmentBatchStatusBadge';
import { GenerateAssignmentsAction } from './GenerateAssignmentsAction';
import { ManualAssignmentAction } from './ManualAssignmentAction';
import { ReviewerCapacitySection } from './ReviewerCapacitySection';
import { SendAllDraftsAction } from './SendAllDraftsAction';

interface AssignmentBatchesSectionProps {
  call: Call;
  refetch: () => void;
}

type InnerTab = 'batches' | 'capacity';

const InnerTabs: FC<{
  activeTab: InnerTab;
  onSelect: (tab: InnerTab) => void;
}> = ({ activeTab, onSelect }) => (
  <Tab.Container
    activeKey={activeTab}
    onSelect={(k) => onSelect(k as InnerTab)}
  >
    <Nav variant="tabs" className="nav-line-tabs mb-5">
      <Nav.Item>
        <Nav.Link eventKey="batches">
          {translate('Assignment batches')}
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="capacity">
          {translate('Reviewer capacity')}
        </Nav.Link>
      </Nav.Item>
    </Nav>
  </Tab.Container>
);

export const AssignmentBatchesSection: FC<AssignmentBatchesSectionProps> = ({
  call,
}) => {
  const tabs = useReviewerPoolTabs();
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>('batches');

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
    }),
    [call.uuid],
  );

  const tableProps = useTable({
    table: 'AssignmentBatchesTable',
    fetchData: createFetcher(assignmentBatchesList),
    filter,
  });

  const columns = useMemo(
    () => [
      {
        id: 'reviewer',
        title: translate('Reviewer'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <div>
            <div className="fw-bold">
              {renderFieldOrDash(row.reviewer_name)}
            </div>
            <small className="text-muted">{row.reviewer_email}</small>
          </div>
        ),
        keys: ['reviewer_name', 'reviewer_email'],
      },
      {
        id: 'status',
        title: translate('Status'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <AssignmentBatchStatusBadge
            status={row.status}
            statusDisplay={row.status_display}
          />
        ),
        keys: ['status', 'status_display'],
      },
      {
        id: 'items',
        title: translate('Items'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <div className="d-flex gap-1">
            <Tip
              id={`pending-${row.uuid}`}
              label={translate('Pending: {count}', {
                count: row.items_pending_count,
              })}
            >
              <Badge variant="warning" pill outline>
                {row.items_pending_count}
              </Badge>
            </Tip>
            <Tip
              id={`accepted-${row.uuid}`}
              label={translate('Accepted: {count}', {
                count: row.items_accepted_count,
              })}
            >
              <Badge variant="success" pill outline>
                {row.items_accepted_count}
              </Badge>
            </Tip>
            <Tip
              id={`declined-${row.uuid}`}
              label={translate('Declined: {count}', {
                count: row.items_declined_count,
              })}
            >
              <Badge variant="danger" pill outline>
                {row.items_declined_count}
              </Badge>
            </Tip>
          </div>
        ),
        keys: [
          'items_count',
          'items_pending_count',
          'items_accepted_count',
          'items_declined_count',
        ],
      },
      {
        id: 'source',
        title: translate('Source'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <span>{row.source_display}</span>
        ),
        keys: ['source', 'source_display'],
      },
      {
        id: 'sent_at',
        title: translate('Sent'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <span>{row.sent_at ? formatDateTime(row.sent_at) : '-'}</span>
        ),
        keys: ['sent_at'],
      },
      {
        id: 'expires_at',
        title: translate('Expires'),
        render: ({ row }: { row: AssignmentBatchList }) => (
          <span>
            {row.expires_at ? formatDateTime(row.expires_at) : '-'}
            {row.is_expired && (
              <Badge variant="danger" outline className="ms-1">
                {translate('Expired')}
              </Badge>
            )}
          </span>
        ),
        keys: ['expires_at', 'is_expired'],
      },
    ],
    [],
  );

  const draftCount = tableProps.rows?.filter(
    (r) => r.status === 'draft',
  ).length;

  const batchesTableActions = (
    <>
      <PoolSummaryButton />
      <ManualAssignmentAction call={call} refetch={tableProps.fetch} />
      <GenerateAssignmentsAction call={call} refetch={tableProps.fetch} />
      <SendAllDraftsAction
        call={call}
        refetch={tableProps.fetch}
        draftCount={draftCount}
      />
    </>
  );

  // When on "capacity" inner tab, show capacity section with outer tabs
  if (activeInnerTab === 'capacity') {
    return (
      <div className="card card-bordered">
        <div className="card-header border-bottom-0 pt-5">
          <div className="card-title">
            <TableTabs tabs={tabs} />
          </div>
        </div>
        <div className="card-body pt-0">
          <InnerTabs activeTab={activeInnerTab} onSelect={setActiveInnerTab} />
          <ReviewerCapacitySection call={call} />
        </div>
      </div>
    );
  }

  // When on "batches" inner tab, use standard Table with tabs
  return (
    <>
      <Table
        {...tableProps}
        columns={columns}
        title={translate('Reviewer pool')}
        tabs={tabs}
        verboseName={translate('assignment batches')}
        showPageSizeSelector
        hasQuery
        expandableRow={AssignmentBatchExpandableRow}
        rowActions={({ row }) => (
          <AssignmentBatchRowActions row={row} refetch={tableProps.fetch} />
        )}
        tableActions={batchesTableActions}
      />
      <div className="mt-n10 pt-5 px-7">
        <InnerTabs activeTab={activeInnerTab} onSelect={setActiveInnerTab} />
      </div>
    </>
  );
};
