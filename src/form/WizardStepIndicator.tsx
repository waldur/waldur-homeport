import { CheckIcon } from '@phosphor-icons/react';
import './WizardStepIndicator.scss';

export const WizardStepIndicator = ({ steps, activeStep, onSelect }) => (
  <ol className="wizard-step-indicator">
    {steps.map((step, stepIndex) => (
      <li
        key={stepIndex}
        className={activeStep === stepIndex ? 'active' : undefined}
        onClick={() => onSelect(stepIndex)}
        aria-hidden="true"
      >
        <div className="step svg-icon">
          {stepIndex < activeStep ? <CheckIcon /> : stepIndex + 1}
        </div>{' '}
        <div className="caption hidden-xs hidden-sm">{step}</div>
      </li>
    ))}
  </ol>
);
