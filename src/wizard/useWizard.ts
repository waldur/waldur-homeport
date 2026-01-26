import { useState } from 'react';

import type { WizardStep, UseWizardReturn } from './types';

/**
 * Hook for managing wizard step state.
 *
 * Provides simple step navigation utilities for custom wizard implementations.
 *
 * @param steps - Array of wizard step definitions
 * @returns Object with step state and navigation functions
 *
 * @example
 * ```tsx
 * const steps = [
 *   { key: 'step1', label: 'Step 1', completed: false },
 *   { key: 'step2', label: 'Step 2', completed: false },
 * ];
 *
 * const { step, goNext, goBack, isFirstStep, isLastStep } = useWizard(steps);
 *
 * return (
 *   <div>
 *     <h2>{step.label}</h2>
 *     <button onClick={goBack} disabled={isFirstStep}>Back</button>
 *     <button onClick={goNext} disabled={isLastStep}>Next</button>
 *   </div>
 * );
 * ```
 */
export const useWizard = (steps: WizardStep[]): UseWizardReturn => {
  const [step, setStep] = useState<WizardStep>(() => steps[0]);

  const goBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const goNext = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const isFirstStep = step === steps[0];
  const isLastStep = step === steps[steps.length - 1];

  return { step, setStep, goBack, goNext, isFirstStep, isLastStep };
};
