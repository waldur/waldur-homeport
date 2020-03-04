import { get, post } from '@waldur/core/api';

import { JiraIssue } from './types';

export const createIssue = (issue: JiraIssue) =>
  post('/jira-issues/', {
    jira_project: issue.project.url,
    parent: issue.parent && issue.parent.url,
    scope: issue.resource && issue.resource.url,
    priority: issue.priority.url,
    type: issue.type.url,
    summary: issue.summary,
    description: issue.description,
  });

export const loadIssues = request =>
  get('/jira-issues/', {
    params: {
      name: request.query,
      project_uuid: request.project.uuid,
      field: ['summary', 'key', 'url'],
    },
  });

export const loadResources = request =>
  get('/resources/', {
    params: {
      name: request.query,
      project_uuid: request.project.project_uuid,
      field: ['name', 'url', 'resource_type'],
    },
  });
