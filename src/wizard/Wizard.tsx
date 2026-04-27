import { useState, createElement } from 'react';
import { Form } from 'react-final-form';
import { useToggle } from 'react-use';

import { translate } from '@/i18n';

import type {
  WizardFooterRenderProps,
  WizardProps,
  WizardStepProps,
} from './types';

/**
 * Main Wizard component that orchestrates multi-step form workflows.
 *
 * Features:
 * - Central form state management with React Final Form
 * - Step navigation with back/next functionality
 * - Tracks visited steps to prevent skipping ahead
 * - Loading state support for async operations
 *
 * @example
 * ```tsx
 * const steps = [
 *   { key: 'step1', label: 'Step 1', completed: false },
 *   { key: 'step2', label: 'Step 2', completed: false },
 * ];
 *
 * <Wizard
 *   title="My Wizard"
 *   steps={steps}
 *   wizardForms={[Step1Component, Step2Component]}
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function Wizard<FormValues = any>({
  submitLabel = translate('Submit'),
  nextLabel = translate('Next'),
  ...props
}: WizardProps<FormValues>) {
  const [step, setStep] = useState(0);
  const [lastVisitedStep, setLastVisitedStep] = useState(0);
  const [loading, setLoading] = useToggle(false);

  const isLast = step === props.steps.length - 1;

  const nextStep = () => {
    const newStep = step + 1;
    setStep(newStep);
    if (newStep > lastVisitedStep) {
      setLastVisitedStep(newStep);
    }
    return newStep;
  };

  const prevStep = () => setStep((s) => Math.max(0, s - 1));

  const selectStep = (num: number) => {
    if (num <= lastVisitedStep) setStep(num);
  };

  const _submitLabel = isLast ? submitLabel : nextLabel;

  const _submit = (values, form, callback) => {
    if (isLast) {
      return props.onSubmit(values, form, callback);
    } else {
      return Promise.resolve(nextStep());
    }
  };

  return (
    <Form
      onSubmit={_submit}
      initialValues={props.initialValues}
      validate={props.validate}
      mutators={props.mutators}
      render={(formProps) => {
        // Build renderFooter wrapper that provides navigation functions
        const renderFooterWithNav = props.renderFooter
          ? () =>
              props.renderFooter!({
                step,
                totalSteps: props.steps.length,
                submitting: formProps.submitting,
                invalid: formProps.invalid,
                values: formProps.values,
                form: formProps.form,
                onPrev: prevStep,
                onStep: selectStep,
                handleSubmit: formProps.handleSubmit,
              } as WizardFooterRenderProps)
          : undefined;

        return createElement(props.wizardForms[step], {
          ...formProps,
          title: props.title,
          subtitle: props.subtitle,
          onPrev: prevStep,
          onStep: selectStep,
          submitLabel: _submitLabel,
          step,
          steps: props.steps,
          hideStepper: props.hideStepper,
          initialValues: props.initialValues,
          actions: props.actions,
          data: props.data,
          validate: props.validate,
          modalProps: props.modalProps,
          loading,
          setLoading,
          renderFooter: renderFooterWithNav,
        } as WizardStepProps);
      }}
    />
  );
}
