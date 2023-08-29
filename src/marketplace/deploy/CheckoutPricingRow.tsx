export const CheckoutPricingRow = ({ label, value }) => (
  <div className="d-flex justify-content-between">
    <p>{label}</p>
    <p className="text-end">{value || '-'}</p>
  </div>
);
