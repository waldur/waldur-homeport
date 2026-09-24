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

  const resolveSteps = (values) =>
    typeof props.steps === 'function' ? props.steps(values) : props.steps;

  // Steps that depend on the values can shrink below the current step (a
  // later answer drops a step), so the step shown is the current one clamped
  // to the steps that exist now.
  const clampStep = (values) => Math.min(step, resolveSteps(values).length - 1);

  const nextStep = (from = step) => {
    const newStep = from + 1;
    setStep(newStep);
    if (newStep > lastVisitedStep) {
      setLastVisitedStep(newStep);
    }
    return newStep;
  };

  const prevStep = (values) =>
    setStep((s) => Math.max(0, Math.min(s, clampStep(values)) - 1));

  const selectStep = (num: number) => {
    if (num <= lastVisitedStep) setStep(num);
  };

  const _submit = (values, form, callback) => {
    const current = clampStep(values);
    if (current === resolveSteps(values).length - 1) {
      return props.onSubmit(values, form, callback);
    } else {
      return Promise.resolve(nextStep(current));
    }
  };

  return (
    <Form
      onSubmit={_submit}
      initialValues={props.initialValues}
      validate={props.validate}
      mutators={props.mutators}
      render={(formProps) => {
        const steps = resolveSteps(formProps.values);
        const current = Math.min(step, steps.length - 1);
        const isLast = current === steps.length - 1;
        // Bound to the form's own values: callers pass anything from the
        // values to a click event.
        const onPrev = () => prevStep(formProps.values);

        // Build renderFooter wrapper that provides navigation functions
        const renderFooterWithNav = props.renderFooter
          ? () =>
              props.renderFooter!({
                step: current,
                totalSteps: steps.length,
                submitting: formProps.submitting,
                invalid: formProps.invalid,
                values: formProps.values,
                form: formProps.form,
                onPrev,
                onStep: selectStep,
                handleSubmit: formProps.handleSubmit,
              } as WizardFooterRenderProps)
          : undefined;

        return createElement(props.wizardForms[current], {
          ...formProps,
          title: props.title,
          subtitle: props.subtitle,
          onPrev,
          onStep: selectStep,
          submitLabel: isLast ? submitLabel : nextLabel,
          step: current,
          steps,
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
