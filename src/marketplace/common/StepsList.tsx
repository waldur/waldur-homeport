import { FC, useMemo } from 'react';

import { ProgressStep, ProgressSteps } from '@waldur/core/ProgressSteps';

interface StepsListProps {
  steps: ProgressStep[];
  value: ProgressStep;
  onClick?(step: ProgressStep, index: number): void;
  disabled?: boolean;
}

export const StepsList: FC<StepsListProps> = (props) => {
  const steps = useMemo((): ProgressStep[] => {
    const currentIndex = props.steps.findIndex(
      (step) => step.label === props.value.label,
    );
    return props.steps.map((step, i) => ({
      ...step,
      completed: currentIndex > i ? true : false,
    }));
  }, [props.steps, props.value]);

  return (
    <ProgressSteps
      steps={steps}
      onClick={props.onClick}
      bgClass="bg-body"
      className="mt-3 mb-3"
    />
  );
};
