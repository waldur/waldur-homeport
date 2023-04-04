import { FC } from 'react';
import { Button } from 'react-bootstrap';

import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

interface FormButtonsProps {
  step;
  setStep;
  submitting;
  reset;
  finish;
  valid;
}

export const FormButtons: FC<FormButtonsProps> = ({
  step,
  setStep,
  submitting,
  reset,
  finish,
  valid,
}) => {
  return step === 1 ? (
    <>
      <CloseDialogButton className="w-150px" />
      <Button
        type="button"
        className="w-150px ms-12"
        onClick={() => valid && setStep(2)}
        disabled={!valid}
      >
        {translate('Continue')}
      </Button>
    </>
  ) : step === 2 ? (
    <>
      <Button
        variant="secondary"
        className="w-150px"
        onClick={() => setStep(1)}
      >
        {translate('Go back')}
      </Button>
      <SubmitButton
        label={translate('Send invitation')}
        submitting={submitting}
        className="btn btn-primary min-w-150px ms-12"
        disabled={!valid}
      />
    </>
  ) : step === 3 ? (
    <>
      <Button
        type="button"
        variant="secondary"
        className="w-150px ms-12"
        onClick={reset}
      >
        {translate('Send more')}
      </Button>
      <Button
        type="button"
        variant="primary"
        className="w-150px ms-12"
        onClick={() => finish()}
      >
        {translate('Close')}
      </Button>
    </>
  ) : null;
};
