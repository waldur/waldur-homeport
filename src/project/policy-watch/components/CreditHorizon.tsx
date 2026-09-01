import {
  Icon,
  InfoIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import { FC } from 'react';
import { Variant } from 'react-bootstrap/types';

import { formatDate, formatISODate, formatRelative } from '@/core/dateUtils';
import { FeaturedIcon } from '@/core/FeaturedIcon';
import { WidgetCard } from '@/dashboard/WidgetCard';
import { translate } from '@/i18n';

import { CreditEvent } from '../types';

// The design system's featured icon is keyed by severity — Error, Warning,
// Success, Gray — with the matching semantic glyph, rather than by subject
// matter. What each event is stays in its title. `secondary` has no featured
// icon style, so it falls through to the success green; `dark` is the grey one.
const TONE_ICON: Record<CreditEvent['tone'], Icon> = {
  danger: XCircleIcon,
  warning: WarningCircleIcon,
  muted: InfoIcon,
};

const TONE_VARIANT: Record<CreditEvent['tone'], Variant> = {
  danger: 'danger',
  warning: 'warning',
  muted: 'dark',
};

// An event dated today is in effect now. Relative formatting would render it
// from midnight ("17 hours ago"), which reads as history rather than as the
// state the reader is looking at.
const relativeLabel = (date: string): string =>
  date === formatISODate(new Date())
    ? translate('today')
    : formatRelative(date);

// A policy fires on an estimate. It is carried as a date so that it sorts
// against the scheduled events, but printing that date would overstate what is
// actually known about it.
const metaLabel = (event: CreditEvent): string =>
  event.kind === 'policy'
    ? translate('{relative} · policy', { relative: relativeLabel(event.date) })
    : translate('{date} · {relative}', {
        date: formatDate(event.date),
        relative: relativeLabel(event.date),
      });

interface Props {
  events: CreditEvent[];
}

/**
 * Everything that ends, soonest first, each entry stating what it does rather
 * than only when it happens. Ordering alone cannot carry that: an expiry
 * forfeits money while resources keep running, a project end date stops the
 * work without touching the money, and an empty balance stops neither.
 */
export const CreditHorizon: FC<Props> = ({ events }) => (
  <WidgetCard cardTitle={translate('What happens next')} className="mb-5">
    <div className="separator mt-4 mb-5" />
    {events.length === 0 ? (
      <p className="text-muted mb-0">
        {translate(
          'Nothing is scheduled to end: the credit has no expiry date, and neither the project nor its resources have an end date.',
        )}
      </p>
    ) : (
      events.map((event, index) => {
        const isLast = index === events.length - 1;
        return (
          // Index is part of the key, not kind+date alone: every reached policy
          // is dated today, so a project with both a project cap and an
          // organization cap at their thresholds produced two identical keys.
          <div
            className="d-flex gap-4"
            key={`${event.kind}-${event.date}-${index}`}
          >
            <div className="d-flex flex-column align-items-center">
              {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
              <FeaturedIcon
                IconComponent={TONE_ICON[event.tone]}
                variant={TONE_VARIANT[event.tone]}
                size="sm"
              />
              {!isLast && <div className="border-start flex-grow-1 my-2" />}
            </div>
            <div className={isLast ? 'mb-0' : 'mb-5'}>
              <div className="d-flex flex-wrap align-items-baseline gap-2">
                <span className="fw-bold">{event.title}</span>
                <small className="text-muted">{metaLabel(event)}</small>
              </div>
              <div className="text-muted">{event.consequence}</div>
            </div>
          </div>
        );
      })
    )}
  </WidgetCard>
);
