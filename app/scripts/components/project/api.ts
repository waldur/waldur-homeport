import { $http, $state, $rootScope, ENV } from '@waldur/core/services';

export const createProject = project =>
  $http
    .post(`${ENV.apiEndpoint}api/projects/`, {
      name: project.name,
      description: project.description,
      customer: project.customer.url,
      type: project.type && project.type.url,
      certifications: project.certifications && project.certifications.map(item => ({ url: item.url })),
    });

export const loadCertifications = () =>
  $http
    .get(`${ENV.apiEndpoint}api/service-certifications/`)
    .then(response => response.data);

export const loadProjectTypes = () =>
  $http
    .get(`${ENV.apiEndpoint}api/project-types/`)
    .then(response => response.data);

export const gotoProjectDetails = project =>
  $state.go('project.details', {uuid: project.uuid});

export const gotoProjectList = customer =>
  $state.go('organization.projects', {uuid: customer.uuid});

export const refreshProjectList = project =>
  $rootScope.$broadcast('refreshProjectList', {
    model: project,
    new: true,
    current: true,
  });
