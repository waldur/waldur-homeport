import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { PlanDetailsList } from '@waldur/marketplace/details/plan/PlanDetailsList';
import { combinePrices } from '@waldur/marketplace/details/plan/utils';
import { Offering, Plan } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { PricingPlanDetailsList } from './PublicOfferingPricingPlanDetailsList';

interface PricingPlanItemProps {
  offering: Offering;
  plan: Plan;
  canDeploy?: boolean;
  singlePlan?: boolean;
}

export const PublicOfferingPricingPlanItem: FunctionComponent<PricingPlanItemProps> =
  ({ offering, plan, canDeploy, singlePlan }) => {
    // TODO: fix this later
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
    const recommended = false;
    const { total: totalPrice } = combinePrices(plan, null, null, offering);

    return (
      <div
        className={classNames('pricing-plan bg-gray-100 min-w-200px', {
          recommended: recommended,
          'single-plan': singlePlan,
        })}
      >
        {recommended && (
          <div className="recommended">
            <span className="bg-dark text-light">
              {translate('Recommended')}
            </span>
          </div>
        )}
        <h4
          className={classNames(
            'pricing-plan-title',
            recommended ? 'bg-primary text-white' : 'bg-body text-dark',
          )}
        >
          {plan.name}
        </h4>
        <div className="pricing-plan-info">
          <p className="description fs-7 text-muted">{plan.description}</p>
          <div className="m-4">
            <h5 className="text-nowrap">
              Base: {defaultCurrency(totalPrice)}
              <small className="text-muted">/mo</small>
            </h5>
            <hr />
            <PlanDetailsList
              offering={offering}
              plan={plan}
              formGroupClassName="plan-components form-group row"
              columnClassName="col-sm-12"
            />
            <hr />
            <em className="text-muted">Setup Fee: $0</em>
          </div>
          <div className="mx-2">
            <Link
              state={canDeploy ? 'marketplace-offering-user' : ''}
              params={{ offering_uuid: offering.uuid }}
              className={classNames(
                'btn w-100',
                recommended ? 'btn-primary' : 'btn-dark',
                { disabled: !canDeploy },
              )}
            >
              {translate('Deploy')}
            </Link>
          </div>
        </div>
        {showExperimentalUiComponents && (
          <div className="pricing-plan-details bg-body">
            <PricingPlanDetailsList
              items={[
                { title: 'Component 1', value: '12GB' },
                { title: 'Component 2', value: '3vCPU' },
                { title: 'SLA', value: '24/7 - 12 hour' },
                { title: 'Support', value: 'Chat' },
                { title: 'Modules', value: 'Basic, Homeport, Mastermind' },
              ]}
            />
          </div>
        )}
      </div>
    );
  };

PublicOfferingPricingPlanItem.defaultProps = {
  canDeploy: true,
  singlePlan: false,
};
