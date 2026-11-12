import { useMemo } from 'react';
import { createFetcher } from 'waldur-api-client';
import { translate } from 'waldur-i18n-runtime';
import {
  marketplaceOrdersApproveByProvider,
  marketplaceOrdersList,
  marketplaceOrdersRejectByProvider,
  OrderDetails,
  OrderState,
} from 'waldur-js-client';
import { useManagedMutation } from 'waldur-shell';
import { Column, Table, useTable } from 'waldur-table';
import { Badge, BaseButton, SegmentedControl } from 'waldur-ui';

import {
  InternalLink,
  PageHeader,
  PortalLink,
  useStableColumns,
} from '../components';
import { DASH, formatAmount, formatDate } from '../format';
import { providerOrderUrl } from '../links';
import { APPROVE_ORDER, can, REJECT_ORDER, useGrants } from '../permissions';
import { Provider } from '../providers';
import { PROVIDER_CALLS_QUERY_KEY } from '../queries';
import { navigate, pageHref, proposalHref, useRoute } from '../router';

const FILTERS: Record<string, OrderState[]> = {
  waiting: ['pending-provider'],
  // The applicant's organisation owes a purchase order before the order
  // reaches the provider: nothing to do yet, but it is coming.
  'purchase-order': ['pending-consumer'],
  provisioning: ['executing', 'pending-project', 'pending-start-date'],
  done: ['done'],
  refused: ['rejected', 'canceled', 'erred'],
};

/**
 * What the award grants against what the applicant asked, per component.
 * A cut is the thing a provider checks first: it was assessed as feasible
 * at the requested size, and is now asked to deliver another.
 */
const AwardedLimits = ({ order }: { order: OrderDetails }) => {
  const awarded = order.award?.awarded_limits ?? {};
  const requested = order.award?.requested_limits;
  const keys = Object.keys({ ...awarded, ...(requested ?? {}) });
  if (keys.length === 0) {
    return <>{DASH}</>;
  }
  return (
    <div className="flex flex-col">
      {keys.map((key) => {
        const granted = awarded[key] as number | undefined;
        const asked = requested?.[key] as number | undefined;
        const changed = requested && asked !== granted;
        return (
          <span key={key}>
            {key}: {formatAmount(granted ?? null)}
            {changed ? (
              <span className="text-quaternary">
                {' '}
                {translate('(asked {amount})', {
                  amount: formatAmount(asked ?? null),
                })}
              </span>
            ) : null}
          </span>
        );
      })}
      {requested === null ? (
        <span className="text-xs text-quaternary">
          {translate('Added by the call manager')}
        </span>
      ) : null}
    </div>
  );
};

type BadgeTone = 'warning' | 'blue' | 'success' | 'danger' | 'neutral';

/** Built per render so the labels follow the loaded language. */
const getStateBadge = (state: string): { label: string; variant: BadgeTone } =>
  ({
    'pending-provider': {
      label: translate('Waiting for you'),
      variant: 'warning' as const,
    },
    'pending-consumer': {
      label: translate('Purchase order owed'),
      variant: 'warning' as const,
    },
    'pending-project': {
      label: translate('Waiting for the project'),
      variant: 'blue' as const,
    },
    'pending-start-date': {
      label: translate('Waiting for the start date'),
      variant: 'blue' as const,
    },
    executing: { label: translate('Provisioning'), variant: 'blue' as const },
    done: { label: translate('Provisioned'), variant: 'success' as const },
    rejected: { label: translate('Refused'), variant: 'danger' as const },
    canceled: { label: translate('Canceled'), variant: 'neutral' as const },
    erred: { label: translate('Failed'), variant: 'danger' as const },
  })[state] ?? { label: state, variant: 'neutral' };

const invalidateQueries = [{ queryKey: [PROVIDER_CALLS_QUERY_KEY] }];

/**
 * Approve to provision; refuse with a reason. A refused award order
 * provisions nothing, and the offering then takes no part in the award's
 * extensions or final report.
 */
const AwardOrderActions = ({ order }: { order: OrderDetails }) => {
  const grants = useGrants();
  // ORDER_PROVIDER_SOURCES: the offering, its organisation, and that
  // organisation's service provider.
  const scopes = {
    offeringUuid: order.offering_uuid,
    customerUuid: order.provider_uuid,
    serviceProvider: true,
  };
  const mayApprove = can(grants.data, APPROVE_ORDER, scopes);
  const mayReject = can(grants.data, REJECT_ORDER, scopes);
  const approve = useManagedMutation({
    mutationFn: () =>
      marketplaceOrdersApproveByProvider({ path: { uuid: order.uuid } }),
    confirmation: {
      title: translate('Provision the award on {offering}?', {
        offering: order.offering_name,
      }),
      body: translate(
        '{proposal} was awarded in {call}. Approving creates the resource in {project}.',
        {
          proposal: order.award?.proposal_name,
          call: order.award?.call_name,
          project: order.project_name,
        },
      ),
      options: { type: 'success', positiveButton: translate('Approve') },
    },
    invalidateQueries,
    closeModal: false,
    successMessage: translate('Award approved for provisioning.'),
    errorMessage: translate('Could not approve the award.'),
  });

  const refuse = useManagedMutation<unknown, unknown, { input?: string }>({
    mutationFn: ({ input }) =>
      marketplaceOrdersRejectByProvider({
        path: { uuid: order.uuid },
        body: { provider_rejection_comment: input ?? '' },
      }),
    confirmation: {
      title: translate('Refuse the award on {offering}?', {
        offering: order.offering_name,
      }),
      body: translate(
        'Nothing is provisioned for {proposal}. The call managers of {call} are told, with your reason.',
        {
          proposal: order.award?.proposal_name,
          call: order.award?.call_name,
        },
      ),
      options: {
        type: 'danger',
        positiveButton: translate('Refuse'),
        showInput: true,
        inputRequired: true,
        inputLabel: translate('Reason'),
      },
    },
    invalidateQueries,
    closeModal: false,
    successMessage: translate('Award refused.'),
    errorMessage: translate('Could not refuse the award.'),
  });

  // Hidden, not disabled, while the answer is sent: the row then leaves
  // the "waiting" list. Each is also hidden from a member whose role does
  // not carry it.
  if (
    order.state !== 'pending-provider' ||
    approve.isPending ||
    refuse.isPending ||
    !(mayApprove || mayReject)
  ) {
    return null;
  }
  return (
    <div className="flex justify-end gap-2">
      {mayReject ? (
        <BaseButton
          size="sm"
          variant="tertiary"
          label={translate('Refuse')}
          onClick={() => refuse.mutate()}
        />
      ) : null}
      {mayApprove ? (
        <BaseButton
          size="sm"
          variant="primary"
          label={translate('Approve')}
          onClick={() => approve.mutate()}
        />
      ) : null}
    </div>
  );
};

