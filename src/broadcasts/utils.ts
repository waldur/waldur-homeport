import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
  BroadcastMessage,
  broadcastMessagesCreate,
  broadcastMessagesSchedule,
  broadcastMessagesSend,
  broadcastMessagesUpdate,
} from 'waldur-js-client';

import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { showErrorResponse, showSuccess } from '@/store/notify';

import { BroadcastFormData, BroadcastRequestData } from './types';

type SubmitAction = 'submit' | 'template' | 'draft';

const serializeBroadcast = (
  formData: BroadcastFormData,
): BroadcastRequestData => ({
  subject: formData.subject,
  body: formData.body,
  query: {
    customers: formData.customers?.map((c) => c.uuid),
    offerings: formData.offerings?.map((c) => c.uuid),
    all_users: formData.all_users,
  },
  send_at: formData.send_at,
});

export const parseBroadcast = (
  broadcast: BroadcastMessage,
): BroadcastFormData => ({
  subject: broadcast.subject,
  body: broadcast.body,
  offerings: broadcast.query['offerings'],
  customers: broadcast.query['customers'],
  all_users: broadcast.query['all_users'],
  send_at: broadcast.send_at,
});

export const useBroadcastFormSubmit = (refetch, broadcastId = null) => {
  const dispatch = useDispatch();

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
        if (formData.send_at) {
          await broadcastMessagesSchedule({
            path: { uuid: response.data.uuid },
          });
        } else {
          await broadcastMessagesSend({ path: { uuid: response.data.uuid } });
        }
        await refetch();
        if (formData.send_at) {
          dispatch(
            showSuccess(
              translate('This message will be sent on {date}.', {
                date: formatDate(formData.send_at),
              }),
            ),
          );
        } else {
          dispatch(showSuccess(translate('Broadcast has been sent.')));
        }
        dispatch(closeModalDialog());
      } catch (e) {
        if (formData.send_at) {
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
    [dispatch, refetch, broadcastId],
  );

  const onSubmit = ({
    action,
    ...values
  }: BroadcastFormData & { action: SubmitAction }) => {
    if (action === 'submit') {
      return saveAndSend(values);
    } else if (action === 'draft') {
      return saveAsDraft(values);
    }
  };

  return onSubmit;
};
