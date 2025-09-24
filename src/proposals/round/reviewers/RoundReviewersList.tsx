import { FC } from 'react';
import {
  callRoundsReviewersList,
  ProtectedRound,
  RoundReviewer,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

interface RoundReviewersListProps {
  round: ProtectedRound;
}

export const RoundReviewersList: FC<RoundReviewersListProps> = (props) => {
  const tableProps = useTable({
    table: 'RoundReviewersList',
    fetchData: createFetcher(callRoundsReviewersList, {
      path: { uuid: props.round.uuid },
    }),
  });

  return (
    <Table<RoundReviewer>
      {...tableProps}
      id="reviewers"
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{row.full_name || '-'} </>,
          copyField: (row) => row.full_name,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email || '-'} </>,
          copyField: (row) => row.email,
        },
        {
          title: translate('Proposals in progress'),
          render: ({ row }) => <>{row.in_review_proposals}</>,
        },
        {
          title: translate('Accepted proposals'),
          render: ({ row }) => <>{row.accepted_proposals}</>,
        },
        {
          title: translate('Rejected proposals'),
          render: ({ row }) => <>{row.rejected_proposals}</>,
        },
      ]}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
    />
  );
};
