import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { GenericPermission } from '@waldur/permissions/types';
import { Table } from '@waldur/table';

import { CustomerCreateButton } from './CustomerCreateButton';
import { usePermissionsTable } from './usePermissionsTable';

export const CustomerPermissions: FunctionComponent = () => {
  const tableProps = usePermissionsTable('customer');
  return (
    <Table<GenericPermission>
      {...tableProps}
      title={translate('Organizations')}
      columns={[
        {
          title: translate('Organization name'),
          render: ({ row }) => (
            <Link
              state="organization.dashboard"
              params={{ uuid: row.scope_uuid }}
              label={row.scope_name}
            />
          ),
        },
        {
          title: translate('Role'),
          render: ({ row }) => <>{row.role_description}</>,
          className: 'text-center col-md-1',
        },
      ]}
      verboseName={translate('organizations')}
      actions={<CustomerCreateButton />}
    />
  );
};
