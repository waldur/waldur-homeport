import { useState, createElement, FunctionComponent } from 'react';

import { WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

interface CallOfferingCreateFormProps {
  title: string;
  onSubmit: WizardFormStepProps['onSubmit'];
  submitLabel: string;
  steps: string[];
  wizardForms: FunctionComponent<WizardFormStepProps>[];
  form?: string;
  initialValues?: any;
  data: any;
}

export const CallOfferingCreateForm: FunctionComponent<
  CallOfferingCreateFormProps
> = (props) => {
  const [step, setStep] = useState(0);
  const [lastVisitedStep, setLastVisitedStep] = useState(0);
  const isLast = step === props.steps.length - 1;
  const nextStep = () => {
    setStep(step + 1);
    if (step + 1 > lastVisitedStep) {
      setLastVisitedStep(step + 1);
    }
  };
  const prevStep = () => setStep(step - 1);
  const selectStep = (num: number) => {
    if (num <= lastVisitedStep) setStep(num);
  };
  const submitLabel = isLast ? props.submitLabel : translate('Next');

  return createElement(props.wizardForms[step], {
    form: props.form,
    title: props.title,
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    onStep: selectStep,
    submitLabel,
    step,
    steps: props.steps,
    initialValues: props.initialValues,
    data: props.data,
  });
};

CallOfferingCreateForm.defaultProps = {
  form: 'CallOfferingForm',
};
