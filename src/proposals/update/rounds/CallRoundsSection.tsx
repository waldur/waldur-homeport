import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { ProposalCall, ProposalCallRound } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CallRoundsTablePlaceholder } from './CallRoundsTablePlaceholder';
import { RoundCreateButton } from './RoundCreateButton';
import { RoundExpandableRow } from './RoundExpandableRow';

interface CallRoundsSectionProps {
  call: ProposalCall;
}

export const CallRoundsSection: FC<CallRoundsSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallRoundsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/rounds`,
    ),
    queryField: 'name',
  });

  return (
    <Table<ProposalCallRound>
      {...tableProps}
      id="rounds"
      className="mb-7"
      placeholderComponent={
        <CallRoundsTablePlaceholder
          call={props.call}
          refetch={tableProps.fetch}
        />
      }
      columns={[
        {
          title: translate('Round name'),
          render: ({ row }) => (
            <Link
              state="call-management.protected-call-update-round"
              params={{ round_uuid: row.uuid, call_uuid: props.call.uuid }}
              label={row.uuid.substring(0, 10)}
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
      actions={
        <RoundCreateButton call={props.call} refetch={tableProps.fetch} />
      }
      expandableRow={RoundExpandableRow}
    />
  );
};
