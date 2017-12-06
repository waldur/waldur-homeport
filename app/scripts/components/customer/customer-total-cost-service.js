import { ENV, $http } from '@waldur/core/services';

const getEndpoint = () => `${ENV.apiEndpoint}api/billing-total-cost/`;

export const getTotal = params => $http.get(getEndpoint(), {params}).then(response => response.data.total);
