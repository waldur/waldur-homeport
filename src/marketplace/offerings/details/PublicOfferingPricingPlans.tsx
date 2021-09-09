import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { translate } from '@waldur/i18n';
import { Offering, Plan } from '@waldur/marketplace/types';
import './PublicOfferingPricingPlans.scss';

interface PublicOfferingPricingPlansProps {
  offering: Offering;
}

const planTypeLabel = {
  'usage-based': translate('Usage based'),
  'limit-based': translate('Limit based'),
  'fixed-price': translate('Fixed price'),
  'one-time': translate('One time'),
  few: translate('One time on plan switch'),
};

export const PublicOfferingPricingPlans: FunctionComponent<PublicOfferingPricingPlansProps> = ({
  offering,
}) => (
  <div className="pricingPlans">
    {offering.plans.map((plan: Plan, i: number) => (
      <div
        key={i}
        className={classNames('pricingPlans__item', {
          'm-b': i !== offering.plans.length - 1,
        })}
      >
        <div>
          <b>{plan.name}</b>
          <FormattedHtml html={plan.description} />
        </div>
        <div className="pricingPlans__item__pricing">
          <span className="pricingPlans__item__pricing__price">
            {planTypeLabel[plan.plan_type]} (&euro;{plan.minimal_price})
          </span>
          <span className="pricingPlans__item__pricing__unit">
            {translate('Per {unit}', { unit: plan.unit })}
          </span>
        </div>
      </div>
    ))}
  </div>
);
