import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useToggle } from 'react-use';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { wrapTooltip } from '@waldur/table/ActionButton';

import './wizard.scss';

export interface WizardFormStepProps
  extends Pick<InjectedFormProps, 'form' | 'initialValues'> {
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
  validate?(values: any): any;
  data?: any;
  reinitialize(): void;
  modalProps?: Record<string, any>;
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

  return (
    <form className="wizard" onSubmit={props.handleSubmit(props.onSubmit)}>
      <ModalDialog
        title={props.title}
        subtitle={props.subtitle}
        footer={
          <>
            {props.step > 0 && (
              <Button
                variant="tertiary"
                className="min-w-125px me-auto"
                onClick={() => props.onPrev(formValues)}
              >
                <span className="svg-icon svg-icon-4">
                  <CaretLeftIcon weight="bold" />
                </span>
                {translate('Back')}
              </Button>
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
                label={props.submitLabel}
                invalid={
                  props.submitDisabled ||
                  loading ||
                  (props.submitDisabledInvalid && props.invalid)
                }
                className="btn-icon-right min-w-125px"
                children={
                  loading ? (
                    <span className="svg-icon svg-icon-2">
                      <LoadingSpinnerIcon />
                    </span>
                  ) : props.step !== props.steps.length - 1 ? (
                    <span className="svg-icon svg-icon-2">
                      <CaretRightIcon weight="bold" />
                    </span>
                  ) : null
                }
              />,
            )}
          </>
        }
        closeButton
        hasHeaderPadding
        {...(modalProps || {})}
      >
        <div className="wizard-big wizard-body clearfix">
          {!props.hideStepper && (
            <StepsList
              steps={props.steps}
              value={props.steps[props.step]}
              onClick={(_, index) => {
                if (!props.onStep || props.submitDisabled) return;
                if (index > props.step) {
                  props.submit();
                  if (props.valid) {
                    props.onStep(index);
                  }
                } else {
                  props.onStep(index);
                }
              }}
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
