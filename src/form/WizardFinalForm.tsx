import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { Button } from 'react-bootstrap';
import { FormRenderProps } from 'react-final-form';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { LoadingSpinnerIcon } from '@waldur/core/LoadingSpinner';
import { ProgressStep } from '@waldur/core/ProgressSteps';
import { translate } from '@waldur/i18n';
import { StepsList } from '@waldur/marketplace/common/StepsList';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { wrapTooltip } from '@waldur/table/ActionButton';

import './wizard.scss';

export interface WizardFinalFormStepProps extends FormRenderProps<any, any> {
  title: string;
  subtitle?: string;
  submitLabel: string;
  submitDisabled?: boolean;
  submitTooltip?: ReactNode;
  actions?: ReactNode | FC<{ values }>;
  steps: ProgressStep[];
  step: number;
  onPrev(values: any): void;
  onStep?(step: number): void;
  hideStepper?: boolean;
  validate?(values: any): any;
  data?: any;
  modalProps?: Record<string, any>;
  loading?: boolean;
  setLoading(): void;
}

interface WizardFormProps extends WizardFinalFormStepProps {
  children: ReactNode;
}

export const WizardFinalForm: FC<WizardFormProps> = ({
  modalProps,
  ...props
}) => {
  return (
    <form className="wizard" onSubmit={props.handleSubmit}>
      <ModalDialog
        title={props.title}
        subtitle={props.subtitle}
        footer={
          <>
            {props.step > 0 && (
              <Button
                variant="tertiary"
                className="min-w-125px me-auto"
                onClick={() => props.onPrev(props.values)}
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
              ? props.actions({ values: props.values })
              : props.actions}
            {wrapTooltip(
              props.submitTooltip,
              <SubmitButton
                submitting={props.submitting}
                label={props.submitLabel}
                invalid={props.submitDisabled || props.loading || props.invalid}
                className="btn-icon-right min-w-125px"
                children={
                  props.loading ? (
                    <span className="svg-icon svg-icon-2">
                      {/* eslint-disable-next-line waldur-custom/enforce-phosphor-icon-weight */}
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
          {!props.hideStepper && props.steps.length > 1 && (
            <StepsList
              steps={props.steps}
              value={props.steps[props.step]}
              onClick={(_, index) => {
                if (!props.onStep || props.submitDisabled || props.invalid)
                  return;
                if (index > props.step) {
                  props.handleSubmit();
                  if (props.valid) {
                    props.onStep(index);
                  }
                } else {
                  props.onStep(index);
                }
              }}
            />
          )}

          <div className="content clearfix">{props.children}</div>
        </div>
      </ModalDialog>
    </form>
  );
};
