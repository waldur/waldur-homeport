import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { ProgressSteps } from '@/wizard';

import type { WizardStep, WizardStepIndicatorProps } from './types';

/**
 * Step progress indicator for wizards.
 *
 * Features:
 * - Visual indication of completed, current, and pending steps
 * - Click-to-navigate to previous steps
 * - Automatic completion marking based on current step
 * - ARIA attributes for accessibility
 *
 * @example
 * ```tsx
 * <WizardStepIndicator
 *   steps={steps}
 *   value={steps[currentStepIndex]}
 *   onClick={(step, index) => setCurrentStep(index)}
 * />
 * ```
 */
export const WizardStepIndicator: FC<WizardStepIndicatorProps> = (props) => {
  const currentIndex = useMemo(() => {
    return props.steps.findIndex(
      (step) =>
        step === props.value ||
        (Boolean(step.key) &&
          Boolean(props.value?.key) &&
          step.key === props.value.key),
    );
  }, [props.steps, props.value]);

  const handleStepClick =
    props.onClick && !props.disabled
      ? (step: WizardStep, index: number) => {
          props.onClick!(props.steps[index] ?? step, index);
        }
      : undefined;

  return (
    <div role="group" aria-label={translate('Form progress')}>
      <ProgressSteps
        steps={props.steps}
        activeIndex={currentIndex}
        onClick={handleStepClick}
        bgClass="bg-primary"
        className="mt-4 mb-4"
      />
    </div>
  );
};
