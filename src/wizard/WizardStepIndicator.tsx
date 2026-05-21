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
  // Mark steps as completed based on current position
  const steps = useMemo((): WizardStep[] => {
    const currentIndex = props.steps.findIndex(
      (step) => step.label === props.value.label,
    );
    return props.steps.map((step, i) => ({
      ...step,
      completed: currentIndex > i ? true : false,
    }));
  }, [props.steps, props.value]);

  return (
    <div role="group" aria-label={translate('Form progress')}>
      <ProgressSteps
        steps={steps}
        onClick={props.onClick}
        bgClass="bg-body"
        className="mt-4 mb-4"
      />
    </div>
  );
};
