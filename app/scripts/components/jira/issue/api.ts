import { $http, ENV } from '@waldur/core/services';

import { JiraIssue } from './types';

const getUrl = () => `${ENV.apiEndpoint}api/jira-issues/`;

export const createIssue = (issue: JiraIssue) => (
  $http.post(getUrl(), {
    jira_project: issue.project.url,
    parent: issue.parent && issue.parent.url,
    scope: issue.resource && issue.resource.url,
    priority: issue.priority.url,
    type: issue.type.url,
    summary: issue.summary,
    description: issue.description,
  })
);

export const loadIssues = request => (
  $http.get(getUrl(), {
    params: {
      name: request.query,
      project_uuid: request.project.uuid,
      field: ['summary', 'key', 'url'],
    },
  })
);

export const loadResources = request => (
  $http.get(`${ENV.apiEndpoint}api/resources/`, {
    params: {
      name: request.query,
      project_uuid: request.project.project_uuid,
      field: ['name', 'url', 'resource_type'],
    },
  })
);
