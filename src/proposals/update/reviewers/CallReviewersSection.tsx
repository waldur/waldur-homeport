import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ProposalCall, ProposalCallReviewer } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { CallReviewersTablePlaceholder } from './CallReviewersTablePlaceholder';
import { EditReviewersButton } from './EditReviewersButton';

interface CallReviewersSectionProps {
  call: ProposalCall;
}

export const CallReviewersSection: FC<CallReviewersSectionProps> = (props) => {
  const tableProps = useTable({
    table: 'CallReviewersList',
    fetchData: createFetcher(
      `proposal-protected-calls/${props.call.uuid}/list_users`,
    ),
  });

  return (
    <Table<ProposalCallReviewer>
      {...tableProps}
      id="reviewers"
      className="mb-7"
      placeholderComponent={<CallReviewersTablePlaceholder />}
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.user_full_name}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.user_email}</>,
        },
      ]}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
      actions={<EditReviewersButton />}
    />
  );
};
