import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  get,
  getAll,
  getById,
  getList,
  post,
  sendForm,
} from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { Event } from '@waldur/events/types';
import { Customer, Project } from '@waldur/workspace/types';

import { InvoiceCostSummary, OecdCode, ProjectTeamUser } from './types';

export const getProject = (projectId: string) =>
  getById<Project>('/projects/', projectId);

export const getCustomer = (customerId: string) =>
  getById<Customer>('/customers/', customerId);

export const getCustomersList = (params) =>
  getList<Customer>('/customers/', params);

export const createProject = (project) => {
  const data = {
    name: project.name,
    description: project.description,
    end_date: project.end_date ? formatDate(project.end_date) : undefined,
    customer: project.customer.url,
    type: project.type?.url,
    oecd_fos_2007_code: project.oecd_fos_2007_code?.value,
    is_industry: project.is_industry,
    image: project.image,
  };
  if (!project.image) {
    // If user tries to remove image
    data.image = '';
  } else if (!(project.image instanceof File)) {
    // if user tries to keep the current image we should not send the image key
    data.image = undefined;
  }
  return sendForm('POST', `${ENV.apiEndpoint}api/projects/`, data);
};

export const updateProject = (project) => {
  const data = {
    name: project.name,
    description: project.description,
    end_date: project.end_date ? formatDate(project.end_date) : undefined,
    backend_id: project.backend_id,
    oecd_fos_2007_code: project.oecd_fos_2007_code?.value,
    is_industry: project.is_industry,
    image: project.image,
  };
  if (!project.image) {
    data.image = '';
  } else if (!(project.image instanceof File)) {
    data.image = undefined;
  }
  return sendForm(
    'PATCH',
    `${ENV.apiEndpoint}api/projects/${project.uuid}/`,
    data,
  );
};

export const moveProject = (data) =>
  post(`/projects/${data.project.uuid}/move_project/`, {
    customer: {
      url: data.organization.url,
    },
  });

export const deleteCustomer = (customerId: string) =>
  deleteById('/customers/', customerId);

export const deleteProject = (projectId: string) =>
  deleteById('/projects/', projectId);

export const loadProjectTypes = () =>
  get<{ url; name }[]>(`/project-types/`).then((response) => response.data);

export const loadOecdCodes = () =>
  get<OecdCode[]>(`/projects/oecd_codes/`).then((response) => response.data);

export const dangerouslyUpdateProject = (cache, project) => {
  cache.name = project.name;
  cache.description = project.description;
};

export const dangerouslyUpdateCustomer = (customer, project) => {
  const item = customer.projects.find((p) => p.uuid === project.uuid);
  if (item) {
    item.name = project.name;
    item.description = project.description;
  }
};

export const fetchLatestEvents = (project: Project, size: number) =>
  getList<Event>('/events/', {
    page: 1,
    page_size: size,
    scope: project.url,
    field: ['uuid', 'created', 'event_type', 'message'],
  });

export const fetchAllProjectUsers = (projectId: string) =>
  getAll<ProjectTeamUser>(`/projects/${projectId}/users/`, {
    params: {
      field: ['uuid', 'full_name', 'email', 'role'],
    },
  });

export const fetchLast12MonthProjectCosts = (projectId: string) =>
  getList<InvoiceCostSummary>('/invoice-items/costs/', {
    project_uuid: projectId,
    page: 1,
    page_size: 12,
  });
