import { useState, createElement, FunctionComponent } from 'react';

import { WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';
import { WizardFormThirdPage } from './WizardFormThirdPage';

interface CallOfferingCreateFormProps {
  onSubmit: WizardFormStepProps['onSubmit'];
  initialValues?: any;
  data: any;
}

const WizardForms = [
  WizardFormFirstPage,
  WizardFormSecondPage,
  WizardFormThirdPage,
];

const steps = [
  translate('Select offering'),
  translate('Configure request'),
  translate('Submit'),
];

export const CallOfferingCreateForm: FunctionComponent<CallOfferingCreateFormProps> =
  (props) => {
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
      form: 'CallOfferingForm',
      title: translate('New offering'),
      onSubmit: isLast ? props.onSubmit : nextStep,
      onPrev: prevStep,
      onStep: selectStep,
      submitLabel,
      step,
      steps,
      initialValues: props.initialValues,
      data: props.data,
    });
  };
