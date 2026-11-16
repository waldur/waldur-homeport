import { useCallback, useState } from 'react';

import type { UseWizardReturn, WizardStep } from './types';

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
 * const { step, currentIndex, goNext, goBack, isFirstStep, isLastStep } = useWizard(steps);
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const safeIndex =
    steps.length > 0
      ? Math.min(Math.max(0, currentIndex), steps.length - 1)
      : 0;
  const step = steps[safeIndex];

  const findStepIndex = useCallback(
    (target: WizardStep): number => {
      const directIndex = steps.indexOf(target);
      if (directIndex !== -1) return directIndex;
      return steps.findIndex(
        (s) => Boolean(s.key) && Boolean(target?.key) && s.key === target.key,
      );
    },
    [steps],
  );

  const setStep = useCallback(
    (newStep: WizardStep) => {
      const index = findStepIndex(newStep);
      if (index !== -1) {
        setCurrentIndex(index);
      }
    },
    [findStepIndex],
  );

  const goBack = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(steps.length - 1, prev + 1));
  }, [steps.length]);

  const isFirstStep = safeIndex === 0;
  const isLastStep = safeIndex === steps.length - 1;

  return {
    step,
    currentIndex: safeIndex,
    setStep,
    goBack,
    goNext,
    isFirstStep,
    isLastStep,
  };
};
