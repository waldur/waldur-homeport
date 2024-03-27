import classNames from 'classnames';
import { useMemo } from 'react';
import { FormCheck } from 'react-bootstrap';

import { Tip } from '@waldur/core/Tooltip';
import { flattenObject } from '@waldur/core/utils';
import { scrollToView } from '@waldur/marketplace/deploy/utils';

import { FieldError } from './FieldError';

export const FormSteps = ({ steps, completedSteps, errors }) => {
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
    <div className="stepper stepper-pills stepper-column d-flex flex-column mb-10">
      <div className="d-flex flex-row-auto w-100 w-lg-300px">
        <div className="stepper-nav">
          {steps.map((step, i) => (
            <div
              key={i}
              className={classNames(
                'stepper-item me-5',
                completedSteps[i] && 'completed',
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
                      checked={completedSteps[i]}
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
  );
};
