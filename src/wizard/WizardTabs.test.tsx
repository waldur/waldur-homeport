import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgressStep } from './ProgressSteps';
import { WizardTabs } from './WizardTabs';

const steps: ProgressStep[] = [
  { key: 'step1', label: 'Step 1', completed: false },
  { key: 'step2', label: 'Step 2', completed: false },
];

const tabs = {
  step1: () => <div data-testid="tab-1">Tab 1 Content</div>,
  step2: () => <div data-testid="tab-2">Tab 2 Content</div>,
};

describe('WizardTabs', () => {
  it('renders active tab when mountOnEnter is true and step is canonical reference', () => {
    render(
      <WizardTabs
        steps={steps}
        currentStep={steps[0]}
        tabs={tabs}
        mountOnEnter={true}
      />,
    );

    expect(screen.getByTestId('tab-1')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-2')).not.toBeInTheDocument();
  });

  it('renders active tab when mountOnEnter is true even if currentStep is a cloned object', () => {
    const clonedStep = { ...steps[1] };
    render(
      <WizardTabs
        steps={steps}
        currentStep={clonedStep}
        tabs={tabs}
        mountOnEnter={true}
      />,
    );

    expect(screen.queryByTestId('tab-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('tab-2')).toBeInTheDocument();
  });

  it('hides inactive tab when mountOnEnter is false', () => {
    render(
      <WizardTabs
        steps={steps}
        currentStep={steps[0]}
        tabs={tabs}
        mountOnEnter={false}
      />,
    );

    expect(screen.getByTestId('tab-1')).toBeInTheDocument();
    expect(screen.getByTestId('tab-2')).toBeInTheDocument();
    expect(screen.getByTestId('wizard-tab-step2')).toHaveClass('hidden');
    expect(screen.getByTestId('wizard-tab-step1')).not.toHaveClass('hidden');
  });
});
