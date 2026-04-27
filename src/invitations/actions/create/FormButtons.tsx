import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';

import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ActionButton } from '@/table/ActionButton';

interface FormButtonsProps {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  submitting: boolean;
  valid: boolean;
  isCheckingDuplicates?: boolean;
  onContinueClick?: (form: any) => Promise<boolean>;
  form?: any;
}

export const FormButtons: FC<FormButtonsProps> = ({
  step,
  setStep,
  submitting,
  valid,
  isCheckingDuplicates = false,
  onContinueClick,
  form,
}) => {
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
      <SubmitButton
        type="button"
        submitting={isCheckingDuplicates}
        className="w-150px"
        onClick={handleContinue}
        disabled={!valid || isCheckingDuplicates}
        label={translate('Continue')}
      />
    </>
  ) : step === 2 ? (
    <>
      <ActionButton
        variant="tertiary"
        className="w-150px"
        action={() => setStep(1)}
        title={translate('Go back')}
        iconNode={<CaretLeftIcon weight="bold" />}
      />
      <CloseDialogButton className="ms-auto w-150px" />
      <SubmitButton
        label={translate('Send invitation')}
        submitting={submitting}
        className="btn btn-primary min-w-150px"
        disabled={!valid}
      />
    </>
  ) : null;
};
