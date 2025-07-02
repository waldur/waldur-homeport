import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FloppyDiskIcon,
  ShareIcon,
} from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getFormValues } from 'redux-form';
import {
  broadcastMessagesCreate,
  broadcastMessagesSend,
  broadcastMessagesUpdate,
} from 'waldur-js-client';

import { formatDate } from '@waldur/core/dateUtils';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { RootState } from '@waldur/store/reducers';

import { BROADCAST_CREATE_FORM_ID } from './constants';
import { BroadcastFormData } from './types';
import { serializeBroadcast } from './utils';

const BroadcastSaveAsTemplateDialog = lazyComponent(() =>
  import('./BroadcastSaveAsTemplateDialog').then((module) => ({
    default: module.BroadcastSaveAsTemplateDialog,
  })),
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
  const formValues = useSelector<RootState, BroadcastFormData>(
    getFormValues(BROADCAST_CREATE_FORM_ID) as any,
  );

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
          await broadcastMessagesUpdate({
            path: { uuid: broadcastId },
            body: serializeBroadcast(formData),
          });
        } else {
          await broadcastMessagesCreate({ body: serializeBroadcast(formData) });
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
          response = await broadcastMessagesUpdate({
            path: { uuid: broadcastId },
            body: serializeBroadcast(formData),
          });
        } else {
          response = await broadcastMessagesCreate({
            body: serializeBroadcast(formData),
          });
        }
        if (!formValues.send_at) {
          await broadcastMessagesSend({ path: { uuid: response.data.uuid } });
        }
        await refetch();
        if (formValues.send_at) {
          dispatch(
            showSuccess(
              translate('This message will be sent on {date}.', {
                date: formatDate(formValues.send_at),
              }),
            ),
          );
        } else {
          dispatch(showSuccess(translate('Broadcast has been sent.')));
        }
        dispatch(closeModalDialog());
      } catch (e) {
        if (formValues.send_at) {
          dispatch(
            showErrorResponse(e, translate('Unable to schedule broadcast.')),
          );
        } else {
          dispatch(
            showErrorResponse(e, translate('Unable to send broadcast.')),
          );
        }
      }
    },
    [dispatch, refetch, broadcastId, formValues],
  );

  return (
    <Modal.Footer className="border-0 pt-0 gap-2">
      {step === 0 ? (
        <>
          <CloseDialogButton />
          <Button
            onClick={handleSubmit(saveAsDraft)}
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsTemplate)}
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon />
            </span>{' '}
            {translate('Save as a template')}
          </Button>
          <Button onClick={() => setStep(1)}>
            <span className="svg-icon svg-icon-2">
              <ArrowRightIcon />
            </span>{' '}
            {translate('Select recipients')}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={() => setStep(0)} variant="secondary">
            <span className="svg-icon svg-icon-2">
              <ArrowLeftIcon />
            </span>{' '}
            {translate('Back')}
          </Button>
          <Button
            onClick={handleSubmit(saveAsDraft)}
            variant="secondary"
            disabled={disabled}
          >
            <span className="svg-icon svg-icon-2">
              <FloppyDiskIcon />
            </span>{' '}
            {translate('Save as draft')}
          </Button>
          <Button disabled={disabled} onClick={handleSubmit(saveAndSend)}>
            <span className="svg-icon svg-icon-2">
              <ShareIcon />
            </span>{' '}
            {formValues.send_at
              ? translate('Schedule broadcast')
              : translate('Send now')}
          </Button>
        </>
      )}
    </Modal.Footer>
  );
};
