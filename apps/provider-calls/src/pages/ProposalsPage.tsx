import { useMemo } from 'react';
import { createFetcher } from 'waldur-api-client';
import { translate } from 'waldur-i18n-runtime';
import {
  proposalRequestedResourcesList,
  ProviderRequestedResource,
} from 'waldur-js-client';
import { Column, Table, useTable } from 'waldur-table';
import { Badge } from 'waldur-ui';

import { PageHeader, InternalLink, useStableColumns } from '../components';
import { DASH, formatAmount, proposalStateBadge } from '../format';
import { Provider } from '../providers';
import { proposalHref } from '../router';

const limitsText = (limits?: Record<string, number>) => {
  const entries = Object.entries(limits ?? {});
  return entries.length
    ? entries.map(([key, value]) => `${key}: ${formatAmount(value)}`).join(', ')
    : DASH;
};

const fetchRequestedResources = createFetcher(proposalRequestedResourcesList);

/**
 * What applicants asked of the provider's offerings, one row per resource
 * request. Drafts never reach the provider; neither does what a proposal
 * asks of other providers.
 */
export const ProposalsPage = ({ provider }: { provider?: Provider }) => {
  const providerUuid = provider?.uuid;
  const filter = useMemo(
    () => ({
      ...(providerUuid ? { provider_uuid: providerUuid } : {}),
      // Newest first, until a column header is clicked.
      o: '-created',
    }),
    [providerUuid],
  );
  const tableProps = useTable({
    table: 'provider-calls-proposals',
    fetchData: fetchRequestedResources,
    filter,
    queryField: 'query',
  });

  const columns: Column<ProviderRequestedResource>[] = [
    {
      id: 'proposal',
      orderField: 'proposal__name',
      title: translate('Proposal'),
      render: ({ row }) => (
        <InternalLink href={proposalHref(row.proposal_uuid)}>
          <div className="flex flex-col">
            <span>{row.proposal_name}</span>
            <span className="text-xs text-quaternary">{row.proposal_slug}</span>
          </div>
        </InternalLink>
      ),
    },
    {
      id: 'call',
      orderField: 'call__name',
      title: translate('Call'),
      render: ({ row }) => (
        <div className="flex flex-col">
          <span>{row.call_name}</span>
          <span className="text-xs text-quaternary">{row.round_name}</span>
        </div>
      ),
    },
    {
      id: 'offering',
      orderField: 'offering__name',
      title: translate('Offering'),
      render: ({ row }) => row.offering_name,
    },
    {
      id: 'limits',
      title: translate('Requested'),
      render: ({ row }) => limitsText(row.limits),
    },
    {
      id: 'po',
      title: translate('Purchase order'),
      render: ({ row }) =>
        row.purchase_order_required
          ? row.has_purchase_order
            ? translate('Supplied')
            : translate('Missing')
          : DASH,
    },
    {
      id: 'state',
      orderField: 'proposal__state',
      title: translate('State'),
      render: ({ row }) => {
        const badge = proposalStateBadge(row.proposal_state);
        return (
          <Badge variant={badge.variant} shape="pill" hasBullet>
            {badge.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Proposals')}
        description={translate(
          'What applicants request of your offerings, newest first.',
        )}
      />
      <Table
        {...tableProps}
        columns={useStableColumns(columns)}
        // The page header names the list; the bar holds the search.
        hideTitle
        hasQuery
        emptyMessage={translate(
          'No submitted proposal requests your offerings yet.',
        )}
      />
    </div>
  );
};
