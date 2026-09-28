import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { BaseButton } from 'waldur-ui';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';

interface FormButtonsProps {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  submitting: boolean;
  valid: boolean;
  isCheckingDuplicates?: boolean;
  onContinueClick?: (form: any) => Promise<boolean>;
  form?: any;
  actionDisabledReason?: string;
}

export const FormButtons: FC<FormButtonsProps> = ({
  step,
  setStep,
  submitting,
  valid,
  isCheckingDuplicates = false,
  onContinueClick,
  form,
  actionDisabledReason,
}) => {
  const actionDisabled = Boolean(actionDisabledReason);
  const handleContinue = useCallback(async () => {
    if (!valid) return;
    if (onContinueClick && form) {
      const canProceed = await onContinueClick(form);
      if (canProceed) setStep(2);
    } else if (!onContinueClick) {
      setStep(2);
    }
  }, [valid, onContinueClick, form, setStep]);

  return step === 1 ? (
    <>
      <CloseDialogButton className="w-150px" />
      <BaseButton
        pending={isCheckingDuplicates}
        className="w-150px"
        onClick={handleContinue}
        disabled={!valid || isCheckingDuplicates || actionDisabled}
        disabledReason={actionDisabled ? actionDisabledReason : undefined}
        label={translate('Continue')}
        variant="primary"
        size="lg"
      />
    </>
  ) : step === 2 ? (
    <>
      <BaseButton
        variant="tertiary"
        className="w-150px"
        onClick={() => setStep(1)}
        label={translate('Go back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        size="lg"
      />
      <CloseDialogButton className="ms-auto w-150px" />
      <SubmitButton
        label={translate('Send invitation')}
        submitting={submitting}
        variant="primary"
        className="min-w-150px"
        disabled={!valid || actionDisabled}
        disabledReason={actionDisabled ? actionDisabledReason : undefined}
      />
    </>
  ) : null;
};
