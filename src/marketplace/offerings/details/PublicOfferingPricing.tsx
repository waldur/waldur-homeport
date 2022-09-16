import { FunctionComponent, useState } from 'react';
import { Card, FormCheck, Stack } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';

import { ExportFullPriceList } from './ExportFullPriceList';
import { PublicOfferingCardTitle } from './PublicOfferingCardTitle';
import { PricingPlanDetailsList } from './PublicOfferingPricingPlanDetailsList';
import { PublicOfferingPricingPlanItem } from './PublicOfferingPricingPlanItem';
import './PublicOfferingPricing.scss';

interface PublicOfferingPricingProps {
  offering: Offering;
  canDeploy?: boolean;
}

export const PublicOfferingPricing: FunctionComponent<PublicOfferingPricingProps> =
  ({ offering, canDeploy }) => {
    const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
    const [period, setPeriod] = useState<'monthly' | 'yearly'>('yearly');
    const switchPeriod = () => {
      setPeriod(period === 'monthly' ? 'yearly' : 'monthly');
    };
    const isSinglePlan = offering.plans.length === 1;

    return (
      <Card className="public-offering-pricing mb-10" id="pricing">
        <Card.Body>
          <PublicOfferingCardTitle>
            {translate('Pricing')}
          </PublicOfferingCardTitle>
          <div className="text-center">
            <h2 className="mb-16">
              {translate('Ready to sign up? (Custom title)')}
            </h2>

            {/* Period Switch */}
            <Stack
              direction="horizontal"
              gap={5}
              className="justify-content-center fw-bold mb-16"
            >
              <label
                className={period === 'yearly' ? 'text-muted' : 'text-primary'}
                onClick={() => setPeriod('monthly')}
              >
                {translate('Billed monthly')}
              </label>
              <FormCheck
                checked={period === 'yearly'}
                type="switch"
                onChange={switchPeriod}
              />
              <label
                className={period === 'monthly' ? 'text-muted' : 'text-primary'}
                onClick={() => setPeriod('yearly')}
              >
                {translate('Billed yearly (20% discount)')}
              </label>
            </Stack>

            {/* Pricing Plans */}
            <div className="d-flex scroll-x py-2 mb-5">
              <div className="d-flex align-items-stretch justify-content-center w-100">
                <div className="d-flex align-items-center">
                  {offering.plans.map((plan, i) => (
                    <PublicOfferingPricingPlanItem
                      key={i}
                      offering={offering}
                      plan={plan}
                      singlePlan={isSinglePlan}
                      canDeploy={canDeploy}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="text-end mb-10 px-20">
              <ExportFullPriceList offering={offering} />
            </div>

            {showExperimentalUiComponents && (
              <>
                <div className="bg-gray-200 mw-xl-800px mw-lg-100 mx-auto p-5 mb-8 rounded">
                  {translate('All plans comes with')}:
                </div>
                <div className="d-flex justify-content-center mb-16">
                  {[1, 2, 3].map((item) => (
                    <PricingPlanDetailsList
                      key={item}
                      items={[
                        { title: 'SLA', value: '24/7 - 12 hour' },
                        { title: 'Support', value: 'Chat' },
                        { title: 'SLA', value: '24/7 - 12 hour' },
                        { title: 'Support', value: 'Chat' },
                      ]}
                      className="mx-4"
                    />
                  ))}
                </div>

                <h2 className="mb-8">{translate('Other requirements?')}</h2>
                <div className="mb-10">
                  <Link
                    state=""
                    className="text-decoration-underline text-dark text-hover-primary fs-6 mb-2 fw-bold"
                  >
                    {translate('Contact vendor')}
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    );
  };

PublicOfferingPricing.defaultProps = {
  canDeploy: true,
};
