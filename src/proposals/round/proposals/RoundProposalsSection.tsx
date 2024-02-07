import { FC } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCallRound } from '@waldur/proposals/types';
import { Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { RoundProposalsTablePlaceholder } from './RoundProposalsTablePlaceholder';

interface RoundProposalsSectionProps {
  round: ProposalCallRound;
}

const dummyData = [
  {
    name: 'Proposal 1',
    user_fullname: 'John',
    call: 'Current call',
    created: '2023-04-21T10:42',
    status: [true, null, null, null, null],
  },
  {
    name: 'Proposal 2',
    user_fullname: 'John',
    call: 'Current call',
    created: '2023-04-21T10:42',
    status: [true, true, null, null, null],
  },
  {
    name: 'Proposal 3',
    user_fullname: 'John',
    call: 'Current call',
    created: '2023-04-21T10:42',
    status: [true, true, true, null, null],
  },
  {
    name: 'Proposal 4',
    user_fullname: 'John',
    call: 'Current call',
    created: '2023-04-21T10:42',
    status: [true, true, true, null, false],
  },
];

const ProposalNameField = ({ row }) => {
  return (
    <div>
      {row.name}
      <span className="d-block text-muted">{row.user_fullname}</span>
    </div>
  );
};

export const RoundProposalsSection: FC<RoundProposalsSectionProps> = () => {
  const tableProps = useTable({
    table: 'RoundProposalsList',
    fetchData: () =>
      Promise.resolve({
        rows: dummyData,
        resultCount: dummyData.length,
      }),
    queryField: 'name',
  });

  return (
    <Table
      {...tableProps}
      id="proposals"
      className="mb-7"
      placeholderComponent={<RoundProposalsTablePlaceholder />}
      columns={[
        {
          title: translate('Name'),
          render: ProposalNameField,
        },
        {
          title: translate('Call'),
          render: ({ row }) => <>{row.call}</>,
        },
        {
          title: translate('Created'),
          render: ({ row }) => <>{formatDateTime(row.created)}</>,
        },
        {
          title: translate('Status'),
          render: ({ row }) => (
            <>
              {row.status.map((state, i) => {
                const bg =
                  state === true
                    ? 'bg-success'
                    : state === false
                    ? 'bg-danger'
                    : 'bg-secondary';
                return (
                  <span
                    key={i}
                    className={
                      'w-15px h-15px d-inline-block rounded-circle me-4 ' + bg
                    }
                  ></span>
                );
              })}
            </>
          ),
        },
      ]}
      title={translate('Proposals')}
      verboseName={translate('Proposals')}
      hasQuery={true}
    />
  );
};
