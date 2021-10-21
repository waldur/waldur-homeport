import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { PlanItemExpandableContent } from '@waldur/marketplace/offerings/details/PlanItemExpandableContent';
import { Offering, Plan } from '@waldur/marketplace/types';
import './PublicOfferingPricingPlanItem.scss';

interface PublicOfferingPricingPlanItemProps {
  offering: Offering;
  plan: Plan;
}

const planTypes = () => [
  { value: 'usage-based', label: translate('Usage based') },
  { value: 'limit-based', label: translate('Limit based') },
  { value: 'fixed-price', label: translate('Fixed price') },
  { value: 'one-time', label: translate('One time') },
  { value: 'few', label: translate('One time on plan switch') },
  { value: 'mixed', label: translate('Mixed') },
];

const getPlanTypeLabel = (key: string): string =>
  planTypes().find(({ value }) => value === key)?.label || 'N/A';

export const PublicOfferingPricingPlanItem: FunctionComponent<PublicOfferingPricingPlanItemProps> = ({
  offering,
  plan,
}) => {
  const [toggle, setToggle] = useState<boolean>(false);
  return (
    <div className="pricingPlanItem">
      <div
        className={classNames('pricingPlanItem__header', {
          'pricingPlanItem__header--expanded': toggle,
        })}
        onClick={() => setToggle(!toggle)}
      >
        <div>
          <b className="m-b-xs">{plan.name}</b>
          <FormattedHtml html={plan.description} />
        </div>
        <div className="pricingPlanItem__header__pricing">
          <span className="pricingPlanItem__header__pricing__price">
            {getPlanTypeLabel(plan.plan_type)} {defaultCurrency(plan.price)}
          </span>
          <span
            className={classNames('pricingPlanItem__header__pricing__unit', {
              'pricingPlanItem__header__pricing__unit--expanded': toggle,
            })}
          >
            {translate('Per {unit}', { unit: plan.unit })}
          </span>
        </div>
      </div>
      {toggle && <PlanItemExpandableContent offering={offering} plan={plan} />}
    </div>
  );
};
