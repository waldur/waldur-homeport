import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { deleteById, getById, getList } from '@waldur/core/api';
import { Customer, Project } from '@waldur/workspace/types';

export const getProject = (projectId: string) =>
  getById<Project>('/projects/', projectId);

export const getCustomer = (customerId: string) =>
  getById<Customer>('/customers/', customerId);

export const getCustomersList = (params) =>
  getList<Customer>('/customers/', params);

export const createProject = (project) =>
  Axios.post(`${ENV.apiEndpoint}api/projects/`, {
    name: project.name,
    description: project.description,
    customer: project.customer.url,
    type: project.type && project.type.url,
  });

export const updateProject = (project) =>
  Axios.patch(`${ENV.apiEndpoint}api/projects/${project.uuid}/`, {
    name: project.name,
    description: project.description,
  });

export const deleteCustomer = (customerId: string) =>
  deleteById('/customers/', customerId);

export const deleteProject = (projectId: string) =>
  deleteById('/projects/', projectId);

export const loadProjectTypes = () =>
  Axios.get(`${ENV.apiEndpoint}api/project-types/`).then(
    (response) => response.data,
  );

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
