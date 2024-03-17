import { ENV } from '@waldur/configs/default';
import { deleteById, post, put } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { getOrganizationGroupTypesList } from '@waldur/marketplace/common/api';

export const organizationGroupTypeAutocomplete = async (
  query: string,
  prevOptions,
  { page },
) => {
  const params = {
    name: query,
    page: page,
    page_size: ENV.pageSize,
    o: 'name',
  };
  const response = await getOrganizationGroupTypesList(params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const removeOrganizationGroup = (uuid: string) =>
  deleteById('/organization-groups/', uuid);

export const createOrganizationGroup = (data) =>
  post('/organization-groups/', data);

export const updateOrganizationGroup = (uuid, data) =>
  put(`/organization-groups/${uuid}/`, data);
