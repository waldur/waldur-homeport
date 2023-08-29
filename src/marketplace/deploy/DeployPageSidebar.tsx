import { Card, FormCheck } from 'react-bootstrap';

import { Link } from '@waldur/core/Link';
import { formatJsx, translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { getCheckoutSummaryComponent } from '../common/registry';

import { OfferingConfigurationFormStep } from './types';
import { scrollToView } from './utils';

interface DeployPageSidebarProps {
  offering: Offering;
  steps: OfferingConfigurationFormStep[];
  completedSteps: boolean[];
}

export const DeployPageSidebar = ({
  offering,
  steps,
  completedSteps,
}: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent = getCheckoutSummaryComponent(offering.type);

  return (
    <div className="deploy-view-sidebar drawer drawer-end drawer-on w-350px">
      <Card className="card-flush border-0">
        <Card.Body>
          <h6 className="fs-7 ms-12">{translate('Progress')}</h6>

          <div className="stepper stepper-pills stepper-column d-flex flex-column mb-10">
            <div className="d-flex flex-row-auto w-100 w-lg-300px">
              <div className="stepper-nav">
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={
                      'stepper-item me-5' +
                      (completedSteps[i] ? ' completed' : '')
                    }
                  >
                    <div className="stepper-wrapper d-flex align-items-center">
                      <FormCheck className="stepper-icon form-check form-check-custom form-check-sm">
                        <FormCheck.Input
                          type="checkbox"
                          checked={completedSteps[i]}
                          className="rounded-circle"
                          readOnly
                        />
                      </FormCheck>

                      <a
                        className="stepper-label"
                        onClick={() => scrollToView(step.id)}
                      >
                        <h3 className="stepper-title">
                          {i + 1}. {step.label}
                        </h3>
                      </a>
                    </div>

                    <div className="stepper-line h-20px"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {CheckoutSummaryComponent ? (
            <CheckoutSummaryComponent offering={offering} />
          ) : (
            <OrderSummary offering={offering} />
          )}

          <p className="text-center fs-9 mt-2">
            {translate(
              'By ordering, you agree to the <tos>terms of service</tos> and <pp>privacy policy</pp>.',
              {
                tos: (s: string) => <Link state="about.tos" label={s} />,
                pp: (s: string) => <Link state="about.privacy" label={s} />,
              },
              formatJsx,
            )}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};
