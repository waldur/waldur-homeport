import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { RoundReviewersListExpandableRow } from '@waldur/proposals/round/reviewers/RoundReviewersListExpandableRow';
import { Reviewer } from '@waldur/proposals/types';
import { createFetcher, Table } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

interface RoundReviewersListProps {
  round_uuid: string;
}

export const RoundReviewersList: FC<RoundReviewersListProps> = (props) => {
  const tableProps = useTable({
    table: 'RoundReviewersList',
    fetchData: createFetcher(`call-rounds/${props.round_uuid}/reviewers`),
  });

  return (
    <Table<Reviewer>
      {...tableProps}
      id="reviewers"
      className="mb-7"
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{row.full_name || '-'} </>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.email || '-'} </>,
        },
      ]}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
      expandableRow={RoundReviewersListExpandableRow}
    />
  );
};
