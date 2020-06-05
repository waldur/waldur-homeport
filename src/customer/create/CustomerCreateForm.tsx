import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';

const WizardForms = [WizardFormFirstPage, WizardFormSecondPage];

export const CustomerCreateForm = props => {
  const [step, setStep] = React.useState(1);
  const stepCount = ENV.hideOrganizationBillingStep ? 1 : 2;
  const isLast = step === stepCount;
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const submitLabel = isLast
    ? translate('Create organization')
    : translate('Next');

  const steps = [
    translate('General information'),
    translate('Billing details'),
  ];
  const stepTitle = steps[step - 1];

  return React.createElement(WizardForms[step - 1], {
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    submitLabel,
    step: step - 1,
    steps,
    stepTitle,
  });
};
