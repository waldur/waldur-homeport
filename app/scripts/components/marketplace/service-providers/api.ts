import { getAll, get } from '@waldur/core/api';
import { Product, Provider } from '@waldur/marketplace/types';

export const getProvider = (customerUuid: string) =>
  get<Provider>(`/customers/${customerUuid}/`).then(response => response.data);

export const getProviderOfferings = (customerUuid: string) =>
  getAll<Product>(`/marketplace-offerings/`, {
    params: {
      customer_uuid: customerUuid,
    },
  });
