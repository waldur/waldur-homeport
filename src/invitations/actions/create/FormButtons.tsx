import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ActionButton } from '@waldur/table/ActionButton';

interface FormButtonsProps {
  step;
  setStep;
  submitting;
  valid;
}

export const FormButtons: FC<FormButtonsProps> = ({
  step,
  setStep,
  submitting,
  valid,
}) => {
  return step === 1 ? (
    <>
      <CloseDialogButton className="w-150px" />
      <SubmitButton
        type="button"
        submitting={false}
        className="w-150px"
        onClick={() => valid && setStep(2)}
        disabled={!valid}
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
