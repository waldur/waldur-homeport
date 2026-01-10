import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { RoundExpandableRow } from '../update/rounds/RoundExpandableRow';
import { getRoundsWithStatus } from '../utils';

interface CallRoundsListProps {
  call: Call;
}

export const CallRoundsList: FC<CallRoundsListProps> = (props) => {
  const tableProps = useTable({
    table: 'PublicCallRoundsList',
    fetchData: () =>
      Promise.resolve({
        rows: getRoundsWithStatus(props.call.rounds),
        resultCount: props.call.rounds.length,
      }),
  });

  return (
    <Table
      {...tableProps}
      id="rounds"
      columns={[
        {
          title: translate('Round ID'),
          render: ({ row }) => row.slug,
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
          title: translate('State'),
          render: ({ row }) => (
            <StateIndicator
              label={row.status.label}
              variant={row.status.color}
              outline
              pill
            />
          ),
        },
      ]}
      title={translate('Rounds')}
      verboseName={translate('Rounds')}
      expandableRow={RoundExpandableRow}
    />
  );
};
