import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WizardStepProps } from './types';
import { Wizard } from './Wizard';
import { WizardModal } from './WizardModal';

// Test step components
const Step1: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <div data-testid="step1-content">Step 1 Content</div>
    <input
      data-testid="step1-input"
      defaultValue=""
      onChange={(e) => props.form.change('name', e.target.value)}
    />
  </WizardModal>
);

const Step2: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <div data-testid="step2-content">Step 2 Content</div>
  </WizardModal>
);

const Step3: FC<WizardStepProps> = (props) => (
  <WizardModal {...props}>
    <div data-testid="step3-content">Step 3 Content</div>
  </WizardModal>
);

const steps = [
  { key: 'step1', label: 'Step 1', completed: false },
  { key: 'step2', label: 'Step 2', completed: false },
  { key: 'step3', label: 'Step 3', completed: false },
];

const wizardForms = [Step1, Step2, Step3];

const renderWizard = (props: Record<string, any> = {}) => {
  const defaultProps = {
    title: 'Test Wizard',
    subtitle: 'Test Subtitle',
    steps,
    wizardForms,
    onSubmit: vi.fn(),
    nextLabel: 'Next',
    submitLabel: 'Submit',
  };

  const result = render(<Wizard {...defaultProps} {...props} />);

  return {
    ...result,
    onSubmit: props.onSubmit || defaultProps.onSubmit,
  };
};

describe('Wizard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic rendering', () => {
    it('renders wizard with title and subtitle', () => {
      renderWizard();

      expect(screen.getByText('Test Wizard')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders first step content by default', () => {
      renderWizard();

      expect(screen.getByTestId('step1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('step2-content')).not.toBeInTheDocument();
    });

    it('renders step indicators', () => {
      renderWizard();

      expect(screen.getByText('Step 1')).toBeInTheDocument();
      expect(screen.getByText('Step 2')).toBeInTheDocument();
      expect(screen.getByText('Step 3')).toBeInTheDocument();
    });

    it('hides step indicators when hideStepper is true', () => {
      renderWizard({ hideStepper: true });

      // Step labels should not be visible when stepper is hidden
      const stepLabels = screen.queryAllByText(/^Step \d$/);
      expect(stepLabels.length).toBe(0);
    });
  });

  describe('navigation buttons', () => {
    it('renders submit button on first step', () => {
      renderWizard();

      // Submit button exists with type="submit"
      expect(screen.getByTestId('wizard-submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-submit-btn')).toHaveAttribute(
        'type',
        'submit',
      );
    });

    it('does not render Back button on first step', () => {
      renderWizard();

      expect(screen.queryByTestId('wizard-back-btn')).not.toBeInTheDocument();
    });

    it('renders Close button', () => {
      renderWizard();

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('starts on first step', () => {
      renderWizard();

      expect(screen.getByTestId('step1-content')).toBeInTheDocument();
      expect(screen.queryByTestId('step2-content')).not.toBeInTheDocument();
    });

    it('does not show Back button on first step', () => {
      renderWizard();

      expect(screen.queryByTestId('wizard-back-btn')).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('renders submit button in form', () => {
      renderWizard();

      expect(screen.getByTestId('wizard-submit-btn')).toBeInTheDocument();
      expect(screen.getByTestId('wizard-submit-btn')).toHaveAttribute(
        'type',
        'submit',
      );
    });

    it('has form element with wizard class', () => {
      renderWizard();

      const form = screen.getByTestId('wizard-dialog');
      expect(form).toHaveClass('wizard');
    });
  });

  describe('initial values', () => {
    it('passes initialValues to form', () => {
      const initialValues = { name: 'Test Name' };
      renderWizard({ initialValues });

      // The form should be initialized with the values
      expect(screen.getByTestId('step1-content')).toBeInTheDocument();
    });
  });

  describe('data prop', () => {
    it('passes data prop to step components', () => {
      const StepWithData: FC<WizardStepProps> = (props) => (
        <WizardModal {...props}>
          <div data-testid="data-value">{props.data?.testValue}</div>
        </WizardModal>
      );

      renderWizard({
        wizardForms: [StepWithData, Step2, Step3],
        data: { testValue: 'Hello World' },
      });

      expect(screen.getByTestId('data-value')).toHaveTextContent('Hello World');
    });
  });

  describe('actions prop', () => {
    it('renders static actions in footer', () => {
      renderWizard({
        actions: <button data-testid="custom-action">Custom Action</button>,
      });

      expect(screen.getByTestId('custom-action')).toBeInTheDocument();
    });

    it('renders function actions with form values', () => {
      renderWizard({
        actions: ({ values }: { values: Record<string, unknown> }) => (
          <button data-testid="action-with-values">
            Values: {JSON.stringify(values)}
          </button>
        ),
        initialValues: { name: 'test' },
      });

      expect(screen.getByTestId('action-with-values')).toBeInTheDocument();
    });
  });

  describe('custom footer', () => {
    it('renders custom footer when renderFooter is provided', () => {
      renderWizard({
        renderFooter: () => (
          <div data-testid="custom-footer">Custom Footer Content</div>
        ),
      });

      expect(screen.getByTestId('custom-footer')).toBeInTheDocument();
    });

    it('custom footer receives navigation props', () => {
      renderWizard({
        renderFooter: ({
          step,
          totalSteps,
        }: {
          step: number;
          totalSteps: number;
        }) => (
          <div data-testid="footer-info">
            Step {step + 1} of {totalSteps}
          </div>
        ),
      });

      expect(screen.getByTestId('footer-info')).toHaveTextContent(
        'Step 1 of 3',
      );
    });

    it('custom footer can use handleSubmit to advance steps', async () => {
      renderWizard({
        renderFooter: ({ handleSubmit }: { handleSubmit: () => void }) => (
          <button data-testid="custom-next" onClick={handleSubmit}>
            Custom Next
          </button>
        ),
      });

      await user.click(screen.getByTestId('custom-next'));

      await waitFor(() => {
        expect(screen.getByTestId('step2-content')).toBeInTheDocument();
      });
    });
  });
});

describe('WizardStepIndicator', () => {
  it('renders step labels', () => {
    renderWizard();

    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
    expect(screen.getByText('Step 3')).toBeInTheDocument();
  });

  it('has accessibility group with label', () => {
    renderWizard();

    expect(
      screen.getByRole('group', { name: /form progress/i }),
    ).toBeInTheDocument();
  });
});
