import { defaultCurrency } from '@/core/formatCurrency';

export const ProjectCostField = ({ row }) =>
  defaultCurrency(
    (row.billing_price_estimate && row.billing_price_estimate.total) || 0,
  );
