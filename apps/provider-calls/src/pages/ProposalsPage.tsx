import { translate } from 'waldur-i18n-runtime';
import { ProviderRequestedResource } from 'waldur-js-client';
import { Badge, DataTableColumn } from 'waldur-ui';

import {
  PageHeader,
  InternalLink,
  QueryTableCard,
  withRows,
} from '../components';
import { DASH, formatAmount, proposalStateBadge } from '../format';
import { Provider } from '../providers';
import { PROPOSALS_SHOWN, useRequestedResources } from '../queries';
import { proposalHref } from '../router';

const limitsText = (limits?: Record<string, number>) => {
  const entries = Object.entries(limits ?? {});
  return entries.length
    ? entries.map(([key, value]) => `${key}: ${formatAmount(value)}`).join(', ')
    : DASH;
};

/**
 * What applicants asked of the provider's offerings, one row per resource
 * request. Drafts never reach the provider; neither does what a proposal
 * asks of other providers.
 */
export const ProposalsPage = ({ provider }: { provider?: Provider }) => {
  const query = useRequestedResources(provider?.uuid);
  const rowsQuery = withRows(query, query.data?.rows);
  const total = query.data?.total ?? 0;

  const columns: DataTableColumn<ProviderRequestedResource>[] = [
    {
      key: 'proposal',
      header: translate('Proposal'),
      render: (row) => (
        <InternalLink href={proposalHref(row.proposal_uuid)}>
          <div className="flex flex-col">
            <span>{row.proposal_name}</span>
            <span className="text-xs text-quaternary">{row.proposal_slug}</span>
          </div>
        </InternalLink>
      ),
    },
    {
      key: 'call',
      header: translate('Call'),
      render: (row) => (
        <div className="flex flex-col">
          <span>{row.call_name}</span>
          <span className="text-xs text-quaternary">{row.round_name}</span>
        </div>
      ),
    },
    {
      key: 'offering',
      header: translate('Offering'),
      render: (row) => row.offering_name,
    },
    {
      key: 'limits',
      header: translate('Requested'),
      render: (row) => limitsText(row.limits),
    },
    {
      key: 'po',
      header: translate('Purchase order'),
      render: (row) =>
        row.purchase_order_required
          ? row.has_purchase_order
            ? translate('Supplied')
            : translate('Missing')
          : DASH,
    },
    {
      key: 'state',
      header: translate('State'),
      render: (row) => {
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
      <QueryTableCard
        query={rowsQuery}
        columns={columns}
        rowKey={(row) => row.uuid}
        emptyMessage={translate(
          'No submitted proposal requests your offerings yet.',
        )}
        footer={
          total > PROPOSALS_SHOWN ? (
            <div className="border-t border-t-secondary p-3 text-sm text-quaternary">
              {translate('Showing the newest {shown} of {total}.', {
                shown: PROPOSALS_SHOWN,
                total,
              })}
            </div>
          ) : null
        }
      />
    </div>
  );
};
