import { FunctionComponent, useMemo } from 'react';
import {
  ConnectedApp,
  oauthConnectedAppsList,
  RegistrationSourceEnum,
} from 'waldur-js-client';

import { getAuthHeader } from 'waldur-auth-core';
import { AlertItem } from 'waldur-ui';

import { formatDate, formatRelative } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { isImpersonating } from '@/user/termsGate';

import { ConnectedAppActions } from './ConnectedAppActions';
import { connectedAppsTable } from './constants';
import { McpConnectGuide } from './McpConnectGuide';

const describeRegistration = (source: RegistrationSourceEnum): string => {
  switch (source) {
    case 'dcr':
      return translate('Self-registered (DCR)');
    case 'cimd':
      return translate('Metadata document (CIMD)');
    case 'manual':
      return translate('Added by an administrator');
    default:
      // A kind added to the backend later shows as it is, never as vetted.
      return source;
  }
};

// Only a CIMD client has a host of its own. Others show the hosts they send
// the user back to.
const getHost = (row: ConnectedApp) =>
  row.client_host || row.redirect_hosts.join(', ');

const ConnectedAppsTable: FunctionComponent = () => {
  const filter = useMemo(() => ({}), []);
  const props = useTable({
    table: connectedAppsTable,
    fetchData: createFetcher(oauthConnectedAppsList),
    filter,
  });

  const columns: Column<ConnectedApp>[] = [
    {
      title: translate('Application'),
      render: ({ row }) => row.client_name,
      export: 'client_name',
    },
    {
      title: translate('Host'),
      render: ({ row }) => renderFieldOrDash(getHost(row)),
    },
    {
      title: translate('Registered via'),
      render: ({ row }) => describeRegistration(row.registration_source),
    },
    {
      title: translate('Scopes'),
      render: ({ row }) =>
        renderFieldOrDash(
          row.scopes.map((scope) => scope.description).join(', '),
        ),
    },
    {
      title: translate('First authorized'),
      render: ({ row }) => formatDate(row.authorized_at),
      export: 'authorized_at',
    },
    {
      title: translate('Last used'),
      render: ({ row }) =>
        row.last_used_at
          ? formatRelative(row.last_used_at)
          : renderFieldOrDash(null),
    },
  ];

  return (
    <>
      <McpConnectGuide
        hasApps={
          props.loading && !props.rows.length
            ? undefined
            : props.rows.length > 0
        }
      />
      <Table
        {...props}
        columns={columns}
        showPageSizeSelector={true}
        verboseName={translate('connected apps')}
        emptyMessage={translate(
          'Apps you allow to access your account, such as AI assistants connected through MCP, appear here.',
        )}
        rowActions={ConnectedAppActions}
      />
    </>
  );
};

// The API answers only the user's own sign-in: not staff impersonating them,
// nor the identity provider's token sent in OIDC access-token mode.
const getRefusal = (): string | null => {
  if (isImpersonating()) {
    return translate('Only the user can see and revoke their connected apps.');
  }
  if (getAuthHeader()?.startsWith('Bearer ')) {
    return translate(
      'Connected apps cannot be managed when you sign in with an access token.',
    );
  }
  return null;
};

export const ConnectedAppsList: FunctionComponent = () => {
  const refusal = getRefusal();
  return refusal ? (
    <>
      <McpConnectGuide hasApps={false} />
      <AlertItem variant="info" title={refusal} />
    </>
  ) : (
    <ConnectedAppsTable />
  );
};
