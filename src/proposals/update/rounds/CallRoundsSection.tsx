import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCall, ProposalCallRound } from '@waldur/proposals/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CallRoundsTablePlaceholder } from './CallRoundsTablePlaceholder';
import { RoundCreateButton } from './RoundCreateButton';

interface CallRoundsSectionProps {
  call: ProposalCall;
}

export const CallRoundsSection: FC<CallRoundsSectionProps> = (props) => {
  const rounds = props.call?.rounds || [];
  const tableProps = useTable({
    table: 'CallRoundsList',
    fetchData: () =>
      Promise.resolve({
        rows: rounds,
        resultCount: rounds.length,
      }),
    queryField: 'name',
  });

  return (
    <Table<ProposalCallRound>
      {...tableProps}
      id="rounds"
      className="mb-7"
      placeholderComponent={<CallRoundsTablePlaceholder />}
      columns={[
        {
          title: translate('Round name'),
          render: () => <>-</>,
        },
        {
          title: translate('Start date'),
          render: ({ row }) => <>{formatDateTime(row.start_time)}</>,
        },
        {
          title: translate('Cutoff date'),
          render: ({ row }) => <>{formatDateTime(row.end_time)}</>,
        },
        {
          title: translate('Submissions'),
          render: () => <>-</>,
        },
        {
          title: translate('Allocated') + '/' + translate('Available'),
          render: () => <>-</>,
        },
        {
          title: translate('State'),
          render: () => <>-</>,
        },
      ]}
      title={
        <>
          {props.call.rounds.length === 0 ? (
            <i className="fa fa-warning text-danger me-3" />
          ) : (
            <i className="fa fa-check text-success me-3" />
          )}
          <span>{translate('Rounds')}</span>
        </>
      }
      verboseName={translate('Rounds')}
      hasQuery={true}
      actions={<RoundCreateButton />}
    />
  );
};
