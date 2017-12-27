import { $http, ENV } from '@waldur/core/services';

import { JiraIssue } from './types';

const getUrl = () => `${ENV.apiEndpoint}api/jira-issues/`;

export const createIssue = (issue: JiraIssue) => (
  $http.post(getUrl(), {
    project: issue.project.url,
    parent: issue.parent && issue.parent.url,
    resource: issue.resource && issue.resource.url,
    type: issue.type.url,
    summary: issue.summary,
    description: issue.description,
    impact: 'n/a',
    priority: 'n/a',
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
      field: ['name', 'url'],
    },
  })
);
