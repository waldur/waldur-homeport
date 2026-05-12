import {
  ArrowsInSimpleIcon,
  BellIcon,
  CalendarBlankIcon,
  CoinsIcon,
  PauseCircleIcon,
  TargetIcon,
  TrashIcon,
} from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';

import { formatMediumDateTime, formatRelative } from '@/core/dateUtils';
import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

import {
  PolicyWatchData,
  PolicyWatchEvent,
  PolicyWatchEventType,
} from '../types';

const ICON_MAP: Record<PolicyWatchEventType, ReactNode> = {
  'credit-funded': <CoinsIcon weight="bold" />,
  'policy-notified': <BellIcon weight="bold" />,
  'policy-downscaled': <ArrowsInSimpleIcon weight="bold" />,
  'policy-paused': <PauseCircleIcon weight="bold" />,
  'policy-terminated': <TrashIcon weight="bold" />,
  'policy-cleared': <BellIcon weight="bold" />,
  today: <TargetIcon weight="bold" />,
  'projected-policy': <CalendarBlankIcon weight="bold" />,
  'projected-credit-exhaustion': <CalendarBlankIcon weight="bold" />,
};

const TONE_MAP: Record<PolicyWatchEventType, string> = {
  'credit-funded': 'info',
  'policy-notified': 'warning',
  'policy-downscaled': 'danger',
  'policy-paused': 'danger',
  'policy-terminated': 'danger',
  'policy-cleared': 'success',
  today: 'primary',
  'projected-policy': 'secondary',
  'projected-credit-exhaustion': 'secondary',
};

const EventItem: FC<{ event: PolicyWatchEvent }> = ({ event }) => {
  const tone = TONE_MAP[event.type];
  const isToday = event.type === 'today';
  return (
    <div className="timeline-item">
      <div className="timeline-line w-30px" />
      <div className="timeline-icon symbol symbol-circle symbol-32px me-4">
        <div
          className={`symbol-label fs-5 fw-bold bg-light-${tone} text-${tone}`}
        >
          {ICON_MAP[event.type]}
        </div>
      </div>
      <div className="timeline-content py-2 pe-3">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div className="flex-grow-1">
            <div className="fs-7 text-muted">
              <span
                className={`fs-6 me-3 ${isToday ? 'fw-bold' : 'fw-semibold'}`}
              >
                {event.title}
              </span>
              <span title={formatMediumDateTime(event.date)}>
                {formatRelative(event.date)}
              </span>
            </div>
            {event.subtitle && (
              <div className="fs-7 text-muted mt-1">{event.subtitle}</div>
            )}
            {event.resourceName && (
              <div className="fs-7 mt-1">
                <span className="text-muted">{translate('Resource')}: </span>
                {event.resourceName}
              </div>
            )}
          </div>
          {event.isFuture && (
            <StateIndicator
              label={translate('Projected')}
              variant="secondary"
              size="sm"
              outline
              pill
            />
          )}
        </div>
      </div>
    </div>
  );
};

interface Props {
  data: PolicyWatchData;
}

export const TimelineView: FC<Props> = ({ data }) => {
  if (data.events.length <= 1) {
    return (
      <div className="alert alert-info">
        {translate(
          'No policy events to display yet. As cost and SLURM policies fire, they will appear here.',
        )}
      </div>
    );
  }

  return (
    <div className="timeline timeline-border-dashed px-5 py-5">
      {data.events.map((e) => (
        <EventItem event={e} key={e.id} />
      ))}
    </div>
  );
};
