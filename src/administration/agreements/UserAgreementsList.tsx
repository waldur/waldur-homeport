import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { UserAgreementCreateButton } from './UserAgreementCreateButton';
import { UserAgreementDeleteButton } from './UserAgreementDeleteButton';
import { UserAgreementsEditButton } from './UserAgreementsEditButton';
import { UserAgreementsExpandableRow } from './UserAgreementsExpandableRow';

export const UserAgreementsList: FunctionComponent<{}> = () => {
  const props = useTable({
    table: 'user-agreements',
    fetchData: createFetcher('user-agreements'),
  });
  return (
    <Table
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
      hoverableRow={({ row }) => (
        <ButtonGroup>
          <UserAgreementsEditButton row={row} refetch={props.fetch} />
          <UserAgreementDeleteButton
            userAgreement={row}
            refetch={props.fetch}
          />
        </ButtonGroup>
      )}
      expandableRow={UserAgreementsExpandableRow}
      expandableRowClassName="bg-gray-200"
      actions={<UserAgreementCreateButton refetch={props.fetch} />}
    />
  );
};
