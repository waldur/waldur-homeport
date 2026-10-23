import { ComponentType, createElement, FC } from 'react';

import { ProgressStep } from './ProgressSteps';

export interface WizardTabsProps {
  steps: ProgressStep[];
  currentStep: ProgressStep;
  tabs: Record<string, ComponentType<any>>;
  mountOnEnter?: boolean;
  context?: any;
}

export const WizardTabs: FC<WizardTabsProps> = ({
  steps,
  currentStep,
  tabs,
  mountOnEnter,
  context,
}) => (
  <>
    {steps.map((step) => {
      const isCurrent =
        step === currentStep ||
        (Boolean(step.key) &&
          Boolean(currentStep?.key) &&
          step.key === currentStep.key);

      return (
        <div
          key={step.key}
          data-testid={`wizard-tab-${step.key}`}
          className={isCurrent ? undefined : 'hidden'}
        >
          {mountOnEnter
            ? isCurrent
              ? createElement(tabs[step.key], { context })
              : null
            : createElement(tabs[step.key], {
                isVisible: isCurrent,
                context,
              })}
        </div>
      );
    })}
  </>
);
