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
      'd-flex justify-content-between mb-5 text-gray-700',
      className,
    )}
  >
    <div className={total ? 'fw-bold' : 'text-muted'}>{label}</div>
    <div className="text-end fw-bold">{renderFieldOrDash(value)}</div>
  </div>
);
