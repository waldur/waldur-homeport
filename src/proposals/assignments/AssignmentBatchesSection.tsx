import {
  EnvelopeSimpleIcon,
  SparkleIcon,
  UserPlusIcon,
} from '@phosphor-icons/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FC, useCallback, useMemo, useState } from 'react';
import { Nav, Tab } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import { createSelector } from 'reselect';
import {
  assignmentBatchesList,
  proposalProtectedCallsGenerateAssignments,
  proposalProtectedCallsSendAllAssignments,
  AssignmentBatchList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDateTime } from '@/core/dateUtils';
import { lazyComponent } from '@/core/lazyComponent';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { openModalDialog } from '@/modal/actions';
import { PoolSummaryButton } from '@/proposals/update/reviewer-pool/PoolSummaryButton';
import { useReviewerPoolTabs } from '@/proposals/update/reviewer-pool/tabs';
import { useNotify } from '@/store/hooks';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableTabs } from '@/table/TableTabs';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { Call } from '../types';

import { AssignmentBatchExpandableRow } from './AssignmentBatchExpandableRow';
import { AssignmentBatchRowActions } from './AssignmentBatchRowActions';
import { ReviewerCapacitySection } from './ReviewerCapacitySection';

const CreateManualAssignmentDialog = lazyComponent(() =>
  import('./CreateManualAssignmentDialog').then((m) => ({
    default: m.CreateManualAssignmentDialog,
  })),
);

interface AssignmentBatchesSectionProps {
  call: Call;
  refetch: () => void;
}

const FILTER_FORM_ID = 'AssignmentBatchesFilter';

const StatusBadge: FC<{ status: string; statusDisplay: string }> = ({
  status,
  statusDisplay,
}) => {
  const variant = useMemo(() => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'primary';
      case 'responded':
        return 'success';
      case 'expired':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }, [status]);

  return (
    <Badge variant={variant} pill outline>
      {statusDisplay}
    </Badge>
  );
};

const filtersSelector = createSelector(
  getFormValues(FILTER_FORM_ID),
  (filters: any) => {
    const result: Record<string, any> = {};
    if (filters?.status) {
      result.status = filters.status.value;
    }
    if (filters?.source) {
      result.source = filters.source.value;
    }
    return result;
  },
);

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
  const dispatch = useDispatch();
  const { showSuccess, showErrorResponse } = useNotify();
  const queryClient = useQueryClient();
  const formFilters = useSelector(filtersSelector);
  const tabs = useReviewerPoolTabs();
  const [activeInnerTab, setActiveInnerTab] = useState<InnerTab>('batches');

  const filter = useMemo(
    () => ({
      call_uuid: call.uuid,
      ...formFilters,
    }),
    [call.uuid, formFilters],
  );

  const tableProps = useTable({
    table: 'AssignmentBatchesTable',
    fetchData: createFetcher(assignmentBatchesList),
    filter,
  });

  // Generate assignments mutation
  const generateMutation = useMutation({
    mutationFn: () =>
      proposalProtectedCallsGenerateAssignments({
        path: { uuid: call.uuid },
        body: {},
      }),
    onSuccess: (response) => {
      const data = response.data;
      showSuccess(
        translate(
          'Generated {batches} batches with {items} assignment items for {proposals} proposals.',
          {
            batches: data.batches_created,
            items: data.items_created,
            proposals: data.proposals_processed,
          },
        ),
      );
      tableProps.fetch();
      queryClient.invalidateQueries({ queryKey: ['AssignmentBatchesTable'] });
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to generate assignments.'));
    },
  });

  // Send all assignments mutation
  const sendAllMutation = useMutation({
    mutationFn: () =>
      proposalProtectedCallsSendAllAssignments({
        path: { uuid: call.uuid },
        body: {},
      }),
    onSuccess: (response) => {
      const data = response.data;
      showSuccess(
        translate('Sent {count} assignment batches.', {
          count: data.batches_sent,
        }),
      );
      tableProps.fetch();
    },
    onError: (error) => {
      showErrorResponse(error, translate('Failed to send assignments.'));
    },
  });

  const handleManualAssignment = useCallback(() => {
    dispatch(
      openModalDialog(CreateManualAssignmentDialog, {
        resolve: { call, refetch: tableProps.fetch },
      }),
    );
  }, [dispatch, call, tableProps.fetch]);

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
          <StatusBadge status={row.status} statusDisplay={row.status_display} />
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
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleManualAssignment}
      >
        <UserPlusIcon size={16} weight="bold" className="me-1" />
        {translate('Manual assignment')}
      </button>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => generateMutation.mutate()}
        disabled={generateMutation.isPending}
      >
        <SparkleIcon size={16} weight="bold" className="me-1" />
        {translate('Generate assignments')}
      </button>
      {draftCount > 0 && (
        <button
          className="btn btn-success btn-sm"
          onClick={() => sendAllMutation.mutate()}
          disabled={sendAllMutation.isPending}
        >
          <EnvelopeSimpleIcon size={16} weight="bold" className="me-1" />
          {translate('Send all drafts')} ({draftCount})
        </button>
      )}
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
