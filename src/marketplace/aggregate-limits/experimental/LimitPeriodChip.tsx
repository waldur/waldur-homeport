import { CalendarIcon, InfinityIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { translate } from '@/i18n';

interface Props {
  // Raw OfferingComponent.limit_period field: 'month' | 'quarterly' | 'annual' | 'total' | null
  limitPeriod?: string | null;
  // Server-rendered current period label, e.g. "September 2026", "Q3 2026", "2026", "Total".
  periodLabel?: string | null;
  // 'usage' | 'limit'
  billingType?: string;
  size?: 'sm' | 'md';
}

const PERIOD_STYLE: Record<string, { bg: string; text: string }> = {
  month: { bg: '#dbeafe', text: '#1d4ed8' },
  quarterly: { bg: '#dcfce7', text: '#15803d' },
  annual: { bg: '#fef3c7', text: '#b45309' },
  total: { bg: '#e5e7eb', text: '#374151' },
};

function familyLabelFor(limitPeriod: string | null | undefined): string {
  switch (limitPeriod) {
    case 'month':
      return translate('Monthly');
    case 'quarterly':
      return translate('Quarterly');
    case 'annual':
      return translate('Annual');
    case 'total':
      return translate('Total');
    default:
      return translate('Unknown period');
  }
}

// Small, colour-coded chip that makes the limit period unmistakable in
// dashboards full of side-by-side cards. Colour encodes the period family;
// the label inside is the server-rendered current_period_label so the
// reader knows exactly which calendar window the chart applies to.
export const LimitPeriodChip: FC<Props> = ({
  limitPeriod,
  periodLabel,
  billingType,
  size = 'sm',
}) => {
  if (billingType === 'usage' && !limitPeriod) {
    return (
      <span
        className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1"
        style={{
          background: '#f3f4f6',
          color: '#6b7280',
          fontSize: size === 'sm' ? 11 : 13,
          fontWeight: 600,
          lineHeight: 1,
        }}
        title={translate(
          'Usage-based component — no limit period defined; values are raw measurements.',
        )}
      >
        <InfinityIcon weight="bold" size={size === 'sm' ? 12 : 14} />
        {translate('No cap')}
      </span>
    );
  }

  const style = PERIOD_STYLE[limitPeriod ?? ''] ?? {
    bg: '#fde68a',
    text: '#92400e',
  };

  const familyLabel = familyLabelFor(limitPeriod);
  const window = periodLabel && periodLabel !== '—' ? periodLabel : null;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className="d-inline-flex align-items-center gap-1 rounded-pill px-2 py-1"
      style={{
        background: style.bg,
        color: style.text,
        fontSize: size === 'sm' ? 11 : 13,
        fontWeight: 600,
        lineHeight: 1,
      }}
      title={window ? `${familyLabel} · ${window}` : familyLabel}
    >
      {limitPeriod === 'total' ? (
        <InfinityIcon weight="bold" size={iconSize} />
      ) : (
        <CalendarIcon weight="bold" size={iconSize} />
      )}
      <span>{familyLabel}</span>
      {window && (
        <span className="ms-1 fw-normal" style={{ opacity: 0.85 }}>
          · {window}
        </span>
      )}
    </span>
  );
};
