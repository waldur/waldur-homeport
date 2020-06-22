import { getFirst } from '@waldur/core/api';

export const getProfile = (userId) =>
  getFirst('/freeipa-profiles/', { user: userId });
