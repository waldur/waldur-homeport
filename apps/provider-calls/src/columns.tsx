import { translate } from 'waldur-i18n-runtime';
import {
  MyTask,
  OfferingTeamSlot,
  ProviderRequestedOffering,
} from 'waldur-js-client';
import { Badge, DataTableColumn } from 'waldur-ui';

import { InternalLink, PortalLink } from './components';
import {
  DASH,
  formatDate,
  formatRelative,
  requestStateBadge,
  slotStatusBadge,
} from './format';
import { publicCallUrl, taskUrl } from './links';
import { RequestActions } from './RequestActions';
import { proposalHref } from './router';

/** Shared by the Inbox and the full lists, so both read the same. */

const Due = ({ at, overdue }: { at: string | null; overdue: boolean }) =>
  at ? (
    <div className="flex flex-col">
      <span className={overdue ? 'font-medium text-danger' : undefined}>
        {formatRelative(at)}
      </span>
      <span className="text-xs text-quaternary">{formatDate(at)}</span>
    </div>
  ) : (
    <span className="text-quaternary">{translate('No deadline')}</span>
  );

/**
 * Marks work that comes after the award: an extension's assessment or the
 * closing's report. Evaluation work, the usual case, carries no mark.
 */
const PhaseBadge = ({ phase }: { phase?: string | null }) => {
  if (phase === 'extension') {
    return (
      <Badge variant="purple" shape="pill">
        {translate('Extension')}
      </Badge>
    );
  }
  if (phase === 'closing') {
    return (
      <Badge variant="indigo" shape="pill">
        {translate('Closing')}
      </Badge>
    );
  }
  return null;
};

const StepCell = ({
  step,
  phase,
  sub,
}: {
  step: string;
  phase?: string | null;
  sub?: string | null;
}) => (
  <div className="flex flex-col items-start gap-1">
    <span className="flex items-center gap-2">
      {step}
      <PhaseBadge phase={phase} />
    </span>
    {sub ? <span className="text-xs text-quaternary">{sub}</span> : null}
  </div>
);

const Stacked = ({ main, sub }: { main: string; sub?: string | null }) => (
  <div className="flex flex-col">
    <span>{main}</span>
    {sub ? <span className="text-xs text-quaternary">{sub}</span> : null}
  </div>
);

export const getTaskColumns = (): DataTableColumn<MyTask>[] => [
  {
    key: 'needed',
    header: translate('What is needed'),
    render: (task) => (
      <PortalLink href={taskUrl(task)}>
        <Stacked main={task.needed_label} sub={task.detail} />
      </PortalLink>
    ),
  },
  {
    key: 'proposal',
    header: translate('Proposal'),
    render: (task) =>
      task.proposal_name ? (
        <Stacked main={task.proposal_name} sub={task.proposal_slug} />
      ) : (
        DASH
      ),
  },
  {
    key: 'call',
    header: translate('Step'),
    render: (task) =>
      task.step_name ? (
        <StepCell
          step={task.step_name}
          phase={task.phase}
          sub={task.call_name}
        />
      ) : (
        <Stacked main={task.call_name ?? DASH} />
      ),
  },
  {
    key: 'due',
    header: translate('Due'),
    render: (task) => <Due at={task.due_at} overdue={task.is_overdue} />,
  },
];

export const getRequestColumns = (
  withActions = true,
): DataTableColumn<ProviderRequestedOffering>[] => [
  {
    key: 'offering',
    header: translate('Offering'),
    render: (row) => (
      <Stacked main={row.offering_name} sub={row.plan_details?.name} />
    ),
  },
  {
    key: 'call',
    header: translate('Call'),
    render: (row) => (
      <div className="flex flex-col">
        <PortalLink href={publicCallUrl(row.call_uuid)}>
          {row.call_name}
        </PortalLink>
        <span className="text-xs text-quaternary">
          {row.call_managing_organisation}
        </span>
      </div>
    ),
  },
  {
    key: 'round',
    header: translate('Current round'),
    render: (row) =>
      row.current_round ? (
        <Stacked
          main={row.current_round.name ?? DASH}
          sub={
            row.current_round.cutoff_time
              ? translate('closes {date}', {
                  date: formatDate(row.current_round.cutoff_time),
                })
              : null
          }
        />
      ) : (
        DASH
      ),
  },
  {
    key: 'requested',
    header: translate('Requested'),
    render: (row) => (
      <Stacked
        main={formatDate(row.created)}
        sub={row.created_by_name || null}
      />
    ),
  },
  {
    key: 'state',
    header: translate('State'),
    render: (row) => {
      const badge = requestStateBadge(row.state);
      return (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={badge.variant} shape="pill" hasBullet>
            {badge.label}
          </Badge>
          {row.state === 'canceled' && row.rejection_reason ? (
            <span className="text-xs text-quaternary">
              {row.rejection_reason}
            </span>
          ) : null}
        </div>
      );
    },
  },
  {
    key: 'proposals',
    header: translate('Proposals'),
    render: (row) => row.proposals_count,
  },
  ...(withActions
    ? [
        {
          key: 'actions',
          header: '',
          render: (row: ProviderRequestedOffering) => (
            <RequestActions row={row} />
          ),
        },
      ]
    : []),
];

export const getSlotColumns = (): DataTableColumn<OfferingTeamSlot>[] => [
  {
    key: 'proposal',
    header: translate('Proposal'),
    render: (slot) => {
      return (
        <InternalLink href={proposalHref(slot.proposal_uuid)}>
          <Stacked main={slot.proposal_name} sub={slot.proposal_slug} />
        </InternalLink>
      );
    },
  },
  {
    key: 'step',
    header: translate('Step'),
    render: (slot) => (
      <StepCell step={slot.step_name} phase={slot.phase} sub={slot.call_name} />
    ),
  },
  {
    key: 'offering',
    header: translate('Offering'),
    render: (slot) => slot.offering_name,
  },
  {
    key: 'holder',
    header: translate('Held by'),
    render: (slot) => {
      const badge = slotStatusBadge(slot.status);
      return (
        <div className="flex flex-col items-start gap-1">
          <span>
            {slot.delegate_name ??
              (slot.stand_in
                ? translate('Nobody on the team: stand in')
                : translate('The offering managers'))}
          </span>
          <Badge variant={badge.variant} shape="pill" hasBullet>
            {badge.label}
          </Badge>
        </div>
      );
    },
  },
  {
    key: 'due',
    header: translate('Due'),
    render: (slot) => <Due at={slot.due_at} overdue={slot.overdue} />,
  },
];
