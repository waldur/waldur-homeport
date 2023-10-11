import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';

import { UserAgreementCreateButton } from '@waldur/administration/UserAgreementCreateButton';
import { UserAgreementDeleteButton } from '@waldur/administration/UserAgreementDeleteButton';
import { UserAgreementsEditButton } from '@waldur/administration/UserAgreementsEditButton';
import { UserAgreementsExpandableRow } from '@waldur/administration/UserAgreementsExpandableRow';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Table, connectTable, createFetcher } from '@waldur/table';
import { TableProps } from '@waldur/table/Table';
import { TableOptionsType } from '@waldur/table/types';

const TableComponent: FunctionComponent<any> = (props) => {
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

const TableOptions: TableOptionsType = {
  table: 'user-agreements',
  fetchData: createFetcher('user-agreements'),
};

export const UserAgreementsList = connectTable(TableOptions)(
  TableComponent,
) as React.ComponentType<Partial<TableProps>>;
