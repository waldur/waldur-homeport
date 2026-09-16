import { FC, useMemo } from 'react';
import {
  marketplaceServiceProviderAccountsList,
  ServiceProvider,
  ServiceProviderAccount,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { OfferingUserStateField } from '@/marketplace/OfferingUserStateField';
import { ActionsDropdown } from '@/table/ActionsDropdown';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { TableWithPortal } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';

import { ProviderAccountDetailsButton } from './ProviderAccountDetailsButton';
import { ProviderAccountExpandableRow } from './ProviderAccountExpandableRow';

interface ProviderAccountsListProps extends Partial<TableWithPortal> {
  provider: ServiceProvider;
}

/** The accounts the provider holds once per person for its offerings. */
export const ProviderAccountsList: FC<ProviderAccountsListProps> = ({
  provider,
  portal,
}) => {
  const filter = useMemo(
    () => ({ customer_uuid: provider.customer_uuid }),
    [provider.customer_uuid],
  );
  const tableProps = useTable({
    table: 'provider-shared-accounts',
    fetchData: createFetcher(marketplaceServiceProviderAccountsList),
    filter,
    queryField: 'query',
  });

  return (
    <Table<ServiceProviderAccount>
      {...tableProps}
      title={translate('Provider accounts')}
      verboseName={translate('provider accounts')}
      hasQuery
      // Inside the users page's tabs the card and toolbar are the page's.
      portal={portal}
      hasActionBar={!portal}
      cardBordered={!portal}
      fullWidth={!!portal}
      expandableRow={ProviderAccountExpandableRow}
      rowActions={({ row }) => (
        <ActionsDropdown
          row={row}
          refetch={tableProps.fetch}
          actions={[
            (props) => (
              <ProviderAccountDetailsButton
                row={props.row}
                providerCustomerUuid={provider.customer_uuid}
              />
            ),
          ]}
        />
      )}
      columns={[
        {
          title: translate('Username'),
          render: ({ row }) => renderFieldOrDash(row.username),
          orderField: 'username',
          keys: ['username'],
        },
        {
          // Shown only where every offering the account backs exposes it.
          title: translate('Person'),
          render: ({ row }) =>
            renderFieldOrDash(row.user_full_name || row.user_username),
          keys: ['user_full_name', 'user_username'],
        },
        {
          title: translate('UID'),
          render: ({ row }) => renderFieldOrDash(row.uidnumber),
          keys: ['uidnumber'],
        },
        {
          title: translate('Primary GID'),
          render: ({ row }) => renderFieldOrDash(row.primarygroup),
          keys: ['primarygroup'],
        },
        {
          title: translate('Home directory'),
          render: ({ row }) => renderFieldOrDash(row.home_directory),
          keys: ['home_directory'],
        },
        {
          title: translate('Login shell'),
          render: ({ row }) => renderFieldOrDash(row.login_shell),
          keys: ['login_shell'],
        },
        {
          title: translate('Offerings'),
          render: ({ row }) => row.offering_count ?? 0,
          keys: ['offering_count'],
        },
        {
          title: translate('State'),
          // Same states, and so the same badges, as offering users.
          render: OfferingUserStateField,
          keys: ['state'],
        },
      ]}
    />
  );
};
