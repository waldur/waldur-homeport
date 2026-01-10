import { FC, useCallback } from 'react';
import {
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { Call } from '@waldur/proposals/types';
import { getRoundStatus } from '@waldur/proposals/utils';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RoundCreateButton } from './RoundCreateButton';
import { RoundExpandableRow } from './RoundExpandableRow';
import { RoundRowActions } from './RoundRowActions';

interface CallRoundsListProps {
  call: Call;
  refetch?: () => void;
}

export const CallRoundsList: FC<CallRoundsListProps> = ({
  call,
  refetch: parentRefetch,
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
    (props: { row: ProtectedRound }) => (
      <RoundRowActions row={props.row} refetch={refetch} call={call} />
    ),
    [refetch, call],
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
      tableActions={<RoundCreateButton call={call} refetch={refetch} />}
      expandableRow={ExpandableRow}
      rowActions={RowActions}
    />
  );
};
