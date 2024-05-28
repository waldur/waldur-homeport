import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { formatProposalState } from '@waldur/proposals/utils';
import { Table } from '@waldur/table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/utils';

import { ProposalRowActions } from '../../proposal/ProposalRowActions';

import { ProposalExpandableRow } from './ProposalExpandableRow';

interface RoundProposalsListProps {
  round_uuid: string;
  call_uuid: string;
}

export const ProposalsList: FC<RoundProposalsListProps> = (props) => {
  const tableProps = useTable({
    table: 'RoundProposalsList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call_uuid}/rounds/${props.round_uuid}`,
    ),
    queryField: 'name',
  });

  return (
    <Table
      {...tableProps}
      id="proposals"
      className="mb-7"
      columns={[
        {
          title: translate('Name'),
          render: ({ row }) => <>{row.name}</>,
        },
        {
          title: translate('By'),
          render: ({ row }) => <>{row.created_by_name || '-'} </>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('State'),
          render: ({ row }) => <>{formatProposalState(row.state)}</>,
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      expandableRow={ProposalExpandableRow}
      hasQuery={true}
      hoverableRow={({ row }) => (
        <ProposalRowActions
          row={{ ...row, call_uuid: props.call_uuid }}
          refetch={tableProps.fetch}
        />
      )}
    />
  );
};
