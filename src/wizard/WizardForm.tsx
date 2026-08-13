import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { useForm } from 'react-final-form';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { ProgressStep } from '@/wizard';

import { WizardStepIndicator } from './WizardStepIndicator';

import '@/wizard/wizard.scss';

export interface WizardFormStepProps {
  title: string;
  subtitle?: string;
  /** Label for the final step's button; steps pass it through to WizardForm. */
  submitLabel?: string;
  step: number;
  steps: ProgressStep[];
  onPrev(values?: any): void;
  onStep(step: number): void;
  data?: any;
  onCancel?(): void;
  modalProps?: any;
  hideStepper?: boolean;
}

interface WizardFormProps {
  title: string;
  subtitle?: string;
  steps: ProgressStep[];
  step: number;
  onPrev(values?: any): void;
  onStep?(step: number): void;
  submitting?: boolean;
  invalid?: boolean;
  submitDisabled?: boolean;
  submitTooltip?: string;
  submitLabel?: string;
  onCancel?(): void;
  modalProps?: any;
  hideStepper?: boolean;
  children: ReactNode;
}

export const WizardForm: FC<WizardFormProps> = ({
  children,
  submitDisabled,
  submitTooltip,
  ...props
}) => {
  const form = useForm();
  const isLast = props.step === props.steps.length - 1;

  const handleStepClick = (_step, index: number) => {
    if (index > props.step) {
      form.submit();
    } else {
      props.onStep(index);
    }
  };

  return (
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
              onClick={props.onPrev}
              type="button"
              label={translate('Back')}
              iconNode={<CaretLeftIcon weight="bold" />}
              iconOnLeft
            />
          )}
          <CloseDialogButton className="min-w-125px" />
          <SubmitButton
            disabled={props.invalid || submitDisabled}
            disabledReason={submitTooltip}
            submitting={props.submitting}
            label={
              isLast
                ? props.submitLabel || translate('Submit')
                : translate('Next')
            }
            className="min-w-125px"
            iconNode={!isLast ? <CaretRightIcon weight="bold" /> : undefined}
          />
        </>
      }
      {...(props.modalProps || {})}
    >
      <div className="wizard-big wizard-body clearfix">
        {!props.hideStepper && (
          <WizardStepIndicator
            steps={props.steps}
            value={props.steps[props.step]}
            onClick={handleStepClick}
          />
        )}
        <div className="content clearfix">{children}</div>
      </div>
    </ModalDialog>
  );
};
