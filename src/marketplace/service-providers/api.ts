import { post, put } from '@waldur/core/api';

export const createCampaign = (payload) =>
  post('/promotions-campaigns/', payload);

export const updateCampaign = (uuid, payload) =>
  put(`/promotions-campaigns/${uuid}/`, payload);
