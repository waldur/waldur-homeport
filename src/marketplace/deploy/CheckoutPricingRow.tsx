export const CheckoutPricingRow = ({ label, value }) => (
  <div className="d-flex justify-content-between mb-3">
    <div>{label}</div>
    <div className="text-end">{value || '-'}</div>
  </div>
);
