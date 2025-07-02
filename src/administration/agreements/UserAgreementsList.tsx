import { FunctionComponent } from 'react';
import { UserAgreement } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/table/ActionsDropdown';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { UserAgreementCreateButton } from './UserAgreementCreateButton';
import { UserAgreementDeleteButton } from './UserAgreementDeleteButton';
import { UserAgreementsEditButton } from './UserAgreementsEditButton';
import { UserAgreementsExpandableRow } from './UserAgreementsExpandableRow';

const UserAggrementsRowActions = ({ row, fetch }) => (
  <ActionsDropdown
    row={row}
    refetch={fetch}
    actions={[UserAgreementsEditButton, UserAgreementDeleteButton].filter(
      Boolean,
    )}
  />
);

export const UserAgreementsList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'user-agreements',
    fetchData: createFetcher('user-agreements'),
  });
  return (
    <Table<UserAgreement>
      {...props}
      columns={[
        {
          title: translate('Type'),
          render: ({ row }: { row }) => row.agreement_type,
        },
        {
          title: translate('Created at'),
          render: ({ row }) => formatDateTime(row.created),
        },
      ]}
      verboseName={translate('user agreements')}
      rowActions={UserAggrementsRowActions}
      expandableRow={UserAgreementsExpandableRow}
      tableActions={<UserAgreementCreateButton refetch={props.fetch} />}
    />
  );
};
