import { FC } from 'react';
import {
  BasePublicPlan,
  OfferingComponent,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { Tip } from '@waldur/core/Tooltip';
import { getPlanUnitAbbr } from '@waldur/marketplace/orders/utils';

interface ResourceRateFieldProps {
  row: Resource;
  data: PublicOfferingDetails[];
  isLoading: boolean;
}

const normalize = (value: number, factor: number) =>
  (value || 0) / (factor || 1);

export const ResourceRateField: FC<ResourceRateFieldProps> = ({
  row,
  data,
  isLoading,
}) => {
  if (isLoading) {
    return <LoadingSpinnerIcon />;
  }

  const offering = data?.find((o) => o.uuid === row.offering_uuid);
  if (!offering) return <>—</>;

  const component = offering.components?.find(
    (c: OfferingComponent) => c.billing_type === 'limit',
  );
  if (!component?.type) return <>—</>;

  const plan = offering.plans?.find(
    (p: BasePublicPlan) => p.uuid === row.plan_uuid,
  );
  const priceStr = plan?.prices?.[component.type];
  if (priceStr == null) return <>—</>;
  const price = Number(priceStr);

  const rawLimit = row.limits?.[component.type] ?? 0;
  const limit = normalize(rawLimit, component.factor);
  const rate = limit * price;
  const unitAbbr = row.plan_unit ? getPlanUnitAbbr(row.plan_unit) : '';

  const rateLabel = `${defaultCurrency(rate)}${unitAbbr}`;
  const unit = component.measured_unit || component.type;
  const tooltipBody = `${limit} ${unit} × ${defaultCurrency(price)}/${unit}`;

  return (
    <Tip id={`rate-${row.uuid}`} label={rateLabel} body={tooltipBody}>
      <span className="cursor-help text-decoration-underline-dotted">
        {rateLabel}
      </span>
    </Tip>
  );
};
