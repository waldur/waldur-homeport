import { FormApi } from 'final-form';
import { ComponentType, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';

import { ProgressStep } from '@/core/ProgressSteps';

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
}

export const WizardFormContainer = <
  FormValues extends Record<string, any> = any,
>({
  onSubmit,
  initialValues,
  steps,
  wizardForms,
  title,
  subtitle,
  data,
  modalProps,
  onCancel,
  onChange,
  hideStepper,
  validate,
  skipSteps = [],
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
      render={({ handleSubmit, submitting, invalid, values, form }) => (
        <form onSubmit={handleSubmit} noValidate>
          {onChange && (
            <FormSpy<FormValues>
              subscription={{ values: true }}
              onChange={(formState) => onChange(formState.values as FormValues)}
            />
          )}
          <CurrentStep
            title={title}
            subtitle={subtitle}
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
