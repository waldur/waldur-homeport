import { FC } from 'react';

import { translate } from '@/i18n';

import { LimitPeriodChip } from './LimitPeriodChip';

interface ComponentOptionShape {
  offering_name: string;
  component_name: string;
  billing_type?: string;
  limit_period?: string | null;
  current_period_label?: string | null;
}

interface Props {
  option: ComponentOptionShape;
  // When true, render compactly for the *selected* (collapsed) state of a
  // react-select trigger — single line, smaller chip. When false, render
  // the dropdown row form with two lines.
  compact?: boolean;
}

// Used by every (offering · component) dropdown in the experimental section
// so the reader can never confuse a usage-based row with a limit-based one,
// and always sees the limit period for the latter without opening tooltips.
export const ComponentOptionLabel: FC<Props> = ({ option, compact }) => {
  const billingLabel =
    option.billing_type === 'limit'
      ? translate('Limit-based')
      : translate('Usage-based');
  if (compact) {
    return (
      <span className="d-inline-flex align-items-center gap-2">
        <span className="text-truncate">
          {option.offering_name} · {option.component_name}
        </span>
        <LimitPeriodChip
          billingType={option.billing_type}
          limitPeriod={option.limit_period}
          periodLabel={option.current_period_label}
        />
      </span>
    );
  }
  return (
    <div className="lh-sm">
      <div className="text-truncate">
        {option.offering_name} · {option.component_name}
      </div>
      <div className="d-flex align-items-center gap-2 mt-1">
        <small className="text-muted">{billingLabel}</small>
        <LimitPeriodChip
          billingType={option.billing_type}
          limitPeriod={option.limit_period}
          periodLabel={option.current_period_label}
        />
      </div>
    </div>
  );
};
