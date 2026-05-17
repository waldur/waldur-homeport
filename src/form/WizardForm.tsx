import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useToggle } from 'react-use';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import { LoadingSpinnerSimple } from '@/core/LoadingSpinner';
import { ProgressStep } from '@/core/ProgressSteps';
import { VerticalProgressSteps } from '@/core/VerticalProgressSteps';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { StepsList } from '@/marketplace/common/StepsList';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { wrapTooltip } from '@/table/ActionButton';

import '@/wizard/wizard.scss';

export interface WizardFormStepProps extends Pick<
  InjectedFormProps,
  'form' | 'initialValues'
> {
  title: string;
  subtitle?: string;
  onSubmit(formData, dispatch, formProps): Promise<any> | void;
  submitLabel: string;
  submitDisabled?: boolean;
  submitTooltip?: ReactNode;
  submitDisabledInvalid?: boolean;
  actions?: ReactNode | FC<{ formValues }>;
  steps: ProgressStep[];
  step: number;
  onPrev(values: any): void;
  onStep?(step: number): void;
  hideStepper?: boolean;
  verticalLayout?: boolean;
  validate?(values: any): any;
  data?: any;
  reinitialize(): void;
  modalProps?: Record<string, any>;
  onCancel?(): void;
}

interface WizardFormProps extends WizardFormStepProps, InjectedFormProps {
  children: ReactNode | FC<WizardFormProps>;
  formValues: any;
  submit(): void;
  setLoading(): void;
}

const WizardFormPure: FC<WizardFormProps> = ({ modalProps, ...props }) => {
  useEffect(() => {
    // Touch the form at the beginning to avoid going to the next step without a validation
    props.reinitialize();
    if (!props.anyTouched) props.touch();
  }, []);

  const formValues = useSelector(getFormValues(props.form)) || {};

  const [loading, setLoading] = useToggle(false);

  const stepsWithCompletion = props.steps.map((step, i) => ({
    ...step,
    completed: i < props.step,
  }));

  const handleStepClick = (_step: ProgressStep, index: number) => {
    if (!props.onStep || props.submitDisabled) return;
    if (index > props.step) {
      props.submit();
      if (props.valid) {
        props.onStep(index);
      }
    } else {
      props.onStep(index);
    }
  };

  // Vertical layout (non-modal)
  if (props.verticalLayout) {
    return (
      <form
        className="wizard wizard-vertical"
        onSubmit={props.handleSubmit(props.onSubmit)}
      >
        <div className="d-flex gap-7">
          {/* Left Sidebar with Stepper */}
          {!props.hideStepper && (
            <div className="flex-shrink-0" style={{ width: '300px' }}>
              <VerticalProgressSteps
                steps={stepsWithCompletion}
                onClick={handleStepClick}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="flex-grow-1">
            <div className="wizard-body-vertical">
              {typeof props.children === 'function'
                ? props.children({ ...props, formValues, setLoading })
                : props.children}
            </div>

            {/* Footer buttons inside form container */}
            <div className="d-flex justify-content-between mt-5 pt-5 border-top">
              <SubmitButton
                submitting={false}
                variant="secondary"
                onClick={() => props.onPrev(formValues)}
                disabled={props.step === 0}
                className="min-w-125px"
                type="button"
                label={translate('Back')}
                iconNode={<CaretLeftIcon weight="bold" />}
                iconOnLeft
              />
              <div className="d-flex gap-3">
                {props.onCancel && (
                  <SubmitButton
                    submitting={false}
                    variant="tertiary"
                    className="min-w-125px"
                    onClick={props.onCancel}
                    type="button"
                    label={translate('Cancel')}
                  />
                )}
                {props.actions}
                {typeof props.actions === 'function'
                  ? props.actions({ formValues })
                  : props.actions}
                {wrapTooltip(
                  props.submitTooltip,
                  <SubmitButton
                    submitting={props.submitting}
                    label={props.submitLabel}
                    invalid={props.submitDisabled || loading}
                    className="btn-icon-right min-w-125px"
                    children={
                      loading ? (
                        <span className="svg-icon svg-icon-2">
                          {}
                          <LoadingSpinnerSimple />
                        </span>
                      ) : props.step !== props.steps.length - 1 ? (
                        <span className="svg-icon svg-icon-2">
                          <CaretRightIcon weight="bold" />
                        </span>
                      ) : null
                    }
                  />,
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    );
  }

  // Horizontal layout (modal)
  return (
    <form className="wizard" onSubmit={props.handleSubmit(props.onSubmit)}>
      <ModalDialog
        title={props.title}
        subtitle={props.subtitle}
        footer={
          <>
            {props.step > 0 && (
              <SubmitButton
                submitting={false}
                variant="tertiary"
                className="min-w-125px me-auto"
                onClick={() => props.onPrev(formValues)}
                type="button"
                label={translate('Back')}
                iconNode={<CaretLeftIcon weight="bold" />}
                iconOnLeft
              />
            )}
            <CloseDialogButton className="min-w-125px" />
            {props.actions}
            {typeof props.actions === 'function'
              ? props.actions({ formValues })
              : props.actions}
            {wrapTooltip(
              props.submitTooltip,
              <SubmitButton
                submitting={props.submitting}
                label={
                  props.step !== props.steps.length - 1
                    ? translate('Next')
                    : props.submitLabel
                }
                invalid={
                  props.submitDisabled ||
                  loading ||
                  (props.submitDisabledInvalid && props.invalid)
                }
                className="min-w-125px"
                iconNode={
                  props.step !== props.steps.length - 1 ? (
                    <CaretRightIcon weight="bold" />
                  ) : undefined
                }
              />,
            )}
          </>
        }
        headerClassName="pb-5"
        {...(modalProps || {})}
      >
        <div className="wizard-big wizard-body clearfix">
          {!props.hideStepper && (
            <StepsList
              steps={props.steps}
              value={props.steps[props.step]}
              onClick={handleStepClick}
            />
          )}

          <div className="content clearfix">
            {typeof props.children === 'function'
              ? props.children({ ...props, formValues, setLoading })
              : props.children}
          </div>
        </div>
      </ModalDialog>
    </form>
  );
};

export const WizardForm = reduxForm<{}, any>({
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
  keepDirtyOnReinitialize: true,
})(WizardFormPure);
