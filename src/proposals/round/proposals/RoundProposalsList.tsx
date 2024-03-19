import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table } from '@waldur/table';
import { createFetcher } from '@waldur/table/api';
import { useTable } from '@waldur/table/utils';

import { RoundProposalsPlaceholder } from './RoundProposalsPlaceholder';

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

export const RoundProposalsList: FC<RoundProposalsListProps> = (props) => {
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
      placeholderComponent={<RoundProposalsPlaceholder />}
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
          render: ({ row }) => <>{row.state}</>,
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
    />
  );
};
