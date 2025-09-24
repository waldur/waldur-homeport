import { FC } from 'react';
import {
  ProtectedRound,
  proposalProtectedCallsRoundsList,
} from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
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

interface CallRoundsListProps {
  call: Call;
}

export const CallRoundsList: FC<CallRoundsListProps> = (props) => {
  const tableProps = useTable({
    table: 'PrivateCallRoundsList',
    fetchData: createFetcher(proposalProtectedCallsRoundsList, {
      path: { uuid: props.call.uuid },
    }),
    queryField: 'name',
  });

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

  return (
    <Table<ProtectedRound>
      {...tableProps}
      id="rounds"
      columns={[
        {
          title: translate('Round name'),
          render: ({ row }) => (
            <Link
              state="protected-call-round.details"
              params={{ round_uuid: row.uuid, call_uuid: props.call.uuid }}
              label={row.name}
            />
          ),
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
          <ValidationIcon value={props.call.rounds.length > 0} />
          {translate('Rounds')}
        </>
      }
      verboseName={translate('Rounds')}
      tableActions={
        <RoundCreateButton call={props.call} refetch={tableProps.fetch} />
      }
      expandableRow={RoundExpandableRow}
    />
  );
};
