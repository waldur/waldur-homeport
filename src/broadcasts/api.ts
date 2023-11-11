import { getSelectData, post, put, remove } from '@waldur/core/api';

import {
  BroadcastRequestData,
  BroadcastTemplateRequestData,
  MessageTemplate,
} from './types';

export const sendBroadcast = (uuid: string) =>
  post(`/broadcast-messages/${uuid}/send/`);

export const createBroadcast = (payload: BroadcastRequestData) =>
  post('/broadcast-messages/', payload);

export const updateBroadcast = (uuid, payload: BroadcastRequestData) =>
  put(`/broadcast-messages/${uuid}/`, payload);

export const getTemplateList = (params?: {}) =>
  getSelectData<MessageTemplate>('/broadcast-message-templates/', params);

export const createBroadcastTemplate = (
  payload: BroadcastTemplateRequestData,
) => post('/broadcast-message-templates/', payload);

export const deleteBroadcastTemplate = (uuid) =>
  remove(`/broadcast-message-templates/${uuid}/`);

export const updateBroadcastTemplate = (uuid, payload) =>
  put(`/broadcast-message-templates/${uuid}/`, payload);
