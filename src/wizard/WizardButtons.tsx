import { CaretLeftIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { BaseButton } from 'waldur-ui';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

export interface WizardButtonsProps {
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
      <BaseButton
        label={translate('Back')}
        onClick={goBack}
        iconNode={<CaretLeftIcon weight="bold" />}
        disabled={submitting}
        disabledReason={translate('Submission in progress')}
        className="min-w-[var(--dialog-action-min-w)]"
        variant="tertiary"
        size="lg"
      />
    )}
    <CloseDialogButton
      className="ms-auto"
      disabled={submitting}
      disabledReason={translate('Submission in progress')}
    />
    {isLastStep ? (
      <SubmitButton
        disabled={invalid}
        submitting={submitting}
        label={submitLabel || translate('Confirm')}
        variant="primary"
        data-testid="confirm-button"
      />
    ) : (
      <BaseButton
        label={translate('Next')}
        onClick={goNext}
        variant="primary"
        className="min-w-[var(--dialog-action-min-w)]"
        disabled={invalid}
        tooltip={tooltip}
        data-testid={isFirstStep ? 'next-button-step-0' : 'next-button-step-1'}
        size="lg"
      />
    )}
  </>
);
