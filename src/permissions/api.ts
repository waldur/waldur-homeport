import { getAll, getSelectData, post } from '@waldur/core/api';

import { GenericPermission } from './types';

export const addProjectUser = ({
  project,
  user,
  role,
  expiration_time,
}: {
  project;
  user;
  role;
  expiration_time?;
}) =>
  post(`/projects/${project}/add_user/`, {
    user,
    role,
    expiration_time,
  });

export const deleteProjectUser = ({ project, user, role }) =>
  post(`/projects/${project}/delete_user/`, {
    user,
    role,
  });

export const updateProjectUser = ({ project, user, role, expiration_time }) =>
  post(`/projects/${project}/update_user/`, {
    user,
    role,
    expiration_time,
  });

export const addCustomerUser = ({
  customer,
  user,
  role,
  expiration_time,
}: {
  customer;
  user;
  role;
  expiration_time?;
}) =>
  post(`/customers/${customer}/add_user/`, {
    user,
    role,
    expiration_time,
  });

export const deleteCustomerUser = ({ customer, user, role }) =>
  post(`/customers/${customer}/delete_user/`, {
    user,
    role,
  });

export const updateCustomerUser = ({ customer, user, role, expiration_time }) =>
  post(`/customers/${customer}/update_user/`, {
    user,
    role,
    expiration_time,
  });

export const addOfferingPermission = ({
  offering,
  user,
  role,
  expiration_time,
}) =>
  post(`/marketplace-provider-offerings/${offering}/add_user/`, {
    user,
    role,
    expiration_time,
  });

export const deleteOfferingPermission = ({ offering, user, role }) =>
  post(`/marketplace-provider-offerings/${offering}/delete_user/`, {
    user,
    role,
  });

export const updateOfferingPermission = ({
  offering,
  user,
  role,
  expiration_time,
}) =>
  post(`/marketplace-provider-offerings/${offering}/update_user/`, {
    user,
    role,
    expiration_time,
  });

export const fetchSelectCustomerUsers = (customerUuid: string, params = {}) =>
  getSelectData<GenericPermission>(`/customers/${customerUuid}/users/`, {
    field: ['user_uuid', 'user_full_name', 'user_email', 'role_name'],
    ...params,
  });

export const fetchSelectProjectUsers = (projectUuid: string, params = {}) =>
  getSelectData<GenericPermission>(`/projects/${projectUuid}/list_users/`, {
    field: ['user_uuid', 'user_full_name', 'user_email', 'role_name'],
    ...params,
  });

export const fetchAllProjectUsers = (projectId: string) =>
  getAll<GenericPermission>(`/projects/${projectId}/list_users/`, {
    params: {
      field: ['user_uuid', 'user_full_name', 'user_email', 'role_name'],
    },
  });
