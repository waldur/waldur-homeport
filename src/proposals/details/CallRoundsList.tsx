import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { StateIndicator } from '@waldur/core/StateIndicator';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

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
            <StateIndicator
              label={row.status.label}
              variant={row.status.color}
              outline
              pill
            />
          ),
        },
      ]}
      verboseName={translate('rounds')}
      expandableRow={RoundExpandableRow}
      hasActionBar={false}
    />
  );
};
