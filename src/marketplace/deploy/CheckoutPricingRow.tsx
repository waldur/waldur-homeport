interface CheckoutPricingRowProps {
  label: any;
  value: any;
  className?: string;
}

export const CheckoutPricingRow = ({
  label,
  value,
  className,
}: CheckoutPricingRowProps) => (
  <div className={'d-flex justify-content-between mb-3 ' + (className || '')}>
    <div>{label}</div>
    <div className="text-end">{value || '-'}</div>
  </div>
);
