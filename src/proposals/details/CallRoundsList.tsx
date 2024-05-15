import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Call, Round } from '@waldur/proposals/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RoundExpandableRow } from '../update/rounds/RoundExpandableRow';
import { getSortedRoundsWithStatus } from '../utils';

interface CallRoundsListProps {
  call: Call;
}

export const CallRoundsList: FC<CallRoundsListProps> = (props) => {
  const tableProps = useTable({
    table: 'CallRoundsList',
    fetchData: () =>
      Promise.resolve({
        rows: getSortedRoundsWithStatus(props.call.rounds),
        resultCount: props.call.rounds.length,
      }),
  });

  return (
    <Table<Round & { state: { label: string; color: string } }>
      {...tableProps}
      id="rounds"
      className="mb-7"
      columns={[
        {
          title: translate('Round name'),
          render: ({ row }) => row.name,
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
          title: translate('State'),
          render: ({ row }) => (
            <StateIndicator label={row.state.label} variant={row.state.color} />
          ),
        },
      ]}
      verboseName={translate('rounds')}
      expandableRow={RoundExpandableRow}
      hasActionBar={false}
    />
  );
};
