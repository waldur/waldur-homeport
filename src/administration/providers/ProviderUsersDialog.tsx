import { useMemo } from 'react';
import { Modal } from 'react-bootstrap';

import { CancelButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { Table, createFetcher } from '@waldur/table';
import { BooleanField } from '@waldur/table/BooleanField';
import { renderFieldOrDash, useTable } from '@waldur/table/utils';

const ProviderUsersList = (props) => {
  const filter = useMemo(
    () => ({ registration_method: props.resolve.type }),
    [props],
  );
  const tableProps = useTable({
    table: `ProviderUsersList`,
    fetchData: createFetcher('users'),
    queryField: 'query',
    filter,
  });

  return (
    <Table
      {...tableProps}
      columns={[
        {
          title: translate('Full name'),
          render: ({ row }) => <>{renderFieldOrDash(row.full_name)}</>,
        },
        {
          title: translate('Email'),
          render: ({ row }) => <>{renderFieldOrDash(row.email)}</>,
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
  <>
    <Modal.Header>
      <Modal.Title>
        {translate('Users from {provider}', { provider: props.resolve.type })}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <ProviderUsersList {...props} />
    </Modal.Body>
    <Modal.Footer>
      <CancelButton label={translate('OK')} />
    </Modal.Footer>
  </>
);
