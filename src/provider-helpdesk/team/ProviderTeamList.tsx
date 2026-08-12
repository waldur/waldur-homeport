import { FC, useMemo } from 'react';
import {
  ProviderSupportUser,
  providerSupportUsersList,
} from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import { BooleanField } from '@/table/BooleanField';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { CapacityIndicator } from '../common/CapacityIndicator';
import { emptyTableFetcher } from '../common/emptyTableFetcher';
import { NoHelpdeskConfigured } from '../common/NoHelpdeskConfigured';
import { PROVIDER_ROLE_META } from '../common/roles';
import { useProviderHelpdesk } from '../common/useProviderHelpdesk';

import { AddSupportUserButton } from './AddSupportUserButton';
import { ProviderTeamRowActions } from './ProviderTeamRowActions';
import { TeamWorkload } from './TeamWorkload';

const TeamTable: FC<{ helpdeskUuid?: string }> = ({ helpdeskUuid }) => {
  const filter = useMemo(
    () => ({ provider_helpdesk_uuid: helpdeskUuid }),
    [helpdeskUuid],
  );
  const tableProps = useTable({
    table: 'provider-support-users',
    fetchData: helpdeskUuid
      ? createFetcher(providerSupportUsersList)
      : emptyTableFetcher,
    filter,
    queryField: 'user_full_name',
  });

  const columns = useMemo<Array<Column<ProviderSupportUser>>>(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => renderFieldOrDash(row.user_full_name),
      },
      {
        title: translate('Email'),
        copyField: (row) => row.user_email ?? '',
        render: ({ row }) => renderFieldOrDash(row.user_email),
      },
      {
        title: translate('Role'),
        render: ({ row }) => {
          const meta = PROVIDER_ROLE_META[row.role ?? ''] ?? {
            variant: 'secondary',
            label: row.role ?? '',
          };
          return (
            <Badge variant={meta.variant} pill outline>
              {meta.label}
            </Badge>
          );
        },
      },
      {
        title: translate('Active'),
        render: ({ row }) => <BooleanField value={Boolean(row.is_active)} />,
      },
      {
        title: translate('Capacity'),
        render: ({ row }) => (
          <CapacityIndicator
            open={row.open_ticket_count}
            max={row.max_open_tickets ?? 0}
          />
        ),
      },
      {
        title: translate('Created'),
        render: ({ row }) => renderFieldOrDash(formatDate(row.created)),
      },
    ],
    [],
  );

  return (
    <>
      {helpdeskUuid && <TeamWorkload helpdeskUuid={helpdeskUuid} />}
      <Table
        {...tableProps}
        columns={columns}
        verboseName={translate('Team members')}
        hasQuery={true}
        showPageSizeSelector={true}
        tableActions={
          helpdeskUuid ? (
            <AddSupportUserButton
              helpdeskUuid={helpdeskUuid}
              refetch={tableProps.fetch}
            />
          ) : undefined
        }
        rowActions={ProviderTeamRowActions}
        placeholderComponent={
          helpdeskUuid ? undefined : <NoHelpdeskConfigured />
        }
      />
    </>
  );
};

export const ProviderTeamList: FC = () => {
  const customer = useCustomer();
  const { helpdesk, isLoading } = useProviderHelpdesk(
    customer?.service_provider_uuid,
  );
  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <TeamTable helpdeskUuid={helpdesk?.uuid} />;
};
