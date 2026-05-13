import { CaretLeftIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ActionButton } from '@/table/ActionButton';

interface WizardButtonsProps {
  goBack(): void;
  goNext(): void;
  submitting: boolean;
  invalid: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitLabel?: string;
  tooltip?: string;
}

export const WizardButtons: FunctionComponent<WizardButtonsProps> = ({
  isFirstStep,
  isLastStep,
  goBack,
  goNext,
  submitting,
  invalid,
  submitLabel,
  tooltip,
}) => (
  <>
    {!isFirstStep && (
      <ActionButton
        title={translate('Back')}
        action={goBack}
        iconNode={<CaretLeftIcon weight="bold" />}
        disabled={submitting}
        disabledReason={translate('Submission in progress')}
        className="min-w-125px"
      />
    )}
    <CloseDialogButton className="ms-auto min-w-125px" disabled={submitting} />
    {isLastStep ? (
      <SubmitButton
        disabled={invalid}
        submitting={submitting}
        label={submitLabel || translate('Confirm')}
        className="btn btn-primary min-w-125px"
        data-testid="confirm-button"
      />
    ) : (
      <ActionButton
        title={translate('Next')}
        action={goNext}
        variant="primary"
        className="min-w-125px"
        disabled={invalid}
        tooltip={tooltip}
        data-testid={isFirstStep ? 'next-button-step-0' : 'next-button-step-1'}
      />
    )}
  </>
);
