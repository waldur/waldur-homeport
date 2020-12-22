import { ENV } from '@waldur/configs/default';
import { getList, getSelectData } from '@waldur/core/api';
import { returnReactSelectAsyncPaginateObject } from '@waldur/core/utils';
import { Project, Customer, User } from '@waldur/workspace/types';

export const refreshSupportUsers = async (name: string) => {
  const params = name && { name: name };
  const users = await getList('/support-users/', params);
  return { options: users };
};

export const refreshUsers = async (query: string, prevOptions, { page }) => {
  const params = { full_name: query, page: page, page_size: ENV.pageSize };
  const response = await getSelectData('/users/', params);
  return returnReactSelectAsyncPaginateObject(response, prevOptions, page);
};

export const refreshCustomers = async (name: string, caller?: User) => {
  if (!caller) {
    return;
  }
  const params: Record<string, string> = {
    user_uuid: caller.uuid,
  };
  if (name) {
    params.name = name;
  }
  const customers = await getList('/customers/', params);
  return { options: customers };
};

export const refreshProjects = async (name: string, customer?: Customer) => {
  if (!customer) {
    return;
  }
  const params: Record<string, string> = {
    customer: customer.uuid,
  };
  if (name) {
    params.name = name;
  }
  const projects = await getList('/projects/', params);
  return { options: projects };
};

export const refreshResources = async (name: string, project?: Project) => {
  if (!project) {
    return;
  }

  const params: Record<string, any> = {
    project_uuid: project.uuid,
    field: ['name', 'url'],
  };
  if (name) {
    params.name = name;
  }
  const resources = await getList('/resources/', params);
  return { options: resources };
};
