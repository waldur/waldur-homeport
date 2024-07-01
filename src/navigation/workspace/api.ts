import { get } from '@waldur/core/api';

export const getGlobalCounters = () =>
  get(`/marketplace-global-categories/`).then((response) => response.data);
