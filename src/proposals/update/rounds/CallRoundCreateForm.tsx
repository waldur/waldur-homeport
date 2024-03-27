import { useState, createElement, FunctionComponent } from 'react';

import { parseDate } from '@waldur/core/dateUtils';
import { WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';
import { RoundFormData } from '@waldur/proposals/types';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';
import { WizardFormThirdPage } from './WizardFormThirdPage';

interface CallRoundCreateFormProps {
  onSubmit: WizardFormStepProps['onSubmit'];
  initialValues?: any;
}

const WizardForms = [
  WizardFormFirstPage,
  WizardFormSecondPage,
  WizardFormThirdPage,
];

const steps = [
  translate('Submission'),
  translate('Review'),
  translate('Allocation'),
];

const validate = (values: RoundFormData) => {
  const errors: any = {};
  if (parseDate(values.start_time) > parseDate(values.cutoff_time)) {
    errors.cutoff_time = translate('Cutoff date must be after start date');
  }
  return errors;
};

export const CallRoundCreateForm: FunctionComponent<
  CallRoundCreateFormProps
> = (props) => {
  const [step, setStep] = useState(0);
  const [lastVisitedStep, setLastVisitedStep] = useState(0);
  const isLast = step === steps.length - 1;
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
  const submitLabel = isLast ? translate('Create') : translate('Next');

  return createElement(WizardForms[step], {
    form: 'CallRoundForm',
    title: translate('New round'),
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    onStep: selectStep,
    submitLabel,
    step,
    steps,
    initialValues: props.initialValues,
    validate,
  });
};
