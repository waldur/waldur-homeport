import { deleteById } from '@waldur/core/api';
import { $http, ENV } from '@waldur/core/services';

export const createProject = project =>
  $http
    .post(`${ENV.apiEndpoint}api/projects/`, {
      name: project.name,
      description: project.description,
      customer: project.customer.url,
      type: project.type && project.type.url,
      certifications: project.certifications && project.certifications.map(item => ({ url: item.url })),
    });

export const updateProject = project =>
  $http
    .patch(`${ENV.apiEndpoint}api/projects/${project.uuid}/`, {
      name: project.name,
      description: project.description,
    });

export const deleteProject = projectId =>
  deleteById('/projects/', projectId);

export const loadCertifications = () =>
  $http
    .get(`${ENV.apiEndpoint}api/service-certifications/`)
    .then(response => response.data);

export const loadProjectTypes = () =>
  $http
    .get(`${ENV.apiEndpoint}api/project-types/`)
    .then(response => response.data);

export const dangerouslyUpdateProject = (cache, project) => {
  cache.name = project.name;
  cache.description = project.description;
};

export const dangerouslyUpdateCustomer = (customer, project) => {
  const item = customer.projects.find(p => p.uuid === project.uuid);
  if (item) {
    item.name = project.name;
    item.description = project.description;
  }
};
