import { translate } from 'waldur-i18n-runtime';
import {
  MyTask,
  OfferingTeamSlot,
  ProviderRequestedOffering,
} from 'waldur-js-client';
import { Column } from 'waldur-table';
import { Badge } from 'waldur-ui';

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

export const getTaskColumns = (): Column<MyTask>[] => [
  {
    id: 'needed',
    title: translate('What is needed'),
    render: ({ row: task }) => (
      <PortalLink href={taskUrl(task)}>
        <Stacked main={task.needed_label} sub={task.detail} />
      </PortalLink>
    ),
  },
  {
    id: 'proposal',
    title: translate('Proposal'),
    render: ({ row: task }) =>
      task.proposal_name ? (
        <Stacked main={task.proposal_name} sub={task.proposal_slug} />
      ) : (
        DASH
      ),
  },
  {
    id: 'call',
    title: translate('Step'),
    render: ({ row: task }) =>
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
    id: 'due',
    title: translate('Due'),
    render: ({ row: task }) => (
      <Due at={task.due_at} overdue={task.is_overdue} />
    ),
  },
];

export const getRequestColumns = (
  withActions = true,
): Column<ProviderRequestedOffering>[] => [
  {
    id: 'offering',
    orderField: 'offering__name',
    title: translate('Offering'),
    render: ({ row }) => (
      <Stacked main={row.offering_name} sub={row.plan_details?.name} />
    ),
  },
  {
    id: 'call',
    orderField: 'call__name',
    title: translate('Call'),
    render: ({ row }) => (
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
    id: 'round',
    title: translate('Current round'),
    render: ({ row }) =>
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
    id: 'requested',
    orderField: 'created',
    title: translate('Requested'),
    render: ({ row }) => (
      <Stacked
        main={formatDate(row.created)}
        sub={row.created_by_name || null}
      />
    ),
  },
  {
    id: 'state',
    orderField: 'state',
    title: translate('State'),
    render: ({ row }) => {
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
    id: 'proposals',
    title: translate('Proposals'),
    render: ({ row }) => row.proposals_count,
  },
  ...(withActions
    ? [
        {
          id: 'actions',
          title: '',
          render: ({ row }) => <RequestActions row={row} />,
        },
      ]
    : []),
];

export const getSlotColumns = (): Column<OfferingTeamSlot>[] => [
  {
    id: 'proposal',
    title: translate('Proposal'),
    render: ({ row: slot }) => {
      return (
        <InternalLink href={proposalHref(slot.proposal_uuid)}>
          <Stacked main={slot.proposal_name} sub={slot.proposal_slug} />
        </InternalLink>
      );
    },
  },
  {
    id: 'step',
    title: translate('Step'),
    render: ({ row: slot }) => (
      <StepCell step={slot.step_name} phase={slot.phase} sub={slot.call_name} />
    ),
  },
  {
    id: 'offering',
    title: translate('Offering'),
    render: ({ row: slot }) => slot.offering_name,
  },
  {
    id: 'holder',
    title: translate('Held by'),
    render: ({ row: slot }) => {
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
    id: 'due',
    title: translate('Due'),
    render: ({ row: slot }) => <Due at={slot.due_at} overdue={slot.overdue} />,
  },
];
