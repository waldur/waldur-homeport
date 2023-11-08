import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createBroadcast, sendBroadcast, updateBroadcast } from './api';
import { BroadcastFormData } from './types';
import { serializeBroadcast } from './utils';

export const BroadcastFooter = ({
  step,
  setStep,
  handleSubmit,
  refetch,
  disabled,
  broadcastId,
}: {
  step;
  setStep;
  handleSubmit;
  refetch;
  disabled;
  broadcastId?;
}) => {
  const dispatch = useDispatch();
  const saveAsDraft = useCallback(
    async (formData: BroadcastFormData) => {
      try {
        if (broadcastId) {
          await updateBroadcast(broadcastId, serializeBroadcast(formData));
        } else {
          await createBroadcast(serializeBroadcast(formData));
        }
        await refetch();
        dispatch(
          showSuccess(translate('Broadcast has been saved as a draft.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to save broadcast.')));
      }
    },
    [dispatch, refetch, broadcastId],
  );

  const saveAndSend = useCallback(
    async (formData: BroadcastFormData) => {
      try {
        let response;
        if (broadcastId) {
          response = await updateBroadcast(
            broadcastId,
            serializeBroadcast(formData),
          );
        } else {
          response = await createBroadcast(serializeBroadcast(formData));
        }
        await sendBroadcast((response.data as { uuid: string }).uuid);
        await refetch();
        dispatch(showSuccess(translate('Broadcast has been sent.')));
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showErrorResponse(e, translate('Unable to send broadcast.')));
      }
    },
    [dispatch, refetch, broadcastId],
  );

  return (
    <Modal.Footer>
      {step === 0 ? (
        <>
          <CloseDialogButton />
          <Button
            onClick={handleSubmit(saveAsDraft)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <i className="fa fa-file-text" /> {translate('Save as draft')}
          </Button>
          <Button onClick={() => setStep(1)} className="ms-3">
            <i className="fa fa-long-arrow-right" />{' '}
            {translate('Select recipients')}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setStep(0)} variant="secondary">
            <i className="fa fa-long-arrow-left" /> {translate('Back')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsDraft)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <i className="fa fa-file-text" /> {translate('Save as draft')}
          </Button>
          <Button
            disabled={disabled}
            className="ms-3"
            onClick={handleSubmit(saveAndSend)}
          >
            <i className="fa fa-send" /> {translate('Send broadcast')}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
};
