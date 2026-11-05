import { ThumbsDownIcon, ThumbsUpIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FunctionComponent, PropsWithChildren, ReactNode } from 'react';
import { ActionTakenEnum, InjectionSeverityEnum } from 'waldur-js-client';

import {
  Badge,
  BadgeVariant,
  HelpIcon,
  Tooltip,
  useBreakpointUp,
} from 'waldur-ui';

import { formatDateTime, formatShortDateTime } from '@/core/dateUtils';
import { formatUsageValue } from '@/core/formatNumber';
import { translate } from '@/i18n';

// Vocabulary shared by the two assistant channels. It lived in the
// authenticated list, which meant the anonymous panel imported from another
// page; more to the point, anything defined per-tab drifts — the two tabs
// already disagreed on whether an unrated reply counts as negative.

export const severityLabels: Record<InjectionSeverityEnum, string> = {
  critical: translate('Critical'),
  high: translate('High'),
  medium: translate('Medium'),
  low: translate('Low'),
  none: translate('None'),
};

export const getSeverityBadgeVariant = (
  severity: InjectionSeverityEnum,
): BadgeVariant => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'orange';
    case 'medium':
      return 'warning';
    case 'low':
      return 'secondary';
    case 'none':
      return 'success';
  }
};

export const getActionBadgeVariant = (
  action: ActionTakenEnum,
): BadgeVariant => {
  switch (action) {
    case 'block':
      return 'danger';
    case 'redact':
      return 'orange';
    case 'warn':
      return 'warning';
    case 'flag':
    default:
      return 'secondary';
  }
};

export const actionLabels: Record<ActionTakenEnum, string> = {
  block: translate('Block'),
  redact: translate('Redact'),
  warn: translate('Warn'),
  flag: translate('Flag'),
  allow: translate('Allow'),
};

/** Tooltip body naming what tripped the guard, for the severity badge. */
export const formatDetectionCategories = (
  injectionCategories: unknown,
  piiCategories: unknown,
): ReactNode => {
  const parts: string[] = [];
  if (Array.isArray(injectionCategories) && injectionCategories.length > 0) {
    parts.push(
      translate('Injection: {categories}', {
        categories: injectionCategories.join(', '),
      }),
    );
  }
  if (Array.isArray(piiCategories) && piiCategories.length > 0) {
    parts.push(
      translate('PII: {categories}', {
        categories: piiCategories.join(', '),
      }),
    );
  }
  if (parts.length === 0) return translate('Flagged');
  return <span style={{ whiteSpace: 'pre-line' }}>{parts.join('\n')}</span>;
};

/**
 * Prompt-cache reads and writes, one line each. A line is left out, not shown
 * as 0, when the provider did not report that figure: vLLM reports reads but
 * never writes, and "0 written" would claim a measurement nobody made.
 */
export const CacheFigures: FunctionComponent<{
  read?: number | null;
  write?: number | null;
}> = ({ read, write }) => (
  <>
    {read != null && (
      <div>
        {translate('{count} read from cache', {
          count: formatUsageValue(read),
        })}
      </div>
    )}
    {write != null && (
      <div>
        {translate('{count} written to cache', {
          count: formatUsageValue(write),
        })}
      </div>
    )}
  </>
);

/**
 * Input/output token split. Renders nothing when neither figure was recorded,
 * which is how turns predating per-message usage tracking read.
 *
 * Cache reads and writes are part of the input, so they annotate it in the
 * hover rather than inline, where they pushed the output figure past the
 * gutter's edge.
 */
export const TokenUsageBadge: FunctionComponent<{
  id: string;
  label: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  cacheReadTokens?: number | null;
  cacheWriteTokens?: number | null;
  prefix?: string;
}> = ({
  label,
  inputTokens,
  outputTokens,
  cacheReadTokens,
  cacheWriteTokens,
  prefix,
}) => {
  if (inputTokens == null && outputTokens == null) return null;
  // Per turn, the read reads better against the input it came out of.
  const read =
    inputTokens != null && cacheReadTokens != null
      ? translate('{read} of {input} input tokens read from cache ({ratio})', {
          read: formatUsageValue(cacheReadTokens),
          input: formatUsageValue(inputTokens),
          ratio: asPercent(inputTokens ? cacheReadTokens / inputTokens : null),
        })
      : null;
  return (
    <Tooltip
      label={
        read || cacheWriteTokens != null ? (
          <>
            <div>{label}</div>
            {read && <div>{read}</div>}
            <CacheFigures write={cacheWriteTokens} />
          </>
        ) : (
          label
        )
      }
    >
      <span className="text-quaternary whitespace-nowrap">
        {prefix}
        {inputTokens != null && <>↓ {formatUsageValue(inputTokens)}</>}
        {inputTokens != null && outputTokens != null && ' / '}
        {outputTokens != null && <>↑ {formatUsageValue(outputTokens)}</>}
      </span>
    </Tooltip>
  );
};

// The reviewer is deliberately the only grey one: it did not take part in the
// conversation, it graded it afterwards.
const SENDER_BADGES: Record<
  'user' | 'assistant' | 'reviewer',
  { variant: BadgeVariant; label: string }
