import { CaretLeftIcon } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ActionButton } from '@waldur/table/ActionButton';

interface WizardButtonsProps {
  goBack(): void;
  goNext(): void;
  submitting: boolean;
  invalid: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitLabel?: string;
}

export const WizardButtons: FunctionComponent<WizardButtonsProps> = ({
  isFirstStep,
  isLastStep,
  goBack,
  goNext,
  submitting,
  invalid,
  submitLabel,
}) => (
  <>
    {!isFirstStep && (
      <ActionButton
        title={translate('Back')}
        action={goBack}
        iconNode={<CaretLeftIcon />}
        disabled={submitting}
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
      />
    ) : (
      <ActionButton
        title={translate('Next')}
        action={goNext}
        variant="primary"
        className="min-w-125px"
        disabled={invalid}
      />
    )}
  </>
);
