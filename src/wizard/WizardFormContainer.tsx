import { FormApi } from 'final-form';
import { ComponentType, useEffect, useRef, useState } from 'react';
import { Form, useFormState } from 'react-final-form';

import type { ProgressStep } from './ProgressSteps';

interface WizardFormContainerProps<FormValues = any> {
  form?: string;
  title: string;
  subtitle?: string;
  onSubmit: (
    values: FormValues,
    form: FormApi<FormValues>,
  ) => Promise<any> | void;
  submitLabel?: string;
  nextLabel?: string;
  steps: ProgressStep[];
  wizardForms: ComponentType<any>[];
  initialValues?: any;
  data?: any;
  modalProps?: any;
  onCancel?(): void;
  onChange?(values: FormValues): void;
  hideStepper?: boolean;
  validate?: (values: FormValues) => any;
  skipSteps?: number[];
  /** Extra final-form mutators, e.g. `final-form-arrays` for a step that uses
   * FieldArray. Without them FieldArray's push/remove are undefined at
   * runtime, which type-checking does not catch. */
  mutators?: Record<string, any>;
}

/**
 * Reports the form's values after each render that changed them. Not
 * FormSpy's `onChange`: react-final-form calls that synchronously while
 * FormSpy first renders, so a caller keeping the values in its own state
 * updated a component while rendering another one.
 */
const ValuesChangeReporter = <FormValues,>({
  onChange,
}: {
  onChange(values: FormValues): void;
}) => {
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current(values);
  }, [values]);
  return null;
};

export const WizardFormContainer = <
  FormValues extends Record<string, any> = any,
>({
  onSubmit,
  initialValues,
  steps,
  wizardForms,
  title,
  subtitle,
  submitLabel,
  data,
  modalProps,
  onCancel,
  onChange,
  hideStepper,
  validate,
  skipSteps = [],
  mutators,
}: WizardFormContainerProps<FormValues>) => {
  const [step, setStep] = useState(0);
  const [lastVisitedStep, setLastVisitedStep] = useState(0);
  const isLast = step === steps.length - 1;

  const nextStep = () => {
    let nextIdx = step + 1;
    while (skipSteps.includes(nextIdx) && nextIdx < steps.length) {
      nextIdx++;
    }
    setStep(nextIdx);
    if (nextIdx > lastVisitedStep) {
      setLastVisitedStep(nextIdx);
    }
  };

  const prevStep = () => {
    let prevIdx = step - 1;
    while (skipSteps.includes(prevIdx) && prevIdx >= 0) {
      prevIdx--;
    }
    setStep(Math.max(0, prevIdx));
  };

  const selectStep = (num: number) => {
    if (num <= lastVisitedStep && !skipSteps.includes(num)) setStep(num);
  };

  const handleSubmitStep = (
    values: FormValues,
    formApi: FormApi<FormValues>,
  ) => {
    if (isLast) {
      return onSubmit(values, formApi);
    } else {
      nextStep();
    }
  };

  const CurrentStep = wizardForms[step];

  return (
    <Form<FormValues>
      onSubmit={handleSubmitStep}
      initialValues={initialValues}
      validate={validate}
      mutators={mutators}
      render={({ handleSubmit, submitting, invalid, values, form }) => (
        <form onSubmit={handleSubmit} noValidate>
          {onChange && <ValuesChangeReporter<FormValues> onChange={onChange} />}
          <CurrentStep
            title={title}
            subtitle={subtitle}
            // Steps spread their props into WizardForm, which falls back to
            // "Submit" when this is absent. Without forwarding it here every
            // caller's label — "Create", "Import", "Confirm" — was accepted and
            // then silently dropped.
            submitLabel={submitLabel}
            step={step}
            steps={steps}
            onPrev={prevStep}
            onStep={selectStep}
            submitting={submitting}
            invalid={invalid}
            values={values}
            form={form}
            data={data}
            onCancel={onCancel}
            modalProps={modalProps}
            hideStepper={hideStepper}
          />
        </form>
      )}
    />
  );
};
