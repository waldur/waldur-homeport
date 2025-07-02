import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, ReactNode, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { getFormValues, InjectedFormProps, reduxForm } from 'redux-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
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
  onSubmit(formData, dispatch, formProps): Promise<any> | void;
  submitLabel: string;
  submitDisabled?: boolean;
  submitTooltip?: ReactNode;
  steps: ProgressStep[];
  step: number;
  onPrev(values: any): void;
  onStep?(step: number): void;
  validate?(values: any): any;
  data?: any;
  reinitialize(): void;
  modalProps?: Record<string, any>;
}

interface WizardFormProps extends WizardFormStepProps, InjectedFormProps {
  children: ReactNode | FC<WizardFormProps>;
  formValues: any;
  submit(): void;
}

const WizardFormPure: FC<WizardFormProps> = ({ modalProps, ...props }) => {
  useEffect(() => {
    // Touch the form at the beginning to avoid going to the next step without a validation
    props.reinitialize();
    if (!props.anyTouched) props.touch();
  }, []);

  const formValues = useSelector(getFormValues(props.form));

  return (
    <form className="wizard" onSubmit={props.handleSubmit(props.onSubmit)}>
      <ModalDialog
        title={props.title}
        footer={
          <>
            {props.step > 0 && (
              <Button
                variant="outline btn-outline-default"
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
            {wrapTooltip(
              props.submitTooltip,
              <SubmitButton
                submitting={props.submitting}
                label={props.submitLabel}
                invalid={props.submitDisabled}
                className="min-w-125px"
              />,
            )}
          </>
        }
        closeButton
        hasHeaderPadding
        {...(modalProps || {})}
      >
        <div className="wizard-big wizard-body clearfix">
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

          <div className="content clearfix">
            {typeof props.children === 'function'
              ? props.children({ ...props, formValues })
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
