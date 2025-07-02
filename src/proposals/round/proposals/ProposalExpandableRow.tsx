import React, { useMemo } from 'react';
import { Proposal } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { RateStars } from '@waldur/proposals/proposal/create-review/RateStars';
import { Field } from '@waldur/resource/summary';
import { createFetcher } from '@waldur/table/api';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { ProposalReviewsRowActions } from './ProposalReviewsRowActions';

interface ProposalExpandableRowProps {
  row: Proposal;
}

const renderReviewScoreField = ({ row }) => {
  return <RateStars value={row.summary_score} />;
};

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
      render: renderReviewScoreField,
    },
  ];

  return (
    <ExpandableContainer>
      {row.project_summary && (
        <Field
          label={translate('Project summary')}
          value={row.project_summary}
          className="col-md-6 mb-3"
        />
      )}
      <Table
        {...tableProps}
        columns={columns}
        minHeight="auto"
        hideRefresh
        headerClassName="py-0 min-h-45px"
        titleClassName="fs-6 fw-bolder text-gray-700"
        title={translate('Reviews')}
        rowActions={({ row }) => <ProposalReviewsRowActions row={row} />}
        showPageSizeSelector
        initialPageSize={5}
      />
    </ExpandableContainer>
  );
};
