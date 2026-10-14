import classNames from 'classnames';

import { renderFieldOrDash } from '@/table/utils';

interface CheckoutPricingRowProps {
  label: any;
  value: any;
  total?: boolean;
  className?: string;
}

export const CheckoutPricingRow = ({
  label,
  value,
  total,
  className,
}: CheckoutPricingRowProps) => (
  <div
    className={classNames(
      'd-flex justify-content-between mb-5 text-secondary',
      className,
    )}
  >
    <div className={total ? 'font-medium' : 'text-quaternary'}>{label}</div>
    <div className="text-end font-medium">{renderFieldOrDash(value)}</div>
  </div>
);
