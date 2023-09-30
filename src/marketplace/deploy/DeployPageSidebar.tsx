import { useMemo } from 'react';
import { Card, FormCheck } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { flattenObject } from '@waldur/core/utils';
import { FieldError } from '@waldur/form';
import { formatJsx, translate } from '@waldur/i18n';
import { OrderSummary } from '@waldur/marketplace/details/OrderSummary';
import { Offering } from '@waldur/marketplace/types';

import { getCheckoutSummaryComponent } from '../common/registry';
import { OrderItemResponse } from '../orders/types';

import { OfferingConfigurationFormStep } from './types';
import { formErrorsSelector, scrollToView } from './utils';

interface DeployPageSidebarProps {
  offering: Offering;
  steps: OfferingConfigurationFormStep[];
  completedSteps: boolean[];
  updateMode?: boolean;
  cartItem?: OrderItemResponse;
}

export const DeployPageSidebar = (props: DeployPageSidebarProps) => {
  const CheckoutSummaryComponent = getCheckoutSummaryComponent(
    props.offering.type,
  );

  const errors = useSelector(formErrorsSelector);

  const nonRequiredErrors = useMemo(() => {
    const errorsFlatten = flattenObject(errors);
    const result = {};
    for (const key in errorsFlatten) {
      if (!errorsFlatten[key]) continue;
      if (Array.isArray(errorsFlatten[key])) {
        errorsFlatten[key].forEach((err: any) => {
          if (typeof err === 'string' && !err.includes('required')) {
            if (!(key in result)) Object.assign(result, { [key]: [] });
            result[key].push(err);
          }
        });
      } else if (
        typeof errorsFlatten[key] === 'string' &&
        !errorsFlatten[key].includes('required')
      ) {
        Object.assign(result, { [key]: errorsFlatten[key] });
      }
    }
    return result;
  }, [errors]);

  return (
    <div className="deploy-view-sidebar drawer drawer-end drawer-on w-350px">
      <Card className="card-flush border-0">
        <Card.Body>
          <h6 className="fs-7 ms-12">{translate('Progress')}</h6>

          <div className="stepper stepper-pills stepper-column d-flex flex-column mb-10">
            <div className="d-flex flex-row-auto w-100 w-lg-300px">
              <div className="stepper-nav">
                {props.steps.map((step, i) => (
                  <div
                    key={i}
                    className={
                      'stepper-item me-5' +
                      (props.completedSteps[i] ? ' completed' : '')
                    }
                  >
                    <div className="stepper-wrapper d-flex align-items-center">
                      {step.fields &&
                      step.fields.some((key) => nonRequiredErrors[key]) ? (
                        <Tip
                          label={
                            <FieldError
                              error={step.fields
                                .map((key) => nonRequiredErrors[key])
                                .flat()
                                .filter(Boolean)}
                            />
                          }
                          className="stepper-icon error"
                          id={`stepperErrorTip-${i}`}
                          placement="left"
                          autoWidth
                        >
                          <i className="fa fa-exclamation-circle" />
                        </Tip>
                      ) : (
                        <FormCheck className="stepper-icon form-check form-check-custom form-check-sm">
                          <FormCheck.Input
                            type="checkbox"
                            checked={props.completedSteps[i]}
                            className="rounded-circle"
                            readOnly
                          />
                        </FormCheck>
                      )}

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
            <CheckoutSummaryComponent
              offering={
                props.updateMode
                  ? { ...props.offering, uuid: props.cartItem.uuid }
                  : props.offering
              }
              updateMode={props.updateMode}
            />
          ) : (
            <OrderSummary
              offering={
                props.updateMode
                  ? { ...props.offering, uuid: props.cartItem.uuid }
                  : props.offering
              }
              updateMode={props.updateMode}
            />
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
