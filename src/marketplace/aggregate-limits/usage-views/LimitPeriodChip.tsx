import { CalendarIcon, InfinityIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Badge } from '@/core/Badge';
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

// Colour encodes the period family. The variants come from the theme's badge
// palette rather than fixed pastels, so the chip follows light and dark mode.
// `secondary` is a pale brand tint in this theme, and badge-light-secondary
// paints text and background the same colour — gray-600 keeps the neutral chip
// readable in both themes.
const PERIOD_VARIANT: Record<string, string> = {
  month: 'indigo',
  quarterly: 'success',
  annual: 'warning',
  total: 'gray-600',
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

// Small chip that makes the limit period unmistakable in dashboards full of
// side-by-side rows. The label inside is the server-rendered
// current_period_label, so the reader knows exactly which calendar window the
// figure applies to.
export const LimitPeriodChip: FC<Props> = ({
  limitPeriod,
  periodLabel,
  billingType,
  size = 'sm',
}) => {
  const iconSize = size === 'sm' ? 12 : 14;

  if (billingType === 'usage' && !limitPeriod) {
    return (
      <Badge
        variant="gray-600"
        size={size === 'sm' ? 'sm' : undefined}
        leftIcon={<InfinityIcon weight="bold" size={iconSize} />}
        pill
        light
        tooltip={translate(
          'Usage-based component — no limit period defined; values are raw measurements.',
        )}
      >
        {translate('No cap')}
      </Badge>
    );
  }

  const familyLabel = familyLabelFor(limitPeriod);
  // "Total · Total" reads as a stutter — only append the window when it says
  // something the family label does not.
  const rawWindow = periodLabel && periodLabel !== '—' ? periodLabel : null;
  const window = rawWindow === familyLabel ? null : rawWindow;

  return (
    <Badge
      variant={PERIOD_VARIANT[limitPeriod ?? ''] ?? 'warning'}
      size={size === 'sm' ? 'sm' : undefined}
      leftIcon={
        limitPeriod === 'total' ? (
          <InfinityIcon weight="bold" size={iconSize} />
        ) : (
          <CalendarIcon weight="bold" size={iconSize} />
        )
      }
      pill
      light
      tooltip={window ? `${familyLabel} · ${window}` : familyLabel}
    >
      {familyLabel}
      {window && <span className="ms-1 fw-normal">· {window}</span>}
    </Badge>
  );
};
