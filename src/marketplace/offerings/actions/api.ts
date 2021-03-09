import { post } from '@waldur/core/api';
import { Offering } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export const loadRemoteOfferings = (api_url, token, customer_uuid) =>
  post<Offering[]>(
    '/remote-waldur-api/shared_offerings/',
    { api_url, token },
    { params: { customer_uuid } },
  ).then((response) => response.data);

export const loadRemoteOrganizations = (formData) =>
  post<Customer[]>('/remote-waldur-api/remote_customers/', formData).then(
    (response) => response.data,
  );

export const importOffering = (payload) =>
  post<{ uuid: string }>('/remote-waldur-api/import_offering/', payload);
