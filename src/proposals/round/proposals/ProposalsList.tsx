import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { formatProposalState } from '@waldur/proposals/utils';
import { Table } from '@waldur/table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/utils';

import { ProposalExpandableRow } from './ProposalExpandableRow';
import { ProposalRowActions } from './ProposalRowActions';
import { ProposalsPlaceholder } from './ProposalsPlaceholder';

interface RoundProposalsListProps {
  round_uuid: string;
  call_uuid: string;
}

const ProposalNameField = ({ row }) => {
  return (
    <div>
      <span className="d-block text-muted">{row.name}</span>
    </div>
  );
};

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
      placeholderComponent={<ProposalsPlaceholder />}
      columns={[
        {
          title: translate('Name'),
          render: ProposalNameField,
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
      hoverableRow={ProposalRowActions}
    />
  );
};
