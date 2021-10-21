import { post, getFirst } from '@waldur/core/api';

export const getProfile = (userId) =>
  getFirst('/freeipa-profiles/', { user: userId });

export const createProfile = (username: string) =>
  post('/freeipa-profiles/', {
    username,
  });

export const enableProfile = (uuid) =>
  post(`/freeipa-profiles/${uuid}/enable/`);

export const disableProfile = (uuid) =>
  post(`/freeipa-profiles/${uuid}/disable/`);

export const syncProfile = (uuid) =>
  post(`/freeipa-profiles/${uuid}/update_ssh_keys/`);
