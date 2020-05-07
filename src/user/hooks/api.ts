import Axios from 'axios';

import { get, post, patch } from '@waldur/core/api';

import { HookResponse } from './types';

const HOOK_ENDPOINTS = {
  email: '/hooks-email/',
  webhook: '/hooks-web/',
};

export const removeHook = (url: string) => Axios.delete(url);

export const createHook = (hookType, payload) =>
  post<HookResponse>(HOOK_ENDPOINTS[hookType], payload);

export const updateHook = (hookId, hookType, payload) =>
  patch<HookResponse>(`${HOOK_ENDPOINTS[hookType]}${hookId}/`, payload);

export const getEventGroups = () =>
  get('/events/event_groups/').then(response => response.data);
