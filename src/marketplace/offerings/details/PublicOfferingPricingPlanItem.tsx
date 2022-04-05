import classNames from 'classnames';
import { FunctionComponent, useState } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { combinePrices } from '@waldur/marketplace/details/plan/utils';
import { PlanItemExpandableContent } from '@waldur/marketplace/offerings/details/PlanItemExpandableContent';
import { Offering, Plan } from '@waldur/marketplace/types';
import './PublicOfferingPricingPlanItem.scss';

interface PublicOfferingPricingPlanItemProps {
  offering: Offering;
  plan: Plan;
}

const planTypes = () => [
  { value: 'fixed', label: translate('Fixed price') },
  { value: 'usage', label: translate('Usage based') },
  { value: 'one', label: translate('One time') },
  { value: 'few', label: translate('One time on plan switch') },
  { value: 'limit', label: translate('Limit based') },
  { value: 'mixed', label: translate('Mixed') },
];

const getPlanTypeLabel = (key: string): string =>
  planTypes().find(({ value }) => value === key)?.label || 'N/A';

export const PublicOfferingPricingPlanItem: FunctionComponent<PublicOfferingPricingPlanItemProps> =
  ({ offering, plan }) => {
    const [toggle, setToggle] = useState<boolean>(false);
    const { total: totalPrice } = combinePrices(plan, null, null, offering);
    return (
      <div className="pricingPlanItem">
        <div
          className={classNames('pricingPlanItem__header', {
            'pricingPlanItem__header--expanded': toggle,
          })}
          onClick={() => setToggle(!toggle)}
        >
          <div>
            <b className="mb-1">{plan.name}</b>
            <FormattedHtml html={plan.description} />
          </div>
          <div className="pricingPlanItem__header__pricing">
            <span className="pricingPlanItem__header__pricing__price">
              {getPlanTypeLabel(plan.plan_type)} {defaultCurrency(totalPrice)}
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
        {toggle && (
          <PlanItemExpandableContent offering={offering} plan={plan} />
        )}
      </div>
    );
  };
