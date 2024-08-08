import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ValidationIcon } from '@waldur/marketplace/common/ValidationIcon';
import { Call, Round } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RoundCreateButton } from './RoundCreateButton';
import { RoundExpandableRow } from './RoundExpandableRow';

interface CallRoundsListProps {
  call: Call;
}

export const CallRoundsList: FC<CallRoundsListProps> = (props) => {
  const tableProps = useTable({
    table: 'PrivateCallRoundsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/rounds`,
    ),
    queryField: 'name',
  });

  return (
    <Table<Round>
      {...tableProps}
      id="rounds"
      className="mb-7"
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
          render: () => <>-</>,
        },
      ]}
      title={
        <>
          <ValidationIcon value={props.call.rounds.length > 0} />
          {translate('Rounds')}
        </>
      }
      verboseName={translate('Rounds')}
      hasQuery={true}
      tableActions={
        <RoundCreateButton call={props.call} refetch={tableProps.fetch} />
      }
      expandableRow={RoundExpandableRow}
    />
  );
};
