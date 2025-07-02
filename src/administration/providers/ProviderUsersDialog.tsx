import { useMemo } from 'react';
import { User, UsersListData } from 'waldur-js-client';

import { FREEIPA_IDP } from '@waldur/auth/providers/constants';
import { CancelButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { createFetcher } from '@waldur/table/api';
import { BooleanField } from '@waldur/table/BooleanField';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';
import { renderFieldOrDash } from '@waldur/table/utils';

import { FreeIPAUsersList } from '../users/FreeIPAUsersList';

const ProviderUsersList = (props) => {
  const filter = useMemo(
    (): UsersListData['query'] => ({
      registration_method: props.resolve.type,
      field: ['full_name', 'email', 'is_active'],
    }),
    [props],
  );
  const tableProps = useTable({
    table: `ProviderUsersList`,
    fetchData: createFetcher('users'),
    queryField: 'query',
    filter,
  });

  return (
    <Table<User>
      {...tableProps}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{renderFieldOrDash(row.full_name)}</>,
          copyField: (row) => row.full_name,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{renderFieldOrDash(row.email)}</>,
          copyField: (row) => row.email,
        },
        {
          title: translate('Status'),
          render: ({ row }) => <BooleanField value={row.is_active} />,
          className: 'text-center',
        },
      ]}
      showPageSizeSelector={true}
      verboseName={translate('users')}
      hasQuery={true}
      hasActionBar={false}
    />
  );
};

export const ProviderUsersDialog = (props) => (
  <ModalDialog
    title={translate('Users from {provider}', {
      provider: props.resolve.type,
    })}
    footer={<CancelButton label={translate('OK')} />}
    closeButton
  >
    {props.resolve.type === FREEIPA_IDP ? (
      <FreeIPAUsersList />
    ) : (
      <ProviderUsersList {...props} />
    )}
  </ModalDialog>
);