> = {
  user: { variant: 'info', label: translate('User') },
  assistant: { variant: 'primary', label: translate('Assistant') },
  reviewer: { variant: 'neutral', label: translate('Reviewer') },
};

/**
 * Left column of a turn: role badge, timestamp, token usage. Shared so the two
 * channels cannot drift on how loud or how localised a turn's metadata reads —
 * they already had, on number formatting and on the narrow-viewport timestamp.
 *
 * `children` carries whatever only one channel has, e.g. the anonymous
 * transcript's offering click-throughs.
 */
export const MessageGutter: FunctionComponent<
  PropsWithChildren<{
    sender: keyof typeof SENDER_BADGES;
    created: string;
    tokenId: string;
    tokenLabel?: string;
    inputTokens?: number | null;
    outputTokens?: number | null;
    cacheReadTokens?: number | null;
    cacheWriteTokens?: number | null;
  }>
> = ({
  sender,
  created,
  tokenId,
  tokenLabel,
  inputTokens,
  outputTokens,
  cacheReadTokens,
  cacheWriteTokens,
  children,
}) => {
  const isDesktop = useBreakpointUp('sm');
  const formatDate = isDesktop ? formatDateTime : formatShortDateTime;

  return (
    <div className="message-gutter flex flex-col gap-1.5 text-quaternary">
      <div>
        <Badge variant={SENDER_BADGES[sender].variant} size="sm" tone="outline">
          {SENDER_BADGES[sender].label}
        </Badge>
      </div>
      <span className="whitespace-nowrap">{formatDate(created)}</span>
      <TokenUsageBadge
        id={tokenId}
        label={tokenLabel ?? translate('Message input / output tokens')}
        inputTokens={inputTokens}
        outputTokens={outputTokens}
        cacheReadTokens={cacheReadTokens}
        cacheWriteTokens={cacheWriteTokens}
      />
      {children}
    </div>
  );
};

export const asPercent = (value?: number | null) =>
  value == null ? translate('N/A') : `${Math.round(value * 100)}%`;

// The hint matters because the denominator is rated replies only — three
// thumbs-up and one thumbs-down reads as 75% (positive ÷ rated), not
// "something broke".
export const SatisfactionLabel: FunctionComponent<{ id?: string }> = () => (
  <>
    {translate('Satisfaction')}{' '}
    <HelpIcon
      label={translate(
        'Share of rated replies marked helpful: positive ÷ (positive + negative). Counts every rating ever submitted, not a recent window, and ignores replies nobody rated.',
      )}
    />
  </>
);

export const CacheRatioLabel: FunctionComponent = () => (
  <>
    {translate('Cache ratio')}{' '}
    <HelpIcon
      label={translate(
        "Share of input tokens served from the provider's prompt cache: cached ÷ input. Turns whose provider did not report cache hits are left out rather than counted as misses.",
      )}
    />
  </>
);

/** Null means nobody voted — distinct from a thumbs-down, and easy to conflate. */
type FeedbackSentiment = 'positive' | 'negative' | null;

// The two channels store the human verdict differently: a boolean on the
// authenticated message, +1/-1 on the anonymous one, where a row can also
// exist with no score at all because the nightly judge writes to it. Both
// normalise to this before rendering, so neither can decide on its own that
// "not positive" means negative.
export const toFeedbackSentiment = (
  score: boolean | number | null | undefined,
): FeedbackSentiment => {
  if (score === true || score === 1) return 'positive';
  if (score === false || score === -1) return 'negative';
  return null;
};

// Verdict strip under a rated reply. The comment is a slot rather than a prop
// because the two channels present it differently — the authenticated row
// clamps and expands long comments — while everything that decides *meaning*
// (sentiment → colour, icon, label) is settled here, once.
export const FeedbackStrip: FunctionComponent<
  PropsWithChildren<{
    sentiment: Exclude<FeedbackSentiment, null>;
    category?: ReactNode;
  }>
> = ({ sentiment, category, children }) => {
  const positive = sentiment === 'positive';
  const variant = positive ? 'success' : 'danger';

  return (
    <div
      className={classNames(
        'message-feedback mt-1 px-2.5 py-1.5 rounded-lg border border-secondary small',
        positive ? 'bg-success-subtle' : 'bg-danger-subtle',
      )}
    >
      <Badge
        variant={variant}
        size="sm"
        leftIcon={
          positive ? (
            <ThumbsUpIcon weight="fill" />
          ) : (
            <ThumbsDownIcon weight="fill" />
          )
        }
        tone="outline"
        className="message-feedback-label"
      >
        {positive
          ? translate('Positive feedback')
          : translate('Negative feedback')}
      </Badge>
      {Boolean(category) && (
        <Badge
          variant={variant}
          size="sm"
          tone="outline"
          className="message-feedback-category"
        >
          {category}
        </Badge>
      )}
      {children}
    </div>
  );
};

// react-query serialises the query key, so anything non-primitive that lands in
// a filter value (a DOM event from a text input, for instance) crashes the whole
// page with "cannot serialize cyclic structures". The request still carries the
// real object; only the key is flattened.
export const toQueryKey = (statsFilter: Record<string, unknown>) =>
  Object.entries(statsFilter)
    .map(([key, value]) => [key, String(value)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
