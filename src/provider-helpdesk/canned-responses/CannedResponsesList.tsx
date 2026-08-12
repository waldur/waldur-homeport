import { FC, useMemo } from 'react';
import {
  ProviderCannedResponse,
  providerCannedResponsesList,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { createFetcher } from '@/table/api';
import Table from '@/table/Table';
import { Column } from '@/table/types';
import { useTable } from '@/table/useTable';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer } from '@/workspace/hooks';

import { emptyTableFetcher } from '../common/emptyTableFetcher';
import { NoHelpdeskConfigured } from '../common/NoHelpdeskConfigured';
import { useProviderHelpdesk } from '../common/useProviderHelpdesk';

import { AddCannedResponseButton } from './AddCannedResponseButton';
import { CannedResponsesRowActions } from './CannedResponsesRowActions';

const CannedTable: FC<{ helpdeskUuid?: string }> = ({ helpdeskUuid }) => {
  const filter = useMemo(
    () => ({ provider_helpdesk_uuid: helpdeskUuid }),
    [helpdeskUuid],
  );
  const tableProps = useTable({
    table: 'provider-canned-responses',
    fetchData: helpdeskUuid
      ? createFetcher(providerCannedResponsesList)
      : emptyTableFetcher,
    filter,
    queryField: 'name',
  });

  const columns = useMemo<Array<Column<ProviderCannedResponse>>>(
    () => [
      {
        title: translate('Name'),
        render: ({ row }) => renderFieldOrDash(row.name),
      },
      {
        title: translate('Category'),
        render: ({ row }) => renderFieldOrDash(row.category),
      },
      {
        title: translate('Usage'),
        render: ({ row }) => <>{row.usage_count}</>,
      },
      {
        title: translate('Preview'),
        render: ({ row }) => (
          <span
            className="text-muted text-truncate d-inline-block"
            style={{ maxWidth: 320 }}
          >
            {row.text}
          </span>
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
    <Table
      {...tableProps}
      columns={columns}
      verboseName={translate('Canned responses')}
      hasQuery={true}
      showPageSizeSelector={true}
      tableActions={
        helpdeskUuid ? (
          <AddCannedResponseButton
            helpdeskUuid={helpdeskUuid}
            refetch={tableProps.fetch}
          />
        ) : undefined
      }
      rowActions={CannedResponsesRowActions}
      placeholderComponent={helpdeskUuid ? undefined : <NoHelpdeskConfigured />}
    />
  );
};

export const CannedResponsesList: FC = () => {
  const customer = useCustomer();
  const { helpdesk, isLoading } = useProviderHelpdesk(
    customer?.service_provider_uuid,
  );
  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <CannedTable helpdeskUuid={helpdesk?.uuid} />;
};
