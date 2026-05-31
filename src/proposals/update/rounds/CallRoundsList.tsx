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
import { getRoundStatus } from '@/proposals/utils';
import { callLockedTooltip } from '@/proposals/workflow/constants';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { RoundCreateButton } from './RoundCreateButton';
import { RoundExpandableRow } from './RoundExpandableRow';
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
      <StateIndicator
        label={roundState.label}
        variant={roundState.color}
        outline
        pill
      />
    );
  };

  const RowActions = useCallback(
    (props: { row: ProtectedRound }) =>
      isReadOnly ? (
        <ActionsDropdown disabled tooltip={callLockedTooltip()} />
      ) : (
        <RoundRowActions row={props.row} refetch={refetch} call={call} />
      ),
    [refetch, call, isReadOnly],
  );

  const ExpandableRow = useCallback(
    (props: { row: ProtectedRound }) => <RoundExpandableRow row={props.row} />,
    [],
  );

  return (
    <Table<ProtectedRound>
      {...tableProps}
      id="rounds"
      columns={[
        {
          title: translate('Round ID'),
          render: ({ row }) => <code className="fw-bold">{row.slug}</code>,
          copyField: (row) => row.slug,
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{formatDateTime(row.start_time)}</>,
        },
        {
          title: translate('Cutoff date'),
          render: ({ row }) => <>{formatDateTime(row.cutoff_time)}</>,
        },
        {
          title: translate('Proposals'),
          render: ({ row }) => <>{row.proposals.length}</>,
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
        },
        {
          title: translate('State'),
          render: ({ row }) => renderRoundState(row),
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
          tooltip={isReadOnly ? callLockedTooltip() : undefined}
        />
      }
      expandableRow={ExpandableRow}
      rowActions={RowActions}
      showPageSizeSelector
    />
  );
};
