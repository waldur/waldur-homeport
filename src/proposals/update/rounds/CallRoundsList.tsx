import { FC, useCallback } from 'react';
import {
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { formatDateTime } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';
import { ValidationIcon } from '@/marketplace/common/ValidationIcon';
import { Call } from '@/proposals/types';
import {
  getCallReadOnlyReason,
  getRoundMenuAccess,
  getRoundStatus,
} from '@/proposals/utils';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';
import { useUser } from '@/workspace/hooks';

import { RoundCreateButton } from './RoundCreateButton';
import { RoundExpandableRow } from './RoundExpandableRow';
import { RoundLifecycleBadge } from './RoundLifecycleBadge';
import { RoundRowActions } from './RoundRowActions';

interface CallRoundsListProps {
  call: Call;
  refetch?: () => void;
  isReadOnly?: boolean;
}

export const CallRoundsList: FC<CallRoundsListProps> = ({
  call,
  refetch: parentRefetch,
  isReadOnly,
}) => {
  const tableProps = useTable({
    table: 'PrivateCallRoundsList',
    fetchData: createFetcher(proposalProtectedCallsRoundsList, {
      path: { uuid: call.uuid },
    }),
    queryField: 'name',
  });

  const refetch = useCallback(() => {
    tableProps.fetch();
    parentRefetch?.();
  }, [tableProps.fetch, parentRefetch]);

  const renderRoundState = (row: ProtectedRound) => {
    const roundState = getRoundStatus(row);
    return (
      <div className="d-flex flex-wrap gap-2">
        <StateIndicator
          label={roundState.label}
          variant={roundState.color}
          tone="outline"
          shape="pill"
        />
        <RoundLifecycleBadge
          state={row.lifecycle_state}
          heldDecisionsCount={row.held_decisions_count}
        />
      </div>
    );
  };

  const user = useUser();
  // Editing a round needs CALL.UPDATE; its lifecycle needs CALL.CLOSE_ROUNDS,
  // which a role may carry without the other.
  const menuAccess = getRoundMenuAccess(user, call, Boolean(isReadOnly));
  const canUpdate = menuAccess?.canUpdate ?? false;
  const canCloseRounds = menuAccess?.canCloseRounds ?? false;

  const RowActions = useCallback(
    (props: { row: ProtectedRound }) =>
      canUpdate || canCloseRounds ? (
        <RoundRowActions
          row={props.row}
          refetch={refetch}
          call={call}
          canUpdate={canUpdate}
          canCloseRounds={canCloseRounds}
        />
      ) : (
        <ActionsDropdown disabled tooltip={getCallReadOnlyReason(call)} />
      ),
    [refetch, call, canUpdate, canCloseRounds],
  );

  const ExpandableRow = useCallback(
    (props: { row: ProtectedRound }) => (
      <RoundExpandableRow row={props.row} call={call} />
    ),
    [call],
  );

  return (
    <Table<ProtectedRound>
      {...tableProps}
      id="rounds"
      // Columns without a width keep a 150px floor; six of them pushed the
      // table past the call edit page at laptop widths and slid the State
      // column under the sticky actions. These widths add up to the table and
      // let the cells wrap instead.
      columns={[
        {
          title: translate('Round ID'),
          render: ({ row }) => (
            <code className="fw-bold text-break">{row.slug}</code>
          ),
          copyField: (row) => row.slug,
          width: '22%',
          ellipsis: false,
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{formatDateTime(row.start_time)}</>,
          width: '16%',
          ellipsis: false,
        },
        {
          title: translate('Cutoff date'),
          render: ({ row }) => <>{formatDateTime(row.cutoff_time)}</>,
          width: '16%',
          ellipsis: false,
        },
        {
          title: translate('Proposals'),
          render: ({ row }) => <>{row.proposals.length}</>,
          width: '9%',
        },
        {
          title: translate('Reviews'),
          render: ({ row }) => {
            const totalReviews = row.proposals.reduce(
              (acc, proposal) => acc + proposal.reviews.length,
              0,
            );
            return <>{totalReviews}</>;
          },
          width: '9%',
        },
        {
          title: translate('State'),
          render: ({ row }) => renderRoundState(row),
          // The status, the lifecycle stage and the held-decisions count wrap
          // onto a second line rather than run under the sticky actions.
          width: '28%',
          ellipsis: false,
        },
      ]}
      title={
        <>
          <ValidationIcon value={call.rounds.length > 0} />
          {translate('Rounds')}
        </>
      }
      verboseName={translate('Rounds')}
      tableActions={
        <RoundCreateButton
          call={call}
          refetch={refetch}
          disabled={isReadOnly}
          tooltip={isReadOnly ? getCallReadOnlyReason(call) : undefined}
        />
      }
      expandableRow={ExpandableRow}
      rowActions={RowActions}
      showPageSizeSelector
    />
  );
};
