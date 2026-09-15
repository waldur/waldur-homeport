import {
  CheckCircleIcon,
  CircleIcon,
  LockIcon,
  WarningCircleIcon,
  XCircleIcon,
} from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC, useMemo } from 'react';

import { Tooltip } from 'waldur-ui';

import { flattenObject } from '@/core/utils';
import { FieldErrorMessage } from '@/form/FieldError';
import { PageBarTabs } from '@/marketplace/common/PageBarTabs';

import { VStepperFormStep } from './VStepperFormStep';

export const FormSteps: FC<{
  steps: Pick<VStepperFormStep, 'label' | 'id' | 'fields' | 'required'>[];
  completedSteps?: boolean[];
  disabledSteps?: boolean[];
  errors?;
  criticalErrors?;
  showRequiredErrors?: boolean;
  /** Suppress the trailing status icon column. Use for read-only navigation
   *  where completion / error state isn't meaningful (e.g. viewing a
   *  submitted proposal). */
  hideStatusIcons?: boolean;
}> = ({
  steps,
  completedSteps = [],
  disabledSteps = [],
  errors = [],
  criticalErrors,
  showRequiredErrors,
  hideStatusIcons,
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

    const isDisabled = disabledSteps[i];

    return {
      key: step.id,
      title: (
        <div
          className={classNames(
            'd-flex justify-content-between',
            (hasCriticalErrors || hasNormalErrors) && 'has-error',
            isDisabled && 'text-muted',
          )}
        >
          {step.label}
          {hideStatusIcons ? null : isDisabled ? (
            <LockIcon weight="bold" className="text-muted" size={20} />
          ) : step.fields && hasCriticalErrors ? (
            <Tooltip
              label={<FieldErrorMessage error={criticalErrors} />}
              side="left"
              autoWidth
            >
              <XCircleIcon weight="bold" size={20} className="text-danger" />
            </Tooltip>
          ) : step.fields && hasNormalErrors ? (
            <Tooltip
              label={<FieldErrorMessage error={normalErrors} />}
              side="left"
              autoWidth
            >
              <WarningCircleIcon
                weight="bold"
                size={20}
                className="text-warning"
              />
            </Tooltip>
          ) : completedSteps[i] ? (
            <CheckCircleIcon weight="bold" className="text-success" size={20} />
          ) : step.required ? (
            <CircleIcon weight="bold" className="text-muted" size={20} />
          ) : null}
        </div>
      ),
    };
  });

  return <PageBarTabs tabs={tabs} mode="tabs-left" />;
};
