import { ComponentType, createElement, FunctionComponent } from 'react';

interface WizardTabsProps {
  steps: string[];
  currentStep: string;
  tabs: Record<string, ComponentType<any>>;
  mountOnEnter?: boolean;
}

export const WizardTabs: FunctionComponent<WizardTabsProps> = ({
  steps,
  currentStep,
  tabs,
  mountOnEnter,
}) => (
  <>
    {steps.map((step) => (
      <div key={step} className={step === currentStep ? undefined : 'hidden'}>
        {mountOnEnter
          ? step === currentStep
            ? createElement(tabs[step])
            : null
          : createElement(tabs[step], {
              isVisible: step === currentStep,
            })}
      </div>
    ))}
  </>
);
