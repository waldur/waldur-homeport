import { Config } from 'final-form';
import { useState, createElement, FC, ReactNode } from 'react';
import { Form } from 'react-final-form';
import { useToggle } from 'react-use';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';

import { WizardFinalFormStepProps } from './WizardFinalForm';

interface WizardFormContainerProps {
  title: string;
  subtitle?: string;
  onSubmit: Config['onSubmit'];
  submitLabel?: string;
  nextLabel?: string;
  steps: ProgressStep[];
  hideStepper?: boolean;
  wizardForms: FC<WizardFinalFormStepProps>[];
  initialValues?: Config['initialValues'];
  actions?: WizardFinalFormStepProps['actions'];
  data?: any;
  validate?: Config['validate'];
  mutators?: Config['mutators'];
  modalProps?: {
    iconNode?: ReactNode;
    iconColor?: string;
    headerClassName?: string;
    bodyClassName?: string;
  };
}

export const WizardFinalFormContainer: FC<WizardFormContainerProps> = ({
  submitLabel = translate('Submit'),
  nextLabel = translate('Next'),
  ...props
}) => {
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
        });
      }}
    />
  );
};
