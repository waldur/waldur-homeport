import { ENV } from '@waldur/configs/default';
import {
  deleteById,
  get,
  getById,
  getList,
  post,
  sendForm,
} from '@waldur/core/api';
import { formatDate } from '@waldur/core/dateUtils';
import { InvoiceSummary } from '@waldur/dashboard/types';
import { Customer, Project } from '@waldur/workspace/types';

import { OecdCode } from './types';

export const getProject = (projectId: string) =>
  getById<Project>('/projects/', projectId);

export const getCustomer = (customerId: string) =>
  getById<Customer>('/customers/', customerId);

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
  return sendForm<{ uuid }>('POST', `${ENV.apiEndpoint}api/projects/`, data);
};

export const updateProjectPartially = (
  projectUuid: string,
  values: Record<string, any>,
) => {
  const data = { ...values };
  if ('end_date' in data) {
    data.end_date = formatDate(data.end_date);
  }
  if ('oecd_fos_2007_code' in data) {
    data.oecd_fos_2007_code = data.oecd_fos_2007_code?.value;
  }
  if ('image' in data && !data.image) {
    data.image = '';
  }
  return sendForm(
    'PATCH',
    `${ENV.apiEndpoint}api/projects/${projectUuid}/`,
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

export const fetchLast12MonthProjectCosts = (projectId: string) =>
  getList<InvoiceSummary>('/invoice-items/costs/', {
    project_uuid: projectId,
    page: 1,
    page_size: 12,
  });
