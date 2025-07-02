import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

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
      <Button
        type="button"
        className="w-150px"
        onClick={() => valid && setStep(2)}
        disabled={!valid}
      >
        {translate('Continue')}
      </Button>
    </>
  ) : step === 2 ? (
    <>
      <Button
        variant="outline btn-outline-default"
        className="w-150px"
        onClick={() => setStep(1)}
      >
        <div className="svg-icon svg-icon-2">
          <CaretLeftIcon />
        </div>
        {translate('Go back')}
      </Button>
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
