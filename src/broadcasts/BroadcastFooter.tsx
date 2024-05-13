import {
  ArrowLeft,
  ArrowRight,
  FloppyDisk,
  Share,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { createBroadcast, sendBroadcast, updateBroadcast } from './api';
import { BroadcastFormData } from './types';
import { serializeBroadcast } from './utils';

const BroadcastSaveAsTemplateDialog = lazyComponent(
  () => import('./BroadcastSaveAsTemplateDialog'),
  'BroadcastSaveAsTemplateDialog',
);

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
  const saveAsTemplate = (broadcastData) =>
    dispatch(
      openModalDialog(BroadcastSaveAsTemplateDialog, {
        dialogClassName: 'modal-dialog-centered',
        resolve: {
          refetch,
          broadcastData,
        },
        size: 'lg',
      }),
    );
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
            <span className="svg-icon svg-icon-2">
              <FloppyDisk />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsTemplate)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDisk />
            </span>{' '}
            {translate('Save as a template')}
          </Button>
          <Button onClick={() => setStep(1)} className="ms-3">
            <span className="svg-icon svg-icon-2">
              <ArrowRight />
            </span>{' '}
            {translate('Select recipients')}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setStep(0)} variant="secondary">
            <span className="svg-icon svg-icon-2">
              <ArrowLeft />
            </span>{' '}
            {translate('Back')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsDraft)}
            className="ms-3"
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDisk />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button
            disabled={disabled}
            className="ms-3"
            onClick={handleSubmit(saveAndSend)}
          >
            <span className="svg-icon svg-icon-2">
              <Share />
            </span>{' '}
            {translate('Send broadcast')}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
};
