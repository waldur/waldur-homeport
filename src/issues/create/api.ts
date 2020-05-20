import { getList } from '@waldur/core/api';
import { Project, Customer, User } from '@waldur/workspace/types';

export const refreshSupportUsers = async (name: string) => {
  const params = name && { name: name };
  const users = await getList('/support-users/', params);
  return { options: users };
};

export const refreshUsers = (name: string) => {
  const params = name && { full_name: name };
  return getList('/users/', params).then(options => ({ options }));
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
