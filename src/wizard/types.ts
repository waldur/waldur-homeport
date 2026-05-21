import { FormApi } from 'final-form';
import { FC, ReactNode } from 'react';
import { FormRenderProps } from 'react-final-form';

import { ProgressStep } from '@/wizard';

/**
 * WizardStep is an alias for ProgressStep to maintain compatibility.
 * All wizard step definitions use this type.
 */
export type WizardStep = ProgressStep;

/**
 * Props passed to each wizard step component.
 * Extends React Final Form's FormRenderProps for form integration.
 */
export interface WizardStepProps extends FormRenderProps<any, any> {
  /** Title displayed in the modal header */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Label for the submit/next button */
  submitLabel: string;
  /** Whether the submit button should be disabled */
  submitDisabled?: boolean;
  /** Optional tooltip for the submit button */
  submitTooltip?: ReactNode;
  /** Optional additional actions to render in the footer */
  actions?: ReactNode | FC<{ values: any }>;
  /** Array of step definitions */
  steps: WizardStep[];
  /** Current step index (0-based) */
  step: number;
  /** Callback to navigate to previous step */
  onPrev(values: any): void;
  /** Optional callback to navigate to a specific step */
  onStep?(step: number): void;
  /** Whether to hide the step indicator */
  hideStepper?: boolean;
  /** Optional form-level validation function */
  validate?(values: any): any;
  /** Optional custom data passed through to step components */
  data?: any;
  /** Optional props to pass to the modal */
  modalProps?: {
    iconNode?: ReactNode;
    iconColor?: string;
    headerClassName?: string;
    bodyClassName?: string;
  };
  /** Whether an async operation is in progress */
  loading?: boolean;
  /** Callback to set loading state */
  setLoading(): void;
  /** Optional custom footer renderer - replaces default footer when provided */
  renderFooter?(): ReactNode;
}

/**
 * Submit handler type for wizard forms.
 */
type WizardSubmitHandler<FormValues = any> = (
  values: FormValues,
  form: FormApi<FormValues>,
  callback?: (errors?: any) => void,
) => void | Promise<any>;

/**
 * Validation function type for wizard forms.
 */
type WizardValidate<FormValues = any> = (
  values: FormValues,
) => Record<string, any> | Promise<Record<string, any>>;

/**
 * Props passed to custom footer render function.
 */
export interface WizardFooterRenderProps<FormValues = any> {
  /** Current step index (0-based) */
  step: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether form is currently submitting */
  submitting: boolean;
  /** Whether form has validation errors */
  invalid: boolean;
  /** Current form values */
  values: FormValues;
  /** Form API for programmatic control */
  form: FormApi<FormValues>;
  /** Navigate to previous step */
  onPrev: () => void;
  /** Navigate to a specific step */
  onStep: (step: number) => void;
  /** Handle form submission */
  handleSubmit: () => void;
}

/**
 * Props for the main Wizard component.
 */
export interface WizardProps<FormValues = any> {
  /** Title displayed in the modal header */
  title: string;
  /** Optional subtitle displayed below the title */
  subtitle?: string;
  /** Function called when the wizard is submitted on the final step */
  onSubmit: WizardSubmitHandler<FormValues>;
  /** Label for the submit button on the final step */
  submitLabel?: string;
  /** Label for the next button on intermediate steps */
  nextLabel?: string;
  /** Array of step definitions */
  steps: WizardStep[];
  /** Whether to hide the step indicator */
  hideStepper?: boolean;
  /** Array of step components, one for each step */
  wizardForms: FC<WizardStepProps>[];
  /** Initial form values */
  initialValues?: Partial<FormValues>;
  /** Optional additional actions to render in the footer */
  actions?: WizardStepProps['actions'];
  /** Optional custom data passed through to step components */
  data?: any;
  /** Optional form-level validation function */
  validate?: WizardValidate<FormValues>;
  /** Optional form mutators */
  mutators?: Record<string, (...args: any[]) => any>;
  /** Optional props to pass to the modal */
  modalProps?: WizardStepProps['modalProps'];
  /**
   * Optional custom footer renderer for complete control over footer buttons.
   * When provided, replaces the default Back/Close/Next footer.
   */
  renderFooter?: (props: WizardFooterRenderProps<FormValues>) => ReactNode;
}

/**
 * Props for the WizardStepIndicator component.
 */
export interface WizardStepIndicatorProps {
  /** Array of step definitions */
  steps: WizardStep[];
  /** Currently selected step */
  value: WizardStep;
  /** Optional callback when a step is clicked */
  onClick?(step: WizardStep, index: number): void;
  /** Whether clicking is disabled */
  disabled?: boolean;
}

/**
 * Return type for the useWizard hook.
 */
export interface UseWizardReturn {
  /** Current step object */
  step: WizardStep;
  /** Set the current step */
  setStep: (step: WizardStep) => void;
  /** Navigate to the previous step */
  goBack: () => void;
  /** Navigate to the next step */
  goNext: () => void;
  /** Whether on the first step */
  isFirstStep: boolean;
  /** Whether on the last step */
  isLastStep: boolean;
}
