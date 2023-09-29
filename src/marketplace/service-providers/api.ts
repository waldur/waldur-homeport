import { post } from '@waldur/core/api';

export const createCampaign = (payload) =>
  post('/promotions-campaigns/', payload);
