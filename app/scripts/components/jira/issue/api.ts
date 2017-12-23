import { $http, ENV } from '@waldur/core/services';

import { JiraIssue } from './types';

export const createIssue = (issue: JiraIssue) => (
  $http.post(`${ENV.apiEndpoint}api/jira-issues/`, {
    project: issue.project.url,
    type: issue.type.url,
    summary: issue.summary,
    description: issue.description,
    impact: 'n/a',
    priority: 'n/a',
  })
);
