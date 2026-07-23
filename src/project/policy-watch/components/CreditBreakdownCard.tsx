import { CalendarBlankIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { formatDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';

import { getWatchColors } from '../chartColors';
import { CreditBreakdown } from '../types';

interface Props {
  breakdown: CreditBreakdown;
  endDate?: string | null;
  daysUntilEndDate?: number | null;
}

interface Segment {
  key: 'used' | 'lost' | 'remaining';
  label: string;
  value: number;
  color: string;
  hint: string;
}

export const CreditBreakdownCard: FC<Props> = ({
  breakdown,
  endDate,
  daysUntilEndDate,
}) => {
  const { granted, used, lost, remaining } = breakdown;

  if (granted <= 0) {
    return null;
  }

  // Theme colors, matching the app's chart convention (brand green = the
  // consumed/primary series, gray-300 = remaining/inactive, danger = negative).
  const c = getWatchColors();
  const segments: Segment[] = [
    {
      key: 'used',
      label: translate('Used'),
      value: used,
      color: c.brand300,
      hint: translate('Credit consumed against real usage.'),
    },
    {
      key: 'lost',
      label: translate('Lost'),
      value: lost,
      color: c.danger,
      hint: translate(
        'Credit forfeited to the minimum-draw floor or expiry — hard to recover.',
      ),
    },
    {
      key: 'remaining',
      label: translate('Remaining'),
      value: remaining,
      color: c.neutral,
      hint: translate('Credit still available to spend.'),
    },
  ];

  const pct = (value: number) =>
    Math.max(0, Math.min(100, (value / granted) * 100));
  const expiringSoon = daysUntilEndDate != null && daysUntilEndDate < 31;

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-baseline mb-2">
        <span className="fw-semibold">{translate('Credit lifecycle')}</span>
        <span className="text-muted small">
          {translate('Allocated')}: {defaultCurrency(granted)}
        </span>
      </div>
      <div
        className="d-flex rounded overflow-hidden mb-3"
        style={{ height: 16 }}
      >
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              style={{ width: `${pct(s.value)}%`, backgroundColor: s.color }}
              title={`${s.label}: ${defaultCurrency(s.value)}`}
            />
          ) : null,
        )}
      </div>
      <div className="d-flex flex-wrap gap-4 align-items-start">
        {segments.map((s) => (
          <div key={s.key} title={s.hint}>
            <div className="d-flex align-items-center gap-2">
              <span
                className="rounded-circle d-inline-block"
                style={{ width: 10, height: 10, backgroundColor: s.color }}
              />
              <small className="text-muted">{s.label}</small>
            </div>
            <div className="fw-semibold">
              {defaultCurrency(s.value)}
              <small className="text-muted ms-1">
                {((s.value / granted) * 100).toFixed(0)}%
              </small>
            </div>
          </div>
        ))}
        {endDate && (
          <div className="ms-auto text-md-end">
            <div className="d-flex align-items-center gap-2">
              <CalendarBlankIcon
                weight="bold"
                className={expiringSoon ? 'text-danger' : 'text-muted'}
              />
              <small className="text-muted">{translate('Expires')}</small>
            </div>
            <div className={`fw-semibold ${expiringSoon ? 'text-danger' : ''}`}>
              {formatDate(endDate)}
              {daysUntilEndDate != null && (
                <small
                  className={`ms-1 ${expiringSoon ? 'text-danger' : 'text-muted'}`}
                >
                  {translate('(in {days}d)', { days: daysUntilEndDate })}
                </small>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
