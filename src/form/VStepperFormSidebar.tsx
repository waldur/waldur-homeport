import classNames from 'classnames';
import { FC, ReactNode, useMemo } from 'react';
import { Button, Card, FormCheck } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';

import { Link } from '@waldur/core/Link';
import { Tip } from '@waldur/core/Tooltip';
import { flattenObject } from '@waldur/core/utils';
import { formatJsx, translate } from '@waldur/i18n';
import { scrollToView } from '@waldur/marketplace/deploy/utils';

import { FieldError } from './FieldError';
import { FloatingButton } from './FloatingButton';
import { VStepperFormStep } from './VStepperFormStep';

interface VStepperFormSidebarProps {
  title?: string;
  steps?: VStepperFormStep[];
  completedSteps?: boolean[];
  submitting: boolean;
  header?: ReactNode;
  summary?: ReactNode;
  customSummary?: ReactNode;
  submitLabel?: string;
  submitDisabled?: boolean;
  hasSubmitButton?: boolean;
  hasTos?: boolean;
  extraNode?: ReactNode;
  errors?: any;
}

export type InjectedVStepperFormSidebarProps = Pick<
  VStepperFormSidebarProps,
  'steps' | 'completedSteps' | 'submitting'
>;

export const VStepperFormSidebar: FC<VStepperFormSidebarProps> = (props) => {
  const isVMode = useMediaQuery({ maxWidth: 1200 });

  const nonRequiredErrors = useMemo(() => {
    const errorsFlatten = flattenObject(props.errors);
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
  }, [props.errors]);

  return (
    <div
      className={
        isVMode
          ? 'v-stepper-form-sidebar container-xxl'
          : 'v-stepper-form-sidebar drawer drawer-end drawer-on'
      }
    >
      <Card className="card-flush border-0 w-100">
        <Card.Body>
          {props.header}

          {props.title && <h6 className="fs-7">{props.title}</h6>}

          {props.steps && (
            <div className="stepper stepper-pills stepper-column d-flex flex-column mb-10">
              <div className="d-flex flex-row-auto w-100 w-lg-300px">
                <div className="stepper-nav">
                  {props.steps.map((step, i) => (
                    <div
                      key={i}
                      className={classNames(
                        'stepper-item me-5',
                        props.completedSteps[i] && 'completed',
                      )}
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

                        <div
                          className="stepper-label"
                          aria-hidden="true"
                          onClick={() => scrollToView(step.id)}
                        >
                          <h3 className="stepper-title">
                            {i + 1}. {step.label}
                          </h3>
                        </div>
                      </div>

                      <div className="stepper-line h-20px"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {props.customSummary ? (
            props.customSummary
          ) : (
            <>
              {props.summary && (
                <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
                  {props.summary}
                </div>
              )}

              {/* Clicking on this button will trigger submit on the parent form */}
              {props.hasSubmitButton && (
                <FloatingButton>
                  <Button
                    size="sm"
                    variant="primary"
                    type="submit"
                    disabled={props.submitDisabled || props.submitting}
                    className="w-100"
                  >
                    {props.submitting && (
                      <i className="fa fa-spinner fa-spin me-1" />
                    )}
                    {props.submitLabel}
                  </Button>
                  )
                </FloatingButton>
              )}
            </>
          )}

          {props.hasTos && (
            <p className="text-center fs-9 mt-2 mb-0">
              {translate(
                'By ordering, you agree to the platform <tos>terms of service</tos> and <pp>privacy policy</pp>.',
                {
                  tos: (s: string) => <Link state="about.tos" label={s} />,
                  pp: (s: string) => <Link state="about.privacy" label={s} />,
                },
                formatJsx,
              )}
            </p>
          )}

          {props.extraNode}
        </Card.Body>
      </Card>
    </div>
  );
};

VStepperFormSidebar.defaultProps = {
  completedSteps: [],
  hasTos: true,
  hasSubmitButton: true,
  submitLabel: translate('Submit'),
};
