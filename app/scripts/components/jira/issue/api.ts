import { $http, ENV } from '@waldur/core/services';

import { IssueCreateRequest } from './types';

export const createIssueApi = (request: IssueCreateRequest) => (
  $http.post(`${ENV.apiEndpoint}api/jira-issues/`, {
    project: request.project.url,
    type: request.type.url,
    summary: request.summary,
    description: request.description,
    impact: 'n/a',
    priority: 'n/a',
  })
);
