import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, ReactNode } from 'react';
import { useForm } from 'react-final-form';
import { SubmitButton } from 'waldur-form';
import { translate } from 'waldur-i18n-runtime';
import type { ProgressStep } from 'waldur-ui';
import { BaseButton } from 'waldur-ui';
import { CloseDialogButton } from 'waldur-ui';
import { ModalDialog } from 'waldur-ui';

import { WizardStepIndicator } from './WizardStepIndicator';

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
            <BaseButton
              variant="tertiary"
              className="min-w-dialog-action me-auto"
              onClick={props.onPrev}
              label={translate('Back')}
              iconNode={<CaretLeftIcon weight="bold" />}
              size="lg"
            />
          )}
          <CloseDialogButton />
          <SubmitButton
            disabled={props.invalid || submitDisabled}
            disabledReason={submitTooltip}
            submitting={props.submitting}
            label={
              isLast
                ? props.submitLabel || translate('Submit')
                : translate('Next')
            }
            iconNode={!isLast ? <CaretRightIcon weight="bold" /> : undefined}
          />
        </>
      }
      {...(props.modalProps || {})}
    >
      <div>
        {!props.hideStepper && (
          <WizardStepIndicator
            steps={props.steps}
            value={props.steps[props.step]}
            onClick={handleStepClick}
          />
        )}
        <div>{children}</div>
      </div>
    </ModalDialog>
  );
};
