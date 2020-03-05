import { createFormAction } from 'redux-form-saga';

export const createIssue = createFormAction('waldur/jira/CREATE_ISSUE');
export const loadProjectIssues = createFormAction(
  'waldur/jira/LOAD_PROJECT_ISSUES',
);
export const loadProjectResources = createFormAction(
  'waldur/jira/LOAD_PROJECT_RESOURCES',
);
