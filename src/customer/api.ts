import { get } from '@waldur/core/api';

export const getTotal = params =>
  get('/billing-total-cost/', params).then(response => response.data);
