import React, { useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { ProposalReviewsDetailButton } from './ProposalReviewsDetailButton';

interface ProposalExpandableRowProps {
  row;
}

export const ProposalExpandableRow: React.FC<ProposalExpandableRowProps> = ({
  row,
}) => {
  const filter = useMemo(() => ({ proposal_uuid: row.uuid }), [row]);
  const tableProps = useTable({
    table: 'ProposalReviewsList',
    fetchData: createFetcher(`proposal-reviews`),
    filter,
  });

  const columns = [
    {
      title: translate('Reviewer'),
      render: ({ row }) => row.reviewer_full_name,
    },
    {
      title: translate('Status'),
      render: ({ row }) => row.state,
    },
    {
      title: translate('Score'),
      render: ({ row }) => row.summary_score,
    },
  ];

  return (
    <Table
      {...tableProps}
      columns={columns}
      rowActions={ProposalReviewsDetailButton}
      hasActionBar={false}
    />
  );
};
