import { useState } from 'react';

export const useWizard = (steps) => {
  const [step, setStep] = useState<string>(steps[0]);
  const goBack = () => setStep(steps[steps.indexOf(step) - 1]);
  const goNext = () => setStep(steps[steps.indexOf(step) + 1]);
  const isLastStep = step === steps[steps.length - 1];
  return { step, setStep, goBack, goNext, isLastStep };
};
