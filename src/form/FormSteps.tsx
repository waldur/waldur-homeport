import {
  CheckCircleIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { flattenObject } from '@waldur/core/utils';
import { PageBarTabs } from '@waldur/marketplace/common/PageBarTabs';

import { FieldErrorMessage } from './FieldError';
import { VStepperFormStep } from './VStepperFormStep';

export const FormSteps: FC<{
  steps: Pick<VStepperFormStep, 'label' | 'id' | 'fields'>[];
  completedSteps?: boolean[];
  errors?;
  criticalErrors?;
  showRequiredErrors?: boolean;
}> = ({
  steps,
  completedSteps = [],
  errors = [],
  criticalErrors,
  showRequiredErrors,
}) => {
  const nonRequiredErrors = useMemo(() => {
    const errorsFlatten = flattenObject(errors);
    const result = {};
    for (const key in errorsFlatten) {
      if (!errorsFlatten[key]) continue;
      if (Array.isArray(errorsFlatten[key])) {
        errorsFlatten[key].forEach((err: any) => {
          if (
            typeof err === 'string' &&
            (!err.includes('required') || showRequiredErrors)
          ) {
            if (!(key in result)) Object.assign(result, { [key]: [] });
            result[key].push(err);
          }
        });
      } else if (
        typeof errorsFlatten[key] === 'string' &&
        (!errorsFlatten[key].includes('required') || showRequiredErrors)
      ) {
        Object.assign(result, { [key]: errorsFlatten[key] });
      }
    }
    return result;
  }, [errors]);

  const criticalErrorsMap = useMemo(() => {
    const errorsFlatten = flattenObject(criticalErrors);
    const result = {};
    for (const key in errorsFlatten) {
      if (!errorsFlatten[key]) continue;
      if (Array.isArray(errorsFlatten[key])) {
        errorsFlatten[key].forEach((err: any) => {
          if (!(key in result)) Object.assign(result, { [key]: [] });
          result[key].push(err);
        });
      } else if (typeof errorsFlatten[key] === 'string') {
        Object.assign(result, { [key]: errorsFlatten[key] });
      }
    }
    return result;
  }, [criticalErrors]);

  const tabs = steps.map((step, i) => {
    let criticalErrors = {};
    let normalErrors = {};
    if (step.fields) {
      step.fields.forEach((key) => {
        if (criticalErrorsMap[key]) {
          Object.assign(criticalErrors, { [key]: criticalErrorsMap[key] });
        }
        if (nonRequiredErrors[key]) {
          Object.assign(normalErrors, { [key]: nonRequiredErrors[key] });
        }
      });
      if (Object.keys(criticalErrors).length === 1) {
        criticalErrors = Object.values(criticalErrors).flat().filter(Boolean);
      }
      if (Object.keys(normalErrors).length === 1) {
        normalErrors = Object.values(normalErrors).flat().filter(Boolean);
      }
    }

    const hasCriticalErrors = Boolean(Object.keys(criticalErrors).length);
    const hasNormalErrors = Boolean(Object.keys(normalErrors).length);

    return {
      key: step.id,
      title: (
        <div
          className={classNames(
            'd-flex justify-content-between',
            (hasCriticalErrors || hasNormalErrors) && 'has-error',
          )}
        >
          {step.label}
          {step.fields && hasCriticalErrors ? (
            <Tip
              label={<FieldErrorMessage error={criticalErrors} />}
              className="stepper-icon critical-error"
              id={`stepperErrorTip-${i}`}
              placement="left"
              autoWidth
            >
              <XCircleIcon weight="bold" className="text-danger" size={20} />
            </Tip>
          ) : step.fields && hasNormalErrors ? (
            <Tip
              label={<FieldErrorMessage error={normalErrors} />}
              className="stepper-icon error"
              id={`stepperErrorTip-${i}`}
              placement="left"
              autoWidth
            >
              <WarningCircleIcon
                weight="bold"
                className="text-warning"
                size={20}
              />
            </Tip>
          ) : completedSteps[i] ? (
            <CheckCircleIcon weight="bold" className="text-success" size={20} />
          ) : null}
        </div>
      ),
    };
  });

  return <PageBarTabs tabs={tabs} mode="tabs-left" />;
};
