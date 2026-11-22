import { ReactNode } from 'react';
import { translate } from 'waldur-i18n-runtime';
import {
  Project,
  ResourceApiKeyStatus,
  SpendingLimitUsage,
} from 'waldur-js-client';
import { Badge, BadgeVariant, Progress } from 'waldur-ui';

import { formatDay, periodLabel, useFormatMoney } from './format';
import { onLinkClick, sectionHref } from './router';
import { limitShare } from './services';

/**
 * A page's column: centred, up to 1120px wide, as the design draws it,
 * rather than stretched across a wide screen.
 */
export const PAGE_CLASS =
  'mx-auto flex w-full max-w-280 flex-1 flex-col gap-6 px-4 pt-7 pb-12 sm:px-8';

/**
 * A page's title row: a context line (the organisation on the overview,
 * the project elsewhere, linking back to it), the title and what the page
 * is for, with the page's actions to the right.
 */
export const PageHeader = ({
  project,
  title,
  description,
  actions,
}: {
  project: Project;
  title: string;
  description: ReactNode;
  actions?: ReactNode;
}) => {
  const isOverview = title === project.name;
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {isOverview ? (
          <span className="text-sm text-tertiary">{project.customer_name}</span>
        ) : (
          <a
            href={sectionHref(project.uuid, 'overview')}
            onClick={onLinkClick(sectionHref(project.uuid, 'overview'))}
            className="self-start text-sm text-tertiary hover:text-secondary hover:underline"
          >
            {project.name}
          </a>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="max-w-180 text-sm text-tertiary">{description}</div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:flex-nowrap">
          {actions}
        </div>
      ) : null}
    </header>
  );
};

/** One spending limit: "This month · $18.40 of $50" over a bar. */
export const LimitMeter = ({
  status,
  prefix,
}: {
  status: SpendingLimitUsage;
  /** Whose limit, before the period: "Your key · Today". */
  prefix?: string;
}) => {
  const formatMoney = useFormatMoney();
  const share = limitShare(status);
  const label = prefix
    ? `${prefix} · ${periodLabel(status.period)}`
    : periodLabel(status.period);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between gap-3 text-xs">
        <span className="text-tertiary">{label}</span>
        <span className={status.reached ? 'text-warning' : 'text-secondary'}>
          {translate('{used} of {limit}', {
            used: formatMoney(status.used) ?? status.used,
            limit: formatMoney(status.limit) ?? status.limit,
          })}
        </span>
      </div>
      <Progress
        value={share}
        size="sm"
        variant={status.reached || share >= 80 ? 'warning' : undefined}
        label={label}
      />
    </div>
  );
};

const STATE_BADGES: Record<
  ResourceApiKeyStatus['state'],
  { variant: BadgeVariant; label: () => string }
> = {
  OK: { variant: 'success', label: () => translate('Active') },
  Paused: { variant: 'warning', label: () => translate('Paused') },
  Creating: { variant: 'info', label: () => translate('Being created') },
  Updating: { variant: 'info', label: () => translate('Changing') },
  Deleting: { variant: 'info', label: () => translate('Being deleted') },
  Deleted: { variant: 'neutral', label: () => translate('Deleted') },
  Erred: { variant: 'danger', label: () => translate('Failed') },
};

export const KeyStateBadge = ({
  keyStatus,
}: {
  keyStatus: ResourceApiKeyStatus;
}) => {
  const badge = STATE_BADGES[keyStatus.state] ?? STATE_BADGES.OK;
  return (
    <Badge
      variant={badge.variant}
      shape="pill"
      hasBullet
      className="shrink-0 whitespace-nowrap"
    >
      {badge.label()}
    </Badge>
  );
};

/** Under the state: why a key is paused and when it resumes, or what failed. */
export const keyStateNote = (key: ResourceApiKeyStatus): string | undefined => {
  if (key.state === 'Paused' && key.paused_by_limit) {
    return key.limit_resumes_at
      ? translate('Limit reached · resumes {when}', {
          when: formatDay(key.limit_resumes_at),
        })
      : translate('Limit reached · resumes when the limit is raised');
  }
  if (key.state === 'Creating') {
    return translate('The service is creating it.');
  }
  if (key.state === 'Erred') {
    return key.error_message?.trim() || undefined;
  }
  return undefined;
};

/** A small grey tag: a count or a fact about a service. */
export const Chip = ({ children }: { children: ReactNode }) => (
  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary">
    {children}
  </span>
);

/** A service's mark: its initials on a tile, as the design draws it. */
export const ServiceMark = ({
  name,
  size = 'md',
}: {
  name: string;
  size?: 'sm' | 'md';
}) => (
  <span
    aria-hidden="true"
    className={
      size === 'sm'
        ? 'flex size-8 shrink-0 items-center justify-center rounded-md bg-brand-solid text-xs font-bold text-white'
        : 'flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-solid text-xs font-bold text-white'
    }
  >
    {name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('')}
  </span>
);
