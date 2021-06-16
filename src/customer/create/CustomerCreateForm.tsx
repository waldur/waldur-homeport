import { useState, createElement, FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { WizardFormFirstPage } from './WizardFormFirstPage';
import { WizardFormSecondPage } from './WizardFormSecondPage';

const WizardForms = [WizardFormFirstPage, WizardFormSecondPage];

interface CustomerCreateFormData {
  name: string;
  native_name: string;
  domain: string;
  email: string;
  phone_number: string;
  registration_code: string;
  country: string;
  address: string;
  vat_code: string;
  postal: string;
  bank_name: string;
  bank_account: string;
}

interface CustomerCreateFormProps {
  onSubmit(formData: CustomerCreateFormData): void;
  initialValues?: CustomerCreateFormData;
}

export const CustomerCreateForm: FunctionComponent<CustomerCreateFormProps> = (
  props,
) => {
  const [step, setStep] = useState(1);
  const steps = [translate('General information')];
  if (!ENV.hideOrganizationBillingStep) {
    steps.push(translate('Billing details'));
  }
  const isLast = step === steps.length;
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);
  const submitLabel = isLast
    ? translate('Create organization')
    : translate('Next');

  const stepTitle = steps[step - 1];

  return createElement(WizardForms[step - 1], {
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    submitLabel,
    step: step - 1,
    steps,
    stepTitle,
    initialValues: props.initialValues,
  });
};