export const getAwardColumns = (
  providerUuid: string | undefined,
): Column<OrderDetails>[] => [
  {
    id: 'proposal',
    title: translate('Awarded proposal'),
    render: ({ row: order }) => (
      <div className="flex flex-col">
        {order.award?.can_read ? (
          <InternalLink href={proposalHref(order.award.proposal_uuid)}>
            {order.award.proposal_name}
          </InternalLink>
        ) : (
          (order.award?.proposal_name ?? DASH)
        )}
        <span className="text-xs text-quaternary">
          {order.award?.call_name} · {order.award?.round_name}
        </span>
      </div>
    ),
  },
  {
    id: 'offering',
    title: translate('Offering'),
    render: ({ row: order }) => (
      <div className="flex flex-col">
        <span>{order.offering_name}</span>
        <span className="text-xs text-quaternary">{order.project_name}</span>
      </div>
    ),
  },
  {
    id: 'limits',
    title: translate('Awarded'),
    render: ({ row: order }) => <AwardedLimits order={order} />,
  },
  {
    id: 'po',
    title: translate('Purchase order'),
    render: ({ row: order }) =>
      order.attachment || order.request_comment
        ? order.request_comment || translate('Document attached')
        : DASH,
  },
  {
    id: 'created',
    orderField: 'created',
    title: translate('Placed'),
    render: ({ row: order }) => (
      <PortalLink href={providerUuid ? providerOrderUrl(order.uuid) : null}>
        {formatDate(order.created)}
      </PortalLink>
    ),
  },
  {
    id: 'state',
    orderField: 'state',
    title: translate('State'),
    render: ({ row: order }) => {
      const badge = getStateBadge(order.state);
      return (
        <Badge variant={badge.variant} shape="pill" hasBullet>
          {badge.label}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    title: '',
    render: ({ row: order }) => <AwardOrderActions order={order} />,
  },
];

const fetchOrders = createFetcher(marketplaceOrdersList);

/** The award orders in one of the page's states, a page at a time. */
const AwardsTable = ({
  providerUuid,
  filter,
}: {
  providerUuid: string;
  filter: string;
}) => {
  const tableFilter = useMemo(
    () => ({
      provider_uuid: providerUuid,
      from_award: true,
      state: FILTERS[filter],
      type: ['Create'],
      // Newest first, until a column header is clicked.
      o: '-created',
    }),
    [providerUuid, filter],
  );
  const tableProps = useTable({
    // One table per state, so each keeps its own page and search.
    table: `provider-calls-awards-${filter}`,
    fetchData: fetchOrders,
    filter: tableFilter,
    queryField: 'query',
  });
  return (
    <Table
      {...tableProps}
      columns={useStableColumns(getAwardColumns(providerUuid))}
      // The page header names the list; the bar holds the search.
      hideTitle
      hasQuery
      emptyMessage={
        filter === 'waiting'
          ? translate('No award is waiting for your approval.')
          : translate('No awards here.')
      }
    />
  );
};

/**
 * After the award: the orders that provision it on the provider's
 * offerings. Approving one is the provider's go-ahead that it can deliver
 * what was granted, which can differ from what its team assessed before the
 * award; refusing it leaves the award unprovisioned on that offering.
 */
export const AwardsPage = ({ provider }: { provider?: Provider }) => {
  const { params } = useRoute();
  const requested = params.get('state');
  const filter = requested && requested in FILTERS ? requested : 'waiting';

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PageHeader
        title={translate('Awards')}
        description={translate(
          'Awarded proposals are provisioned as orders on your offerings. Check what was granted against what you assessed, then approve or refuse.',
        )}
      />
      <SegmentedControl
        className="self-start"
        value={filter}
        onValueChange={(value: string) =>
          navigate(pageHref('awards', { state: value }))
        }
        options={[
          { value: 'waiting', label: translate('Waiting for you') },
          {
            value: 'purchase-order',
            label: translate('Purchase order owed'),
          },
          { value: 'provisioning', label: translate('Provisioning') },
          { value: 'done', label: translate('Provisioned') },
          { value: 'refused', label: translate('Refused or failed') },
        ]}
      />
      {/* Without a provider the endpoint would list every order the user
          can see; one is selected as soon as the providers have loaded. */}
      {provider ? (
        <AwardsTable providerUuid={provider.uuid} filter={filter} />
      ) : null}
    </div>
  );
};
