import { createFormAction } from 'redux-form-saga';

import { emitSignal } from '@waldur/store/coreSaga';

export const REFRESH_ISSUES_LIST = 'REFRESH_ISSUES_LIST';
export const createIssue = createFormAction('waldur/jira/CREATE_ISSUE');
export const refreshIssueList = () => emitSignal(REFRESH_ISSUES_LIST);
