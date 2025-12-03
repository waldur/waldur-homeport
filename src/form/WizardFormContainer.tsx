import { uniq } from 'lodash-es';
import {
  useState,
  createElement,
  FC,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { useDispatch, useStore } from 'react-redux';
import { change, destroy, getFormValues } from 'redux-form';

import { ProgressStep } from '@waldur/core/ProgressSteps';
import { WizardFormStepProps } from '@waldur/form/WizardForm';
import { translate } from '@waldur/i18n';

interface WizardFormContainerProps {
  form: string;
  title: string;
  subtitle?: string;
  onSubmit: WizardFormStepProps['onSubmit'];
  submitLabel?: string;
  nextLabel?: string;
  steps: ProgressStep[];
  hideStepper?: boolean;
  verticalLayout?: boolean;
  wizardForms: FC<WizardFormStepProps>[];
  initialValues?: any;
  actions?: WizardFormStepProps['actions'];
  data?: any;
  validate?(values: any): any;
  modalProps?: {
    iconNode?: ReactNode;
    iconColor?: string;
    headerClassName?: string;
    bodyClassName?: string;
  };
  onCancel?(): void;
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
  const store = useStore();

  // Initialize form values once on mount
  useEffect(() => {
    if (initialized || !props.initialValues) {
      return;
    }
    const formValues = getFormValues(form)(store.getState()) || {};
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
  }, [initialized, props.initialValues, form, dispatch, store]);

  // Dummy reinitialize function for backward compatibility
  const reinitialize = useCallback(() => {
    // Initialization is handled in useEffect above
  }, []);

  // Destroy the form on close wizard
  useEffect(() => {
    return () => dispatch(destroy(form));
  }, []);

  return createElement(props.wizardForms[step], {
    form,
    title: props.title,
    subtitle: props.subtitle,
    onSubmit: isLast ? props.onSubmit : nextStep,
    onPrev: prevStep,
    onStep: selectStep,
    submitLabel: _submitLabel,
    step,
    steps: props.steps,
    hideStepper: props.hideStepper,
    verticalLayout: props.verticalLayout,
    initialValues: props.initialValues,
    actions: props.actions,
    data: props.data,
    reinitialize,
    validate: props.validate,
    modalProps: props.modalProps,
    onCancel: props.onCancel,
  });
};
