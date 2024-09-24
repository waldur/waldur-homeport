import { uniq } from 'lodash';
import { useState, createElement, FC, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { change, getFormValues } from 'redux-form';

import { WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

interface WizardFormContainerProps {
  form: string;
  title: string;
  onSubmit: WizardFormStepProps['onSubmit'];
  submitLabel?: string;
  nextLabel?: string;
  steps: string[];
  wizardForms: FC<WizardFormStepProps>[];
  initialValues?: any;
  data?: any;
  validate?(values: any): any;
}

export const WizardFormContainer: FC<WizardFormContainerProps> = ({
  form,
  submitLabel = translate('Submit'),
  nextLabel = translate('Next'),
  ...props
}) => {
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
  const _submitLabel = isLast ? submitLabel : nextLabel;

  const [initialized, setInitialized] = useState(false);
  const dispatch = useDispatch<any>();
  const formValues = useSelector((state) => getFormValues(form)(state) || {});
  // Can not use enableReinitialize on reduxForm because of infinite render loop issue
  const reinitialize = useCallback(() => {
    if (initialized) return;
    if (!props.initialValues) {
      return;
    }
    uniq(
      Object.keys(props.initialValues).concat(Object.keys(formValues)),
    ).forEach((key) => {
      if (props.initialValues?.[key]) {
        dispatch(change(form, key, props.initialValues[key], false, false));
      } else {
        dispatch(change(form, key, null, false, false));
      }
    });
    setInitialized(true);
  }, [initialized, setInitialized, dispatch, formValues]);

  return createElement(props.wizardForms[step], {
    form,
    title: props.title,
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    onStep: selectStep,
    submitLabel: _submitLabel,
    step,
    steps: props.steps,
    initialValues: props.initialValues,
    data: props.data,
    reinitialize,
    validate: props.validate,
  });
};
