import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { ProposalCall } from '@waldur/proposals/types';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';
import { RoleField } from '@waldur/user/affiliations/RoleField';

import { AddUserButton } from './AddUserButton';
import { CallReviewersTablePlaceholder } from './CallReviewersTablePlaceholder';

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
    <Table<GenericPermission>
      {...tableProps}
      id="reviewers"
      className="mb-7"
      placeholderComponent={
        <CallReviewersTablePlaceholder
          refetch={tableProps.fetch}
          call={props.call}
        />
      }
      columns={[
        {
          title: translate('Reviewer'),
          render: ({ row }) => <>{row.user_full_name || row.user_username}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{row.user_email}</>,
        },
        {
          title: translate('Role'),
          render: RoleField,
        },
      ]}
      title={translate('Reviewers')}
      verboseName={translate('Reviewers')}
      actions={<AddUserButton refetch={tableProps.fetch} call={props.call} />}
    />
  );
};
